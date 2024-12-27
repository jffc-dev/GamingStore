import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from 'src/domain/user';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('asd');
    const validRoles: string[] = this.reflector.get(
      'roles',
      context.getHandler(),
    );
    if (!validRoles) return true;
    if (validRoles.length === 0) return true;
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    if (!user) throw new BadRequestException('User not found');

    if (validRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(`User needs a valid role`);
  }
}
