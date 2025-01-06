import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { Prisma } from '@prisma/client';
import { ACTION_CREATE, ACTION_FIND } from 'src/application/utils/constants';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const data = PrismaUserMapper.toPrisma(user);

    try {
      const createdUser = await this.prisma.user.create({
        data,
      });

      return PrismaUserMapper.toDomain(createdUser);
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const foundUser = await this.prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });

      return PrismaUserMapper.toDomain(foundUser);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async findUserByResetToken(resetToken: string): Promise<User | null> {
    try {
      const foundUser = await this.prisma.user.findUniqueOrThrow({
        where: {
          resetPasswordToken: resetToken,
        },
      });

      if (!foundUser) return null;

      return PrismaUserMapper.toDomain(foundUser);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async updateUserById(id: string, user: User): Promise<User> {
    try {
      const data = PrismaUserMapper.toPrisma(user);

      const updatedUser = await this.prisma.user.update({
        where: {
          userId: id,
        },
        data: {
          ...data,
        },
      });

      return PrismaUserMapper.toDomain(updatedUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findOneById(id: string): Promise<User | null> {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: {
          userId: id,
        },
      });

      if (!foundUser) return null;

      return PrismaUserMapper.toDomain(foundUser);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    const { code, meta = {} } = error;
    meta.action = action;

    // TODO: IMPROVE THIS
    if (code === 'P2002') {
      throw error;
    } else if (code === 'P2025') {
      throw error;
    }

    throw error;
  }
}
