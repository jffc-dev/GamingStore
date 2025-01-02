import { Test } from '@nestjs/testing';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { ProductImage } from 'src/domain/product-image';
import { GetImagesByProductUseCase } from './images-by-product.use-case';

describe('GetImagesByProductUseCase', () => {
  let useCase: GetImagesByProductUseCase;
  let productImageRepository: jest.Mocked<ProductImageRepository>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetImagesByProductUseCase,
        {
          provide: ProductImageRepository,
          useValue: {
            getImagesByProductIds: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetImagesByProductUseCase>(
      GetImagesByProductUseCase,
    );
    productImageRepository = moduleRef.get(ProductImageRepository);
  });

  it('should get images by product ids successfully', async () => {
    const productIds = ['product-1', 'product-2'];
    const mockImages: ProductImage[] = [
      { id: 'image-1', productId: 'product-1', url: 'url-1' } as ProductImage,
      { id: 'image-2', productId: 'product-2', url: 'url-2' } as ProductImage,
    ];

    productImageRepository.getImagesByProductIds.mockResolvedValue(mockImages);

    const result = await useCase.execute({ productIds });

    expect(productImageRepository.getImagesByProductIds).toHaveBeenCalledWith(
      productIds,
    );
    expect(result).toEqual(mockImages);
  });

  it('should return empty array when no images found', async () => {
    const productIds = ['product-1'];
    productImageRepository.getImagesByProductIds.mockResolvedValue([]);

    const result = await useCase.execute({ productIds });

    expect(productImageRepository.getImagesByProductIds).toHaveBeenCalledWith(
      productIds,
    );
    expect(result).toEqual([]);
  });

  it('should throw error when repository fails', async () => {
    const productIds = ['product-1'];
    productImageRepository.getImagesByProductIds.mockRejectedValue(
      new Error('Repository error'),
    );

    await expect(useCase.execute({ productIds })).rejects.toThrow(
      'Repository error',
    );
  });
});
