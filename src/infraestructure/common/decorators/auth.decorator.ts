import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';
import { UserRoleGuard } from '../guards/user-role.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function Auth(...roles: ValidRoles[]) {
  console.log(roles);
  return applyDecorators(UseGuards(JwtAuthGuard, UserRoleGuard));
}
