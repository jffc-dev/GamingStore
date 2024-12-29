import { Category } from 'src/domain/category';

export abstract class CategoryRepository {
  abstract getCategories(): Promise<Category[]>;

  abstract handleDBError(error: any): void;
}
