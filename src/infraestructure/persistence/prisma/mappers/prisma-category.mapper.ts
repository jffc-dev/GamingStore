import { Prisma, Category as PrismaCategory } from '@prisma/client';
import { Category } from 'src/domain/category';

export class PrismaCategoryMapper {
  static toDomain(entity: PrismaCategory): Category {
    return new Category({
      id: entity.categoryId,
      name: entity.name,
      description: entity.description,
      isDeleted: entity.isDeleted,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPrisma(domain: Category): Prisma.CategoryUncheckedCreateInput {
    return {
      categoryId: domain.id,
      name: domain.name,
      description: domain.description,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      deletedAt: domain.deletedAt,
    };
  }
}
