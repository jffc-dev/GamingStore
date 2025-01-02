import { Test } from '@nestjs/testing';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage';
import { BadRequestException } from '@nestjs/common';
import { ProductImage } from 'src/domain/product-image';
import { GetProductImageUseCase } from './get-product-image.use-case';

describe('GetProductImageUseCase', () => {
  let getProductImageUseCase: jest.Mocked<GetProductImageUseCase>;
  let productImageRepositoryMock: jest.Mocked<ProductImageRepository>;
  let fileStorageServiceMock: jest.Mocked<FileStorageService>;

  const mockProductImage = new ProductImage();
  mockProductImage.url = 'mock-image-url';

  const imageId = 'mock-image-id';
  const productId = 'mock-product-id';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetProductImageUseCase,
        {
          provide: ProductImageRepository,
          useValue: {
            getProductImageById: jest.fn().mockResolvedValue(mockProductImage),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            getFilePath: jest.fn().mockResolvedValue('mock-file-path'),
          },
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(getProductImageUseCase).toBeDefined();
  });

  it('should return product image with the correct file path', async () => {
    const result = await getProductImageUseCase.execute({
      imageId,
      productId,
    });

    expect(result).toBeDefined();
    expect(result.url).toBe('mock-file-path');
    expect(productImageRepositoryMock.getProductImageById).toHaveBeenCalledWith(
      imageId,
      productId,
    );
    expect(fileStorageServiceMock.getFilePath).toHaveBeenCalledWith(
      mockProductImage.url,
    );
  });

  it('should throw BadRequestException if the product image is not found', async () => {
    productImageRepositoryMock.getProductImageById.mockResolvedValue(null);

    await expect(
      getProductImageUseCase.execute({
        imageId,
        productId,
      }),
    ).rejects.toThrowError(BadRequestException);

    expect(productImageRepositoryMock.getProductImageById).toHaveBeenCalledWith(
      imageId,
      productId,
    );
  });

  it('should throw an error if file storage service fails', async () => {
    fileStorageServiceMock.getFilePath.mockResolvedValue(new Error());

    await expect(
      getProductImageUseCase.execute({
        imageId,
        productId,
      }),
    ).rejects.toThrowError('File not found');

    expect(productImageRepositoryMock.getProductImageById).toHaveBeenCalledWith(
      imageId,
      productId,
    );
  });
});
