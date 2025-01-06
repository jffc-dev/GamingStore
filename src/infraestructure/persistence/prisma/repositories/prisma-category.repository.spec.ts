import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaCategoryRepository } from './prisma-category.repository';
import { Category } from 'src/domain/category';
import {
  NotFoundException,
  NotAcceptableException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('PrismaCategoryRepository', () => {
  let repository: PrismaCategoryRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaCategoryRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaCategoryRepository>(PrismaCategoryRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategoriesByIds', () => {
    const mockCategoryIds = ['1', '2'];
    const mockPrismaCategories = [
      {
        categoryId: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoryId: '2',
        name: 'Books',
        description: 'Book items',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockCategories = mockPrismaCategories.map(
      (cat) =>
        new Category({
          id: cat.categoryId,
          name: cat.name,
          description: cat.description,
          isDeleted: cat.isDeleted,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        }),
    );

    it('should successfully get categories by ids', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(
        mockPrismaCategories,
      );

      const result = await repository.getCategoriesByIds(mockCategoryIds);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: { in: mockCategoryIds },
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockPrismaService.category.findMany.mockRejectedValue(error);

      await expect(
        repository.getCategoriesByIds(mockCategoryIds),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should return empty array when no categories found', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await repository.getCategoriesByIds(mockCategoryIds);

      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    const mockPrismaCategories = [
      {
        categoryId: '1',
        name: 'Electronics',
        description: 'Electronic items',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoryId: '2',
        name: 'Books',
        description: 'Book items',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockCategories = mockPrismaCategories.map(
      (cat) =>
        new Category({
          id: cat.categoryId,
          name: cat.name,
          description: cat.description,
          isDeleted: cat.isDeleted,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        }),
    );

    it('should successfully get all non-deleted categories', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(
        mockPrismaCategories,
      );

      const result = await repository.getCategories();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockPrismaService.category.findMany.mockRejectedValue(error);

      await expect(repository.getCategories()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should return empty array when no categories exist', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([]);

      const result = await repository.getCategories();

      expect(result).toEqual([]);
    });
  });

  describe('handleDBError', () => {
    it('should throw NotFoundException for P2025 error code', () => {
      const error = { code: 'P2025' };

      expect(() => repository.handleDBError(error)).toThrow(NotFoundException);
      expect(() => repository.handleDBError(error)).toThrow(
        'Category not found',
      );
    });

    it('should throw NotAcceptableException for P2002 error code', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['name'] },
      };

      expect(() => repository.handleDBError(error)).toThrow(
        NotAcceptableException,
      );
      expect(() => repository.handleDBError(error)).toThrow(
        'name had been already registered',
      );
    });

    it('should throw InternalServerErrorException for unknown errors', () => {
      const error = new Error('Unknown error');

      expect(() => repository.handleDBError(error)).toThrow(
        InternalServerErrorException,
      );
    });
  });
});
