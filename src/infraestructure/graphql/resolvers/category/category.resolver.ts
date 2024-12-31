import { Query, Resolver } from '@nestjs/graphql';
import { GetCategoriesUseCase } from 'src/application/use-cases/category/get-categories.use-case';
import { Category } from '../../entities/category.entity';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly getCategoriesUseCase: GetCategoriesUseCase) {}

  @Query(() => [Category], { name: 'categories' })
  async findAll(): Promise<Category[]> {
    const categories = await this.getCategoriesUseCase.execute();
    return categories.map(Category.fromDomainToEntity);
  }
}
