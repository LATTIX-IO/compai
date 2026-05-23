import { Module } from '@nestjs/common';
import { ActingUserResolver } from './acting-user.service';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeyService } from './api-key.service';
import { AuthController } from './auth.controller';
import { HybridAuthGuard } from './hybrid-auth.guard';
import { PermissionGuard } from './permission.guard';

@Module({
  controllers: [AuthController],
  providers: [
    ApiKeyService,
    ApiKeyGuard,
    HybridAuthGuard,
    PermissionGuard,
    ActingUserResolver,
  ],
  exports: [
    ApiKeyService,
    ApiKeyGuard,
    HybridAuthGuard,
    PermissionGuard,
    ActingUserResolver,
  ],
})
export class AuthModule {}
