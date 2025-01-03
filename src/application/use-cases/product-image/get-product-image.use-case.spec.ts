import { Test, TestingModule } from '@nestjs/testing';
import { GetProductImageUseCase } from './get-product-image.use-case';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage';
import { ProductImage } from 'src/domain/product-image';

describe('GetProductImageUseCase', () => {
  let useCase: GetProductImageUseCase;
  let productImageRepository: jest.Mocked<ProductImageRepository>;

  const mockProductImageProps = {
    id: 'image-123',
    productId: 'product-456',
    url: 'original/path/image.jpg',
    createdAt: new Date(),
  };

  const mockSignedUrl = 'https://cdn.example.com/signed-url/image.jpg';

  const mockFileStorageService = {
    getFilePath: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductImageUseCase,
        {
          provide: ProductImageRepository,
          useValue: {
            getProductImageById: jest.fn(),
          },
        },
        {
          provide: FileStorageService,
          useValue: mockFileStorageService,
        },
      ],
    }).compile();

    useCase = module.get<GetProductImageUseCase>(GetProductImageUseCase);
    productImageRepository = module.get(ProductImageRepository);

    productImageRepository.getProductImageById.mockResolvedValue(
      new ProductImage({ ...mockProductImageProps }),
    );
    mockFileStorageService.getFilePath.mockResolvedValue(mockSignedUrl);
  });

  describe('execute', () => {
    it('should successfully get a product image with signed URL', async () => {
      const params = {
        imageId: mockProductImageProps.id,
        productId: mockProductImageProps.productId,
      };

      const result = await useCase.execute(params);

      expect(productImageRepository.getProductImageById).toHaveBeenCalledWith(
        params.imageId,
        params.productId,
      );

      expect(result.url).toEqual(mockSignedUrl);
    });

    it('should throw error when product image is not found', async () => {
      productImageRepository.getProductImageById.mockRejectedValue(
        new Error('Product image not found'),
      );

      const params = {
        imageId: 'non-existent-image',
        productId: 'non-existent-product',
      };

      await expect(useCase.execute(params)).rejects.toThrow(
        'Product image not found',
      );
    });

    it('should throw error when file storage service fails', async () => {
      mockFileStorageService.getFilePath.mockRejectedValue(
        new Error('Failed to generate signed URL'),
      );

      const params = {
        imageId: mockProductImageProps.id,
        productId: mockProductImageProps.productId,
      };

      await expect(useCase.execute(params)).rejects.toThrow(
        'Failed to generate signed URL',
      );
    });

    it('should pass the correct URL to file storage service', async () => {
      const customMockImage = {
        ...mockProductImageProps,
        url: 'custom/path/special-image.png',
      };

      productImageRepository.getProductImageById.mockResolvedValue(
        new ProductImage({ ...customMockImage }),
      );

      const params = {
        imageId: customMockImage.id,
        productId: customMockImage.productId,
      };

      await useCase.execute(params);

      expect(mockFileStorageService.getFilePath).toHaveBeenCalledWith(
        'custom/path/special-image.png',
      );
    });
  });
});
