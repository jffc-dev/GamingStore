import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProductRepository } from './prisma-product.repository';
import { PrismaService } from '../prisma.service';
import { PrismaProductMapper } from '../mappers/prisma-product.mapper';
import { Product } from 'src/domain/product';

describe('PrismaProductRepository', () => {
  let repository: PrismaProductRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toDomain: jest.fn(),
    toPrisma: jest.fn(),
  };

  const mockProduct = new Product({
    productId: 'product-123',
    name: 'Test Product',
    price: 100,
    isActive: true,
    isDeleted: false,
    categoryId: 'category-123',
  });

  const mockPrismaProduct = {
    productId: 'product-123',
    name: 'Test Product',
    price: 100,
    isActive: true,
    isDeleted: false,
    categoryId: 'category-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProductRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaProductMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaProductRepository>(PrismaProductRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('filterProducts', () => {
    it('should return filtered products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockPrismaProduct]);
      mockPrismaMapper.toDomain.mockReturnValue(mockProduct);

      const result = await repository.filterProducts({
        first: 1,
        after: null,
        isActive: true,
        categoryId: 'category-123',
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        take: 2,
        skip: 0,
        cursor: undefined,
        where: {
          isDeleted: false,
          isActive: true,
          categoryId: 'category-123',
        },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockPrismaProduct);
      mockPrismaMapper.toDomain.mockReturnValue(mockProduct);
      mockPrismaMapper.toPrisma.mockReturnValue(mockPrismaProduct);

      const result = await repository.create(mockProduct);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('listProducts', () => {
    it('should return a list of products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockPrismaProduct]);
      mockPrismaMapper.toDomain.mockReturnValue(mockProduct);

      const result = await repository.listProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('softDeleteProductById', () => {
    it('should mark a product as deleted', async () => {
      mockPrismaService.product.update.mockResolvedValue({});

      const result = await repository.softDeleteProductById('product-123');

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { productId: 'product-123' },
        data: { isDeleted: true },
      });
      expect(result).toBe(true);
    });
  });

  describe('updateProduct', () => {
    it('should update and return a product', async () => {
      mockPrismaService.product.update.mockResolvedValue(mockPrismaProduct);
      mockPrismaMapper.toDomain.mockReturnValue(mockProduct);
      mockPrismaMapper.toPrisma.mockReturnValue(mockPrismaProduct);

      const result = await repository.updateProduct('product-123', mockProduct);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductById', () => {
    it('should return a product if found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockPrismaProduct);
      mockPrismaMapper.toDomain.mockReturnValue(mockProduct);

      const result = await repository.getProductById('product-123');

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { productId: 'product-123' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should return null if no product is found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await repository.getProductById('product-123');

      expect(result).toBeNull();
    });
  });

  describe('handleDBError', () => {
    let repository: PrismaProductRepository;

    beforeEach(() => {
      repository = new PrismaProductRepository(null);
    });

    it('should throw the original error for code P2025', () => {
      const error = { code: 'P2025', meta: {} } as any;

      try {
        repository.handleDBError(error);
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
    });

    it('should throw the original error for code P2003', () => {
      const error = {
        code: 'P2003',
        meta: { field_name: 'product_category_id_fkey (index)' },
      } as any;

      try {
        repository.handleDBError(error);
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
    });

    it('should throw the original error for stock constraint violations', () => {
      const error = {
        message: 'violates check constraint: check_stock',
      } as any;

      try {
        repository.handleDBError(error);
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
    });

    it('should throw the original error for unexpected cases', () => {
      const error = { code: 'UNKNOWN_ERROR' } as any;

      try {
        repository.handleDBError(error);
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
    });
  });
});
