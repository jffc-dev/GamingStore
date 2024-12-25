import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRepository } from 'src/application/contracts/user.repository';
import { User } from 'src/domain/user';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';

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
      const { code, meta } = error;
      if (code === 'P2002') {
        throw new Error(`${meta.target[0]} had been already registered`);
      }
    }
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      const createdUser = await this.prisma.user.findUniqueOrThrow({
        where: {
          email,
        },
      });

      return PrismaUserMapper.toDomain(createdUser);
    } catch (error) {
      const { code } = error;
      if (code === 'P2025') {
        throw new Error(`User not found`);
      }
    }
  }
}
