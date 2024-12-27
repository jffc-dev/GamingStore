import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';

interface IAvailableProductUseCaseProps {
  productId: string;
  isActive: boolean;
}
@Injectable()
export class AvailableProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute({
    productId,
    isActive,
  }: IAvailableProductUseCaseProps): Promise<any> {
    //TODO: improve update dto
    const product = new Product({
      isActive,
    } as any);

    const productResponse = await this.productRepository.updateProduct(
      productId,
      product,
    );

    return productResponse;
  }
}
