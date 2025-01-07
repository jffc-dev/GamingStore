import { Test } from '@nestjs/testing';
import { GetCategoryByProductUseCase } from 'src/application/use-cases/category/category-by-product.use-case';
import { Category } from 'src/domain/category';
import { CategoryLoader } from './category.loader';

describe('CategoryLoader', () => {
  let categoryLoader: CategoryLoader;
  let getCategoryByProductUseCase: jest.Mocked<GetCategoryByProductUseCase>;

  const mockCategories: Category[] = [
    new Category({
      id: 'cat-1',
      name: 'Electronics',
      description: 'Electronic devices',
    }),
    new Category({
      id: 'cat-2',
      name: 'Books',
      description: 'Physical and digital books',
    }),
  ];

  beforeEach(async () => {
    const getCategoryByProductUseCaseMock = {
      execute: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoryLoader,
        {
          provide: GetCategoryByProductUseCase,
          useValue: getCategoryByProductUseCaseMock,
        },
      ],
    }).compile();

    categoryLoader = moduleRef.get<CategoryLoader>(CategoryLoader);
    getCategoryByProductUseCase = moduleRef.get(GetCategoryByProductUseCase);
  });

  describe('load', () => {
    it('should load a single category', async () => {
      const categoryId = 'cat-1';
      getCategoryByProductUseCase.execute.mockResolvedValue([
        mockCategories[0],
      ]);

      const result = await categoryLoader.load(categoryId);

      expect(result).toEqual(mockCategories[0]);
      expect(getCategoryByProductUseCase.execute).toHaveBeenCalledWith({
        categoryIds: [categoryId],
      });
    });

    it('should batch multiple loads', async () => {
      const categoryIds = ['cat-1', 'cat-2'];
      getCategoryByProductUseCase.execute.mockResolvedValue(mockCategories);

      const results = await Promise.all([
        categoryLoader.load(categoryIds[0]),
        categoryLoader.load(categoryIds[1]),
      ]);

      expect(results).toEqual(mockCategories);
      expect(getCategoryByProductUseCase.execute).toHaveBeenCalledTimes(1);
      expect(getCategoryByProductUseCase.execute).toHaveBeenCalledWith({
        categoryIds: categoryIds,
      });
    });
  });

  describe('mapResults', () => {
    it('should map categories in the correct order', () => {
      const categoryIds = ['cat-1', 'cat-2', 'cat-3'];
      const categories = [mockCategories[1], mockCategories[0]];

      const results = categoryLoader.mapResults(categoryIds, categories);

      expect(results).toEqual([mockCategories[0], mockCategories[1], null]);
    });

    it('should handle empty categories array', () => {
      const categoryIds = ['cat-1', 'cat-2'];
      const categories: Category[] = [];

      const results = categoryLoader.mapResults(categoryIds, categories);

      expect(results).toEqual([null, null]);
    });

    it('should handle empty categoryIds array', () => {
      const categoryIds: string[] = [];
      const categories = mockCategories;

      const results = categoryLoader.mapResults(categoryIds, categories);

      expect(results).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle use case errors', async () => {
      const error = new Error('Database error');
      getCategoryByProductUseCase.execute.mockRejectedValue(error);

      await expect(categoryLoader.load('cat-1')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('caching', () => {
    it('should cache results for subsequent loads', async () => {
      const categoryId = 'cat-1';
      getCategoryByProductUseCase.execute.mockResolvedValue([
        mockCategories[0],
      ]);

      const result1 = await categoryLoader.load(categoryId);

      const result2 = await categoryLoader.load(categoryId);

      expect(result1).toEqual(mockCategories[0]);
      expect(result2).toEqual(mockCategories[0]);
      expect(getCategoryByProductUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
