import { Test, TestingModule } from '@nestjs/testing';
import { GetProductsByIdsUseCase } from './get-products-by-ids.use-case';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';

describe('GetProductsByIdsUseCase', () => {
  let useCase: GetProductsByIdsUseCase;
  let productRepository: ProductRepository;

  const mockProducts: Product[] = [
    new Product({
      productId: 'product-1',
      categoryId: 'category-1',
      name: 'Product 1',
      price: 100,
      description: 'Description 1',
      stock: 10,
    }),
    new Product({
      productId: 'product-2',
      categoryId: 'category-2',
      name: 'Product 2',
      price: 200,
      description: 'Description 2',
      stock: 20,
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductsByIdsUseCase,
        {
          provide: ProductRepository,
          useValue: {
            getProductsByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProductsByIdsUseCase>(GetProductsByIdsUseCase);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should return products successfully when given valid product IDs', async () => {
      const productIds = ['product-1', 'product-2'];
      jest
        .spyOn(productRepository, 'getProductsByIds')
        .mockResolvedValue(mockProducts);

      const result = await useCase.execute({ productIds });

      expect(productRepository.getProductsByIds).toHaveBeenCalledWith(
        productIds,
      );
      expect(result).toEqual(mockProducts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no products are found', async () => {
      const productIds = ['non-existent-1', 'non-existent-2'];
      jest.spyOn(productRepository, 'getProductsByIds').mockResolvedValue([]);

      const result = await useCase.execute({ productIds });

      expect(productRepository.getProductsByIds).toHaveBeenCalledWith(
        productIds,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle repository errors properly', async () => {
      const productIds = ['product-1', 'product-2'];
      jest
        .spyOn(productRepository, 'getProductsByIds')
        .mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute({ productIds })).rejects.toThrow(
        'Database error',
      );
      expect(productRepository.getProductsByIds).toHaveBeenCalledWith(
        productIds,
      );
    });

    it('should handle empty input array', async () => {
      const productIds: string[] = [];
      jest.spyOn(productRepository, 'getProductsByIds').mockResolvedValue([]);

      const result = await useCase.execute({ productIds });

      expect(productRepository.getProductsByIds).toHaveBeenCalledWith(
        productIds,
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
