import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { Product } from 'src/domain/product';

export class PrismaProductMapper {
  static toDomain(entity: PrismaProduct): Product {
    const model = new Product({
      productId: entity.productId,
      categoryId: entity.categoryId,
      name: entity.name,
      description: entity.description,
      stock: entity.stock ? parseFloat(entity.stock.toString()) : undefined,
      isActive: entity.isActive,
      price: parseFloat(entity.price.toString()),
      isDeleted: entity.isDeleted,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    });
    return model;
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      productId: product.productId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      stock: product.stock,
      isActive: product.isActive,
      price: product.price,
      isDeleted: product.isDeleted,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      deletedAt: product.deletedAt,
    };
  }
}
