import {
  Prisma,
  User as PrismaUser,
  user_roles_enum as PrismaRolesType,
} from '@prisma/client';
import { User } from 'src/domain/user';

export class PrismaUserMapper {
  static toDomain(entity: PrismaUser): User {
    const model = new User({
      id: entity.userId,
      name: entity.name,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      role: entity.role,
      resetPasswordToken: entity.resetPasswordToken,
      resetPasswordExpiresAt: entity.resetPasswordExpiresAt,
    });
    return model;
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      userId: user.id,
      name: user.name,
      role: user.role as PrismaRolesType,
      password: user.password,
      email: user.email,
      lastName: user.lastName,
      address: user.address,
      phoneNumber: user.phoneNumber,
      resetPasswordToken: user.resetPasswordToken,
      resetPasswordExpiresAt: user.resetPasswordExpiresAt,
    };
  }
}
