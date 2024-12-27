import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { DeleteProductDto } from 'src/infraestructure/graphql/dto/product/delete-product.dto';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({ productId }: DeleteProductDto): Promise<boolean> {
    const deleteResponse =
      await this.productRepository.softDeleteProductById(productId);

    return deleteResponse;
  }
}
