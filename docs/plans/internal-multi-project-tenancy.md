# Internal multi-project tenancy follow-up

## What exists today

- The platform already supports **organization-level multitenancy**.
- Sessions and memberships are scoped to an `Organization`.
- RBAC permissions are organization-scoped.

## What is missing

There is no first-class `Project` model under an organization today.

Because of that, "multiple projects inside each tenant" is not a safe config-only change. It requires a data-model and permission-model expansion.

## Recommended implementation phases

1. **Introduce `Project` as a first-class model**
   - Add `Project` under `Organization`
   - Add project relations to project-owned entities
   - Keep `organizationId` as the top-level tenant boundary
2. **Add project context to membership and session state**
   - Track default/active project selection
   - Preserve organization switching separately from project switching
3. **Expand RBAC to project scope**
   - Add project-aware permission checks
   - Decide which permissions remain org-wide vs project-scoped
4. **Update routing and APIs**
   - Add project selection to app navigation
   - Scope list/detail queries by `organizationId + projectId`
5. **Backfill data safely**
   - Create a default project for each existing organization
   - Make migrations idempotent and rollback-aware

## Practical next step

Ship the current internal-deployment/auth cleanup first, then implement projects as a separate, testable feature branch. That keeps the present rollout low-risk while preserving a clean path to nested tenancy.
