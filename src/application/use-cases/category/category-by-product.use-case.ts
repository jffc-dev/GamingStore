import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';

interface ICategoryByProductUseCaseProps {
  categoryIds: string[];
}

@Injectable()
export class GetCategoryByProductUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    categoryIds,
  }: ICategoryByProductUseCaseProps): Promise<Category[]> {
    const categoriesResponse =
      await this.categoryRepository.getCategoriesByIds(categoryIds);

    return categoriesResponse;
  }
}
