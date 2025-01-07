import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';
import { Prisma } from '@prisma/client';
import { User } from 'src/domain/user';

@Injectable()
export class PrismaLikeProductRepository implements LikeProductRepository {
  constructor(private prisma: PrismaService) {}

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

  async findLastUserWhoLikedProductAndDidNotPurchase(
    productId: string,
  ): Promise<User | null> {
    try {
      const [user] = await this.prisma.$queryRaw<User[]>(
        Prisma.sql`
        
        SELECT USE.*
        FROM product PRO
        INNER JOIN product_like PLI ON PLI.product_id = PRO.product_id
        INNER JOIN customer_user USE ON USE.user_id = PLI.user_id
        INNER JOIN order_detail ODE ON PRO.product_id = ODE.product_id
        LEFT JOIN "order" ORD ON ORD.order_id = ODE.order_id AND ORD.user_id = USE.user_id
        WHERE PRO.product_id = ${productId}::UUID AND ORD.order_id IS NULL
        ORDER BY PLI.created_at DESC
        LIMIT 1;
        
      `,
      );

      return user || null;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    const { meta = {} } = error;
    meta.action = action;

    throw error;
  }
}
