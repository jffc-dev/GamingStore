import { Test, TestingModule } from '@nestjs/testing';
import { ProductLoader } from './product.loader';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';
import { Product } from 'src/domain/Product';

describe('ProductLoader', () => {
  let productLoader: ProductLoader;
  let getProductsByIdsUseCase: GetProductsByIdsUseCase;

  const mockProducts: Product[] = [
    {
      productId: 'product-1',
      name: 'Product 1',
      price: 100,
      description: 'Description 1',
    } as Product,
    {
      productId: 'product-2',
      name: 'Product 2',
      price: 200,
      description: 'Description 2',
    } as Product,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductLoader,
        {
          provide: GetProductsByIdsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    productLoader = module.get<ProductLoader>(ProductLoader);
    getProductsByIdsUseCase = module.get<GetProductsByIdsUseCase>(
      GetProductsByIdsUseCase,
    );
  });

  describe('load', () => {
    it('should load a single product successfully', async () => {
      jest
        .spyOn(getProductsByIdsUseCase, 'execute')
        .mockResolvedValue([mockProducts[0]]);

      const result = await productLoader.load('product-1');

      expect(result).toEqual(mockProducts[0]);
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1'],
      });
    });

    it('should return null for non-existent product', async () => {
      jest.spyOn(getProductsByIdsUseCase, 'execute').mockResolvedValue([]);

      const result = await productLoader.load('non-existent');

      expect(result).toBeNull();
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledWith({
        productIds: ['non-existent'],
      });
    });

    it('should batch multiple loads into a single request', async () => {
      jest
        .spyOn(getProductsByIdsUseCase, 'execute')
        .mockResolvedValue(mockProducts);

      const results = await Promise.all([
        productLoader.load('product-1'),
        productLoader.load('product-2'),
      ]);

      expect(results).toEqual(mockProducts);
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1', 'product-2'],
      });
    });
  });

  describe('batchLoadFunction', () => {
    it('should load multiple products in correct order', async () => {
      jest
        .spyOn(getProductsByIdsUseCase, 'execute')
        .mockResolvedValue(mockProducts);
      const productIds = ['product-1', 'product-2'];

      const result = await productLoader['batchLoadFunction'](productIds);

      expect(result).toEqual(mockProducts);
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledWith({
        productIds: ['product-1', 'product-2'],
      });
    });

    it('should handle empty product list', async () => {
      jest.spyOn(getProductsByIdsUseCase, 'execute').mockResolvedValue([]);
      const productIds: string[] = [];

      const result = await productLoader['batchLoadFunction'](productIds);

      expect(result).toEqual([]);
      expect(getProductsByIdsUseCase.execute).toHaveBeenCalledWith({
        productIds: [],
      });
    });

    it('should handle errors from use case', async () => {
      jest
        .spyOn(getProductsByIdsUseCase, 'execute')
        .mockRejectedValue(new Error('Database error'));
      const productIds = ['product-1', 'product-2'];

      await expect(
        productLoader['batchLoadFunction'](productIds),
      ).rejects.toThrow('Database error');
    });
  });

  describe('mapResults', () => {
    it('should map products in correct order', () => {
      const productIds = ['product-1', 'product-2'];

      const result = productLoader['mapResults'](productIds, mockProducts);

      expect(result).toEqual(mockProducts);
    });

    it('should return null for missing products', () => {
      const productIds = ['product-1', 'non-existent', 'product-2'];

      const result = productLoader['mapResults'](productIds, mockProducts);

      expect(result).toEqual([mockProducts[0], null, mockProducts[1]]);
    });

    it('should handle empty results', () => {
      const productIds = ['product-1', 'product-2'];

      const result = productLoader['mapResults'](productIds, []);

      expect(result).toEqual([null, null]);
    });

    it('should preserve order even when products are in different order', () => {
      const productIds = ['product-2', 'product-1'];
      const reversedProducts = [...mockProducts].reverse();

      const result = productLoader['mapResults'](productIds, reversedProducts);

      expect(result).toEqual([mockProducts[1], mockProducts[0]]);
    });
  });
});
