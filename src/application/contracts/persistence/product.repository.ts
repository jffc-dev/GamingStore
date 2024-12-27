import { Product } from 'src/domain/product';

export abstract class ProductRepository {
  abstract create(data: Product): Promise<Product>;
  abstract listProducts(): Promise<Product[]>;
  abstract softDeleteProductById(productId: string): Promise<boolean>;
  abstract updateProduct(productId: string, data: Product): Promise<Product>;
  abstract getProductById(productId: string): Promise<Product>;

  abstract handleDBError(error: any): void;
}
