import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';

@Injectable()
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    const productResponse = await this.categoryRepository.getCategories();

    return productResponse;
  }
}
