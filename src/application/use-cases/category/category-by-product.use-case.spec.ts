import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';
import { GetCategoryByProductUseCase } from './category-by-product.use-case';

describe('GetCategoryByProductUseCase', () => {
  let useCase: GetCategoryByProductUseCase;
  let categoryRepository: CategoryRepository;

  const category1 = new Category({
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
  });

  const mockCategories: Category[] = [category1];

  const mockCategoryRepository = {
    getCategoriesByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryByProductUseCase,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoryByProductUseCase>(
      GetCategoryByProductUseCase,
    );
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return categories when given valid category IDs', async () => {
      const categoryIds = ['1', '2'];
      mockCategoryRepository.getCategoriesByIds.mockResolvedValue(
        mockCategories,
      );

      const result = await useCase.execute({ categoryIds });

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledWith(
        categoryIds,
      );
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories are found', async () => {
      const categoryIds = ['3', '4'];
      mockCategoryRepository.getCategoriesByIds.mockResolvedValue([]);

      const result = await useCase.execute({ categoryIds });

      expect(result).toEqual([]);
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledWith(
        categoryIds,
      );
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const categoryIds = ['1', '2'];
      const error = new Error('Database error');
      mockCategoryRepository.getCategoriesByIds.mockRejectedValue(error);

      await expect(useCase.execute({ categoryIds })).rejects.toThrow(error);
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledWith(
        categoryIds,
      );
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledTimes(1);
    });

    it('should handle empty category IDs array', async () => {
      const categoryIds: string[] = [];
      mockCategoryRepository.getCategoriesByIds.mockResolvedValue([]);

      const result = await useCase.execute({ categoryIds });

      expect(result).toEqual([]);
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledWith(
        categoryIds,
      );
      expect(categoryRepository.getCategoriesByIds).toHaveBeenCalledTimes(1);
    });
  });
});
