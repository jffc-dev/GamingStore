import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { GetProductDto } from 'src/infraestructure/graphql/dto/product/get-product.dto';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ productId }: GetProductDto): Promise<any> {
    const productResponse =
      await this.productRepository.getProductById(productId);

    return productResponse;
  }
}
