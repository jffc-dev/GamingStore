import { Test, TestingModule } from '@nestjs/testing';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage';
import { ProductImage } from 'src/domain/product-image';
import { GetProductImageUseCase } from './get-product-image.use-case';

describe('GetProductImageUseCase', () => {
  let getProductImageUseCase: GetProductImageUseCase;
  let productImageRepositoryMock: ProductImageRepository;
  let fileStorageServiceMock: FileStorageService;

  const mockProductImage = new ProductImage({
    productId: 'product-id',
    url: 'url',
  });
  mockProductImage.url = 'mock-image-url';

  const imageId = 'mock-image-id';
  const productId = 'mock-product-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    getProductImageUseCase = module.get<GetProductImageUseCase>(
      GetProductImageUseCase,
    );
    productImageRepositoryMock = module.get<ProductImageRepository>(
      ProductImageRepository,
    );
    fileStorageServiceMock = module.get<FileStorageService>(FileStorageService);
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
});
