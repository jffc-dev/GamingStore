import { Test, TestingModule } from '@nestjs/testing';
import { ImagesByProductLoader } from './images-by-product.loader';
import { GetImagesByProductUseCase } from 'src/application/use-cases/product-image/images-by-product.use-case';
import { ProductImage } from 'src/domain/product-image';

describe('ImagesByProductLoader', () => {
  let loader: ImagesByProductLoader;
  let getImagesByProductUseCase: GetImagesByProductUseCase;

  const mockImages: ProductImage[] = [
    new ProductImage({
      id: 'image-1',
      url: 'http://example.com/1.jpg',
      productId: 'product-1',
      createdAt: new Date('2024-01-01'),
    }),
    new ProductImage({
      id: 'image-2',
      url: 'http://example.com/2.jpg',
      productId: 'product-1',
      createdAt: new Date('2024-01-02'),
    }),
    new ProductImage({
      id: 'image-3',
      url: 'http://example.com/3.jpg',
      productId: 'product-2',
      createdAt: new Date('2024-01-03'),
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesByProductLoader,
        {
          provide: GetImagesByProductUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    loader = module.get<ImagesByProductLoader>(ImagesByProductLoader);
    getImagesByProductUseCase = module.get<GetImagesByProductUseCase>(
      GetImagesByProductUseCase,
    );
  });

  describe('load', () => {
    it('should load images for a single product successfully', async () => {
      const productImages = mockImages.filter(
        (img) => img.productId === 'product-1',
      );
      jest
        .spyOn(getImagesByProductUseCase, 'execute')
        .mockResolvedValue(productImages);

      const result = await loader.load('product-1');

      expect(result).toHaveLength(2);
      expect(getImagesByProductUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1'],
      });
    });

    it('should return empty array for product with no images', async () => {
      jest.spyOn(getImagesByProductUseCase, 'execute').mockResolvedValue([]);

      const result = await loader.load('non-existent-product');

      expect(result).toEqual([]);
      expect(getImagesByProductUseCase.execute).toHaveBeenCalledWith({
        productIds: ['non-existent-product'],
      });
    });

    it('should batch multiple loads into a single request', async () => {
      jest
        .spyOn(getImagesByProductUseCase, 'execute')
        .mockResolvedValue(mockImages);

      const results = await Promise.all([
        loader.load('product-1'),
        loader.load('product-2'),
      ]);

      expect(getImagesByProductUseCase.execute).toHaveBeenCalledTimes(1);
      expect(getImagesByProductUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1', 'product-2'],
      });
      expect(results[0]).toHaveLength(2);
      expect(results[1]).toHaveLength(1);
    });
  });

  describe('batchLoadFunction', () => {
    it('should load multiple products images correctly', async () => {
      jest
        .spyOn(getImagesByProductUseCase, 'execute')
        .mockResolvedValue(mockImages);
      const productIds = ['product-1', 'product-2'];

      const result = await loader['batchLoadFunction'](productIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(1);
      expect(getImagesByProductUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1', 'product-2'],
      });
    });

    it('should handle empty results', async () => {
      jest.spyOn(getImagesByProductUseCase, 'execute').mockResolvedValue([]);
      const productIds = ['product-1', 'product-2'];

      const result = await loader['batchLoadFunction'](productIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([]);
      expect(result[1]).toEqual([]);
    });

    it('should handle use case errors', async () => {
      jest
        .spyOn(getImagesByProductUseCase, 'execute')
        .mockRejectedValue(new Error('Database error'));
      const productIds = ['product-1', 'product-2'];

      await expect(loader['batchLoadFunction'](productIds)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('mapResults', () => {
    it('should map images to correct products', () => {
      const productIds = ['product-1', 'product-2'];

      const result = loader['mapResults'](productIds, mockImages);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(1);
      expect(result[0][0].id).toBe('image-1');
      expect(result[0][1].id).toBe('image-2');
      expect(result[1][0].id).toBe('image-3');
    });

    it('should return empty arrays for products with no images', () => {
      const productIds = ['product-1', 'product-3', 'product-2'];

      const result = loader['mapResults'](productIds, mockImages);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveLength(2);
      expect(result[1]).toHaveLength(0);
      expect(result[2]).toHaveLength(1);
    });

    it('should preserve image object structure', () => {
      const productIds = ['product-1'];

      const result = loader['mapResults'](productIds, [mockImages[0]]);

      expect(result[0][0]).toEqual({
        id: 'image-1',
        url: 'http://example.com/1.jpg',
        productId: 'product-1',
        createdAt: new Date('2024-01-01'),
      });
    });
  });
});
