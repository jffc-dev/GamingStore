import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage.interface';
import { ProductImage } from 'src/domain/product-image';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';

interface ICreateProductImageUseCaseProps {
  productId: string;
  file: Express.Multer.File;
}

@Injectable()
export class CreateProductImageUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly uuidService: UuidService,
  ) {}

  async execute({
    file,
    productId,
  }: ICreateProductImageUseCaseProps): Promise<ProductImage> {
    const validFile = this.fileStorageService.validateFile(file);
    if (!validFile) {
      throw new BadRequestException('Invalid file');
    }

    const imageId = this.uuidService.generateUuid();
    const path = await this.fileStorageService.uploadFile(file, imageId);

    const productImage = new ProductImage({
      productId,
      url: path,
      id: imageId,
    });
    const productImageResponse =
      await this.productImageRepository.createProductImage(productImage);

    return productImageResponse;
  }
}
