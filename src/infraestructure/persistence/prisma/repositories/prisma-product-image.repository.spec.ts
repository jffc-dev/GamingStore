import { Test, TestingModule } from '@nestjs/testing';
import { PrismaProductImageRepository } from './prisma-product-image.repository';
import { PrismaService } from '../prisma.service';
import { PrismaProductImageMapper } from '../mappers/prisma-product-image.mapper';
import { ProductImage } from 'src/domain/product-image';
import {
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';

describe('PrismaProductImageRepository', () => {
  let repository: PrismaProductImageRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    productImage: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toDomain: jest.fn(),
  };

  const mockProductImage = new ProductImage({
    id: 'image-123',
    productId: 'product-123',
    url: 'http://example.com/image.jpg',
  });

  const mockPrismaProductImage = {
    productImageId: 'image-123',
    productId: 'product-123',
    url: 'http://example.com/image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaProductImageRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaProductImageMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaProductImageRepository>(
      PrismaProductImageRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getImagesByProductIds', () => {
    it('should return a list of product images', async () => {
      mockPrismaService.productImage.findMany.mockResolvedValue([
        mockPrismaProductImage,
      ]);
      mockPrismaMapper.toDomain.mockReturnValue(mockProductImage);

      const result = await repository.getImagesByProductIds(['product-123']);

      expect(prismaService.productImage.findMany).toHaveBeenCalledWith({
        where: {
          productId: { in: ['product-123'] },
        },
      });
      expect(result).toEqual([mockProductImage]);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockPrismaService.productImage.findMany.mockRejectedValue(error);

      await expect(
        repository.getImagesByProductIds(['product-123']),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createProductImage', () => {
    it('should create and return a product image', async () => {
      mockPrismaService.productImage.create.mockResolvedValue(
        mockPrismaProductImage,
      );
      mockPrismaMapper.toDomain.mockReturnValue(mockProductImage);

      const result = await repository.createProductImage(mockProductImage);

      expect(prismaService.productImage.create).toHaveBeenCalledWith({
        data: {
          productImageId: mockProductImage.id,
          productId: mockProductImage.productId,
          url: mockProductImage.url,
        },
      });
      expect(result).toEqual(mockProductImage);
    });

    it('should handle unique constraint violations gracefully', async () => {
      const error = { code: 'P2002', meta: { target: ['productImageId'] } };
      mockPrismaService.productImage.create.mockRejectedValue(error);

      await expect(
        repository.createProductImage(mockProductImage),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  describe('getProductImageById', () => {
    it('should return a product image if found', async () => {
      mockPrismaService.productImage.findUnique.mockResolvedValue(
        mockPrismaProductImage,
      );
      mockPrismaMapper.toDomain.mockReturnValue(mockProductImage);

      const result = await repository.getProductImageById(
        'image-123',
        'product-123',
      );

      expect(prismaService.productImage.findUnique).toHaveBeenCalledWith({
        where: {
          productImageId: 'image-123',
          productId: 'product-123',
        },
      });
      expect(result).toEqual(mockProductImage);
    });

    it('should return null if no product image is found', async () => {
      mockPrismaService.productImage.findUnique.mockResolvedValue(null);

      const result = await repository.getProductImageById(
        'image-123',
        'product-123',
      );

      expect(result).toBeNull();
    });

    it('should handle not found errors gracefully', async () => {
      const error = { code: 'P2025' };
      mockPrismaService.productImage.findUnique.mockRejectedValue(error);

      await expect(
        repository.getProductImageById('image-123', 'product-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
