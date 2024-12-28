import { Injectable } from '@nestjs/common';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { ProductImage } from 'src/domain/product-image';

interface IGetImagesByProductUseCaseProps {
  productIds: string[];
}

@Injectable()
export class GetImagesByProductUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  async execute({
    productIds,
  }: IGetImagesByProductUseCaseProps): Promise<ProductImage[]> {
    const productImagesResponse =
      await this.productImageRepository.getImagesByProductIds(productIds);

    return productImagesResponse;
  }
}
