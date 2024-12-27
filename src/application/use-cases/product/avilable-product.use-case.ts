import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const validateProduct =
      await this.productRepository.getProductById(productId);

    if (!validateProduct) {
      throw new NotFoundException('Not found product');
    }

    if (validateProduct.isActive === isActive) {
      throw new BadRequestException(
        `Product is already ${isActive ? 'enabled' : 'disabled'}`,
      );
    }

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
