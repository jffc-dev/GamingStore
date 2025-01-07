import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';
import { Product } from 'src/domain/product';

@Injectable()
export class ProductLoader {
  private readonly loader: DataLoader<string, Product>;

  constructor(
    private readonly getProductsByIdsUseCase: GetProductsByIdsUseCase,
  ) {
    this.loader = new DataLoader<string, Product>(
      (keys) => this.batchLoadFunction(keys),
      { cache: true },
    );
  }

  async batchLoadFunction(productIds: readonly string[]): Promise<Product[]> {
    const products = await this.getProductsByIdsUseCase.execute({
      productIds: [...productIds],
    });

    return this.mapResults(productIds, products);
  }

  mapResults(productIds: readonly string[], products: Product[]): Product[] {
    const productsMap = new Map<string, Product>();

    products.forEach((product) => {
      productsMap.set(product.productId, product);
    });

    return productIds.map((id) => productsMap.get(id) || null);
  }

  load(key: string): Promise<Product> {
    return this.loader.load(key);
  }
}
