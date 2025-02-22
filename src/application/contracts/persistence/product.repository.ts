import { IListProductsUseCaseProps } from 'src/application/use-cases/product/list-products.use-case';
import { Product } from 'src/domain/product';

export abstract class ProductRepository {
  abstract create(data: Product): Promise<Product>;
  abstract listProducts(): Promise<Product[]>;
  abstract softDeleteProductById(productId: string): Promise<boolean>;
  abstract updateProduct(productId: string, data: Product): Promise<Product>;
  abstract getProductById(productId: string): Promise<Product | null>;
  abstract getProductByIdOrThrow(productId: string): Promise<Product>;
  abstract filterProducts(dto: IListProductsUseCaseProps): Promise<Product[]>;
  abstract getProductsByIds(productIds: string[]): Promise<Product[]>;

  abstract handleDBError(error: any): void;
}
