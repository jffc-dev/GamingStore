import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { ListProductsDto } from 'src/infraestructure/graphql/dto/product/list-products.dto';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({}: ListProductsDto): Promise<Product[]> {
    const productResponse = await this.productRepository.listProducts();

    return productResponse;
  }
}
