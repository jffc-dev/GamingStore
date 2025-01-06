import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';

interface GetProductsByIdsUseCaseProps {
  productIds: string[];
}
@Injectable()
export class GetProductsByIdsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({
    productIds,
  }: GetProductsByIdsUseCaseProps): Promise<Product[]> {
    const productsResponse =
      await this.productRepository.getProductsByIds(productIds);

    return productsResponse;
  }
}
