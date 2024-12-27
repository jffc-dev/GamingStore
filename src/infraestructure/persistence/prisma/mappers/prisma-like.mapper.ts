import { Prisma, ProductLike as PrismaProductLike } from '@prisma/client';
import { LikeProduct } from 'src/domain/like-product';

export class PrismaLikeProductMapper {
  static toDomain(entity: PrismaProductLike): LikeProduct {
    return new LikeProduct({
      userId: entity.userId,
      productId: entity.productId,
      createdAt: entity.createdAt,
    });
  }

  static toPrisma(
    LikeProduct: LikeProduct,
  ): Prisma.ProductLikeUncheckedCreateInput {
    return {
      userId: LikeProduct.userId,
      productId: LikeProduct.productId,
      createdAt: LikeProduct.createdAt,
    };
  }
}
