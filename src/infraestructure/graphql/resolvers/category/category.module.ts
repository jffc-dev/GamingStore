import { Module } from '@nestjs/common';
import { CategoryResolver } from './category.resolver';
import { GetCategoriesUseCase } from 'src/application/use-cases/category/get-categories.use-case';

@Module({
  providers: [GetCategoriesUseCase, CategoryResolver],
})
export class CategoryModule {}
