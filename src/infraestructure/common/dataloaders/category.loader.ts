import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { GetCategoryByProductUseCase } from 'src/application/use-cases/category/category-by-product.use-case';
import { Category } from 'src/domain/category';

@Injectable()
export class CategoryLoader {
  private readonly loader: DataLoader<string, Category>;

  constructor(
    private readonly getCategoryByProductUseCase: GetCategoryByProductUseCase,
  ) {
    this.loader = new DataLoader<string, Category>(
      (keys) => this.batchLoadFunction(keys),
      { cache: true }, // Opcional: Habilita o deshabilita el caché según tus necesidades
    );
  }

  async batchLoadFunction(categoryIds: readonly string[]): Promise<Category[]> {
    const categories = await this.getCategoryByProductUseCase.execute({
      categoryIds: [...categoryIds],
    });

    return this.mapResults(categoryIds, categories);
  }

  mapResults(
    categoryIds: readonly string[],
    categories: Category[],
  ): Category[] {
    const categoriesMap = new Map<string, Category>();

    categories.forEach((category) => {
      categoriesMap.set(category.id, category);
    });

    return categoryIds.map((id) => categoriesMap.get(id) || null);
  }

  load(key: string): Promise<Category> {
    return this.loader.load(key);
  }
}
