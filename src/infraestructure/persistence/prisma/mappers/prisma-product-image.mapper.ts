import { Prisma, ProductImage as PrismaProductImage } from '@prisma/client';
import { ProductImage } from 'src/domain/product-image';

export class PrismaProductImageMapper {
  static toDomain(entity: PrismaProductImage): ProductImage {
    return new ProductImage({
      id: entity.productImageId,
      productId: entity.productId,
      url: entity.url,
      createdAt: entity.createdAt,
    });
  }

  static toPrisma(
    productImage: ProductImage,
  ): Prisma.ProductImageUncheckedCreateInput {
    return {
      productImageId: productImage.id,
      productId: productImage.productId,
      url: productImage.url,
      createdAt: productImage.createdAt,
    };
  }
}
