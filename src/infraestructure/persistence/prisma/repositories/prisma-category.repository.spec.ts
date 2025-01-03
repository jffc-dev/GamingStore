import { Test, TestingModule } from '@nestjs/testing';
import { PrismaCategoryRepository } from './prisma-category.repository';
import { PrismaService } from '../prisma.service';
import { PrismaCategoryMapper } from '../mappers/prisma-category.mapper';
import { Category } from 'src/domain/category';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('PrismaCategoryRepository', () => {
  let repository: PrismaCategoryRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toDomain: jest.fn(),
  };

  const mockCategories = [
    new Category({ id: '1', name: 'Category 1', isDeleted: false }),
    new Category({ id: '2', name: 'Category 2', isDeleted: false }),
  ];

  const mockPrismaCategories = [
    { categoryId: '1', name: 'Category 1', isDeleted: false },
    { categoryId: '2', name: 'Category 2', isDeleted: false },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCategoryRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaCategoryMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaCategoryRepository>(PrismaCategoryRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategoriesByIds', () => {
    it('should return categories for given IDs', async () => {
      const categoryIds = ['1', '2'];
      mockPrismaService.category.findMany.mockResolvedValue(
        mockPrismaCategories,
      );
      mockPrismaMapper.toDomain.mockImplementation((data) =>
        mockCategories.find((c) => c.id === data.categoryId),
      );

      const result = await repository.getCategoriesByIds(categoryIds);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { categoryId: { in: categoryIds } },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should handle database errors gracefully', async () => {
      const error = { code: 'P2025' };
      mockPrismaService.category.findMany.mockRejectedValue(error);

      await expect(repository.getCategoriesByIds(['1', '2'])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCategories', () => {
    it('should return all non-deleted categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(
        mockPrismaCategories,
      );
      mockPrismaMapper.toDomain.mockImplementation((data) =>
        mockCategories.find((c) => c.id === data.categoryId),
      );

      const result = await repository.getCategories();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockPrismaService.category.findMany.mockRejectedValue(error);

      await expect(repository.getCategories()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
