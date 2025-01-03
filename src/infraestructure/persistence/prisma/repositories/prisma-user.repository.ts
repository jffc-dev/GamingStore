import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';

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
      this.handleDBError(error);
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
      this.handleDBError(error);
    }
  }

  async findUserByResetToken(resetToken: string): Promise<User | null> {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: {
          resetPasswordToken: resetToken,
        },
      });

      if (!foundUser) return null;

      return PrismaUserMapper.toDomain(foundUser);
    } catch (error) {
      this.handleDBError(error);
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

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2002') {
      throw new NotAcceptableException(
        `${meta.target[0]} had been already registered`,
      );
    }

    throw new InternalServerErrorException(error.message);
  }
}
