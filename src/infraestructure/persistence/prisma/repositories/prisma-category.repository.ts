import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';
import { PrismaCategoryMapper } from '../mappers/prisma-category.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private prisma: PrismaService) {}

  async getCategoriesByIds(categoriesId: string[]): Promise<Category[]> {
    try {
      const productImages = await this.prisma.category.findMany({
        where: {
          categoryId: { in: categoriesId },
        },
      });

      return productImages.map(PrismaCategoryMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          isDeleted: false,
        },
      });

      return categories.map(PrismaCategoryMapper.toDomain);
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
