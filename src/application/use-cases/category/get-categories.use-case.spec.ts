import { Test, TestingModule } from '@nestjs/testing';
import { CategoryRepository } from 'src/application/contracts/persistence/category.repository';
import { Category } from 'src/domain/category';
import { GetCategoriesUseCase } from './get-categories.use-case';

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase;
  let categoryRepository: CategoryRepository;

  const category1 = new Category({
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
  });
  const category2 = new Category({
    id: '2',
    name: 'Books',
    description: 'Physical and digital books',
  });
  // Mock data
  const mockCategories: Category[] = [category1, category2];

  const mockCategoryRepository = {
    getCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoriesUseCase,
        {
          provide: CategoryRepository,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
    categoryRepository = module.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all categories successfully', async () => {
      mockCategoryRepository.getCategories.mockResolvedValue(mockCategories);

      const result = await useCase.execute();

      expect(result).toEqual(mockCategories);
      expect(categoryRepository.getCategories).toHaveBeenCalled();
      expect(categoryRepository.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories exist', async () => {
      mockCategoryRepository.getCategories.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
      expect(categoryRepository.getCategories).toHaveBeenCalled();
      expect(categoryRepository.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection error');
      mockCategoryRepository.getCategories.mockRejectedValue(error);

      await expect(useCase.execute()).rejects.toThrow(error);
      expect(categoryRepository.getCategories).toHaveBeenCalled();
      expect(categoryRepository.getCategories).toHaveBeenCalledTimes(1);
    });
  });
});
