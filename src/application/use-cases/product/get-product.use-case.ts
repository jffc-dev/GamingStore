import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { GetProductDto } from 'src/infraestructure/graphql/dto/product/get-product.dto';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ productId }: GetProductDto): Promise<Product> {
    const productResponse =
      await this.productRepository.getProductById(productId);

    return productResponse;
  }
}
