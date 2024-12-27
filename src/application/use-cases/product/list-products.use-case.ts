import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';

export interface IFilterProducts {
  isActive?: boolean;
}
interface IListProductsUseCaseProps {
  filters: IFilterProducts;
}

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ filters }: IListProductsUseCaseProps): Promise<Product[]> {
    const productResponse =
      await this.productRepository.filterProducts(filters);

    return productResponse;
  }
}
