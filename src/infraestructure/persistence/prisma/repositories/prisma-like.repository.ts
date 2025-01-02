import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';
import { User } from 'src/domain/user';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { User as PrismaUser, user_roles_enum } from '@prisma/client';

type UserRawResult = {
  userId: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role: user_roles_enum;
  resetPasswordToken: string | null;
  resetPasswordExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean;
  address: string | null;
  phoneNumber: string | null;
};

@Injectable()
export class PrismaLikeProductRepository implements LikeProductRepository {
  constructor(private prisma: PrismaService) {}

  async findLastUserWhoLikedButNotPurchased(
    productId: string,
  ): Promise<User | null> {
    const result = await this.prisma.$queryRaw<UserRawResult[]>`
        SELECT 
          u.user_id as "userId",
          u.name,
          u.last_name as "lastName",
          u.email,
          u.password,
          u.role,
          u.reset_password_token as "resetPasswordToken",
          u.reset_password_expires_at as "resetPasswordExpiresAt",
          u.address,
          u.phone_number as "phoneNumber"
        FROM "User" u
        JOIN "Like" l ON l.user_id = u.user_id
        LEFT JOIN "Order" o ON o.user_id = u.user_id 
          AND o.product_id = ${productId}
        WHERE l.product_id = ${productId}
          AND o.id IS NULL
        ORDER BY l.created_at DESC
        LIMIT 1
      `;

    if (!result.length) return null;

    const processedResult: PrismaUser = {
      ...result[0],
      createdAt: new Date(result[0].createdAt),
      updatedAt: new Date(result[0].updatedAt),
      deletedAt: result[0].deletedAt ? new Date(result[0].deletedAt) : null,
      resetPasswordExpiresAt: result[0].resetPasswordExpiresAt
        ? new Date(result[0].resetPasswordExpiresAt)
        : null,
    };

    return PrismaUserMapper.toDomain(processedResult);
  }

  async likeProduct(likeProduct: LikeProduct): Promise<LikeProduct> {
    try {
      const upsertedLike = await this.prisma.productLike.upsert({
        where: {
          productId_userId: {
            productId: likeProduct.productId,
            userId: likeProduct.userId,
          },
        },
        create: {
          userId: likeProduct.userId,
          productId: likeProduct.productId,
        },
        update: {},
      });

      return PrismaLikeProductMapper.toDomain(upsertedLike);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getLikedProducts(userId: string): Promise<LikeProduct[]> {
    try {
      const likedProducts = await this.prisma.productLike.findMany({
        where: {
          userId,
        },
      });

      return likedProducts.map(PrismaLikeProductMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new NotFoundException(`Like not found`);
    } else if (code === 'P2002') {
      throw new NotAcceptableException(
        `${meta.target[0]} had been already registered`,
      );
    }

    throw new InternalServerErrorException(error);
  }
}
