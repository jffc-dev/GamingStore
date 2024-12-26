import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { ListProductsDto } from 'src/infraestructure/graphql/dto/product/list-products.dto';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({}: ListProductsDto): Promise<any> {
    const productResponse = await this.productRepository.listProducts();

    return productResponse;
  }
}
