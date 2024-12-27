import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';

@Injectable()
export class PrismaLikeProductRepository implements LikeProductRepository {
  constructor(private prisma: PrismaService) {}

  async likeProduct(likeProduct: LikeProduct): Promise<LikeProduct> {
    try {
      const createdCartDetail = await this.prisma.productLike.upsert({
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

      return PrismaLikeProductMapper.toDomain(createdCartDetail);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new Error(`Product not found`);
    } else if (code === 'P2002') {
      throw new Error(`${meta.target[0]} had been already registered`);
    }

    throw new Error(`Internal server error`);
  }
}
