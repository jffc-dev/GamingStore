import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';
import { Prisma } from '@prisma/client';

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

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    const { meta = {} } = error;
    meta.action = action;

    throw error;
  }
}
