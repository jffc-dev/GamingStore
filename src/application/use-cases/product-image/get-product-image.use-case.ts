import { Injectable } from '@nestjs/common';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage.interface';
import { ProductImage } from 'src/domain/product-image';

interface IGetProductImageUseCaseProps {
  imageId: string;
  productId: string;
}

@Injectable()
export class GetProductImageUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async execute({
    imageId,
    productId,
  }: IGetProductImageUseCaseProps): Promise<ProductImage> {
    const productImageResponse =
      await this.productImageRepository.getProductImageById(imageId, productId);

    const imagePath = await this.fileStorageService.getFilePath(
      productImageResponse.url,
    );

    productImageResponse.url = imagePath;

    return productImageResponse;
  }
}
