import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';
import { PrismaCategoryMapper } from '../mappers/prisma-category.mapper';

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

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new NotFoundException(`Category not found`);
    } else if (code === 'P2002') {
      throw new NotAcceptableException(
        `${meta.target[0]} had been already registered`,
      );
    }

    throw new InternalServerErrorException(error);
  }
}
