import type {
  AccessControl,
  AuthorizeResponse,
  Role,
  Statements,
  Subset,
} from 'better-auth/plugins/access';

type ResourceRequest =
  | readonly string[]
  | {
      actions: readonly string[];
      connector?: 'OR' | 'AND';
    };

type AccessRequest = Record<string, ResourceRequest>;

function isActionObject(
  request: ResourceRequest,
): request is Extract<ResourceRequest, { actions: readonly string[] }> {
  return !Array.isArray(request);
}

function createRole<TStatements extends Statements>(statements: TStatements): Role<TStatements> {
  return {
    authorize(request: AccessRequest, connector: 'OR' | 'AND' = 'AND'): AuthorizeResponse {
      let success = false;

      for (const [requestedResource, requestedActions] of Object.entries(request)) {
        const allowedActions = statements[requestedResource];

        if (!allowedActions) {
          return {
            success: false,
            error: `You are not allowed to access resource: ${requestedResource}`,
          };
        }

        if (Array.isArray(requestedActions)) {
          success = requestedActions.every((requestedAction) =>
            allowedActions.includes(requestedAction),
          );
        } else if (isActionObject(requestedActions)) {
          const { actions, connector: requestConnector = 'AND' } = requestedActions;
          success =
            requestConnector === 'OR'
              ? actions.some((requestedAction) => allowedActions.includes(requestedAction))
              : actions.every((requestedAction) => allowedActions.includes(requestedAction));
        } else {
          throw new Error('Invalid access control request');
        }

        if (success && connector === 'OR') {
          return { success };
        }

        if (!success && connector === 'AND') {
          return {
            success: false,
            error: `unauthorized to access resource "${requestedResource}"`,
          };
        }
      }

      if (success) {
        return { success };
      }

      return {
        success: false,
        error: 'Not authorized',
      };
    },
    statements,
  };
}

export function createAccessControl<TStatements extends Statements>(
  statements: TStatements,
): AccessControl<TStatements> {
  return {
    newRole<K extends keyof TStatements>(roleStatements: Subset<K, TStatements>) {
      return createRole(roleStatements);
    },
    statements,
  };
}

export const defaultStatements = {
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
} as const satisfies Statements;

const defaultAc = createAccessControl(defaultStatements);

export const adminAc = defaultAc.newRole({
  organization: ['update'],
  invitation: ['create', 'cancel'],
  member: ['create', 'update', 'delete'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
});

export const ownerAc = defaultAc.newRole({
  organization: ['update', 'delete'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
  team: ['create', 'update', 'delete'],
  ac: ['create', 'read', 'update', 'delete'],
});