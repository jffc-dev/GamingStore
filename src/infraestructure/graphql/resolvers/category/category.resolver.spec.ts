import { Test, TestingModule } from '@nestjs/testing';
import { CategoryResolver } from './category.resolver';
import { GetCategoriesUseCase } from 'src/application/use-cases/category/get-categories.use-case';
import { Category as CategoryEntity } from '../../entities/category.entity';
import { Category } from 'src/domain/category';

describe('CategoryResolver', () => {
  let resolver: CategoryResolver;
  let getCategoriesUseCase: GetCategoriesUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryResolver,
        {
          provide: GetCategoriesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<CategoryResolver>(CategoryResolver);
    getCategoriesUseCase =
      module.get<GetCategoriesUseCase>(GetCategoriesUseCase);
  });

  describe('findAll', () => {
    it('should return a list of categories', async () => {
      const mockCategories = [
        new Category({ id: '1', name: 'Electronics' }),
        new Category({ id: '2', name: 'Books' }),
      ];

      jest
        .spyOn(getCategoriesUseCase, 'execute')
        .mockResolvedValue(mockCategories);

      const result = await resolver.findAll();

      expect(getCategoriesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(
        mockCategories.map(CategoryEntity.fromDomainToEntity),
      );
    });

    it('should return an empty list if there are no categories', async () => {
      jest.spyOn(getCategoriesUseCase, 'execute').mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(getCategoriesUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors when fetching categories', async () => {
      jest
        .spyOn(getCategoriesUseCase, 'execute')
        .mockRejectedValue(new Error('Error fetching categories'));

      await expect(resolver.findAll()).rejects.toThrow(
        'Error fetching categories',
      );
    });
  });
});
