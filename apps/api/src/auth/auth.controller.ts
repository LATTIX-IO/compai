import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { db } from '@db';
import type { Request, Response } from 'express';
import { auth, isTrustedOrigin } from './auth.server';
import { OrganizationId } from './auth-context.decorator';
import { PermissionGuard } from './permission.guard';
import { RequirePermission } from './require-permission.decorator';
import { AuthContext } from './auth-context.decorator';
import { HybridAuthGuard } from './hybrid-auth.guard';
import { SkipOrgCheck } from './skip-org-check.decorator';
import type { AuthContext as AuthContextType } from './types';
import {
  buildPortalBridgeContentSecurityPolicy,
  buildPortalBridgeHtml,
  normalizePortalBridgeOrigin,
  normalizePortalBridgePath,
} from './portal-bridge';

@ApiExcludeController()
@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
@UseGuards(HybridAuthGuard)
@ApiSecurity('apikey')
export class AuthController {
  @Get('portal-bridge')
  @SkipOrgCheck()
  @ApiOperation({ summary: 'Bridge an authenticated API session into a trusted portal origin' })
  async bridgePortalSession(
    @Query('portal_origin') portalOrigin: string | undefined,
    @Query('next') nextPath: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!portalOrigin) {
      throw new BadRequestException('portal_origin is required.');
    }

    let normalizedPortalOrigin: string;

    try {
      normalizedPortalOrigin = normalizePortalBridgeOrigin(portalOrigin);
    } catch {
      throw new BadRequestException('portal_origin must be a valid absolute URL.');
    }

    const trustedPortalOrigin = await isTrustedOrigin(normalizedPortalOrigin);
    if (!trustedPortalOrigin) {
      throw new ForbiddenException('portal_origin is not trusted.');
    }

    const headers = new Headers();
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    const authorizationHeader = req.headers.authorization;
    if (authorizationHeader) {
      headers.set(
        'authorization',
        Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader,
      );
    }

    const session = await auth.api.getSession({ headers });
    const sessionToken = session?.session?.token;
    if (!session || !sessionToken) {
      throw new ForbiddenException('No active session available to bridge.');
    }

    const portalSessionUrl = new URL('/api/auth/portal-session', normalizedPortalOrigin).toString();
    const responseHtml = buildPortalBridgeHtml({
      portalSessionUrl,
      sessionToken,
      expiresAt: session.session.expiresAt?.toISOString(),
      nextPath: normalizePortalBridgePath(nextPath),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader(
      'Content-Security-Policy',
      buildPortalBridgeContentSecurityPolicy(normalizedPortalOrigin),
    );
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.send(responseHtml);
  }

  @Get('me')
  @SkipOrgCheck()
  @ApiOperation({
    summary: 'Get current user info, organizations, and pending invitations',
  })
  async getMe(@AuthContext() authContext: AuthContextType) {
    const userId = authContext.userId;
    if (!userId) {
      return { user: null, organizations: [], pendingInvitation: null };
    }

    const [user, memberships, pendingInvitation] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
        },
      }),
      db.member.findMany({
        where: { userId, isActive: true, deactivated: false },
        select: {
          id: true,
          role: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              logo: true,
              onboardingCompleted: true,
              hasAccess: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.invitation.findFirst({
        where: {
          email: authContext.userEmail ?? '',
          status: 'pending',
        },
        select: { id: true },
      }),
    ]);

    return {
      user,
      organizations: memberships.map((m) => ({
        ...m.organization,
        memberRole: m.role,
        memberId: m.id,
      })),
      pendingInvitation,
    };
  }

  @Get('invitations')
  @UseGuards(PermissionGuard)
  @RequirePermission('member', 'read')
  @ApiOperation({ summary: 'List pending invitations for the organization' })
  async listInvitations(@OrganizationId() organizationId: string) {
    const invitations = await db.invitation.findMany({
      where: { organizationId, status: 'pending' },
      orderBy: { email: 'asc' },
    });

    return { data: invitations };
  }

  @Delete('invitations/:id')
  @UseGuards(PermissionGuard)
  @RequirePermission('member', 'delete')
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  async deleteInvitation(
    @Param('id') invitationId: string,
    @OrganizationId() organizationId: string,
  ) {
    const invitation = await db.invitation.findFirst({
      where: { id: invitationId, organizationId, status: 'pending' },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already accepted.');
    }

    await db.invitation.delete({ where: { id: invitationId } });

    return { success: true };
  }
}
