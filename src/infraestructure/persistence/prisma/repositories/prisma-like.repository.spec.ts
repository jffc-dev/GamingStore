import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';
import { LikeProduct } from 'src/domain/like-product';
import {
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { PrismaLikeProductRepository } from './prisma-like.repository';

describe('PrismaLikeProductRepository', () => {
  let repository: PrismaLikeProductRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    productLike: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toDomain: jest.fn(),
  };

  const mockLikeProduct = new LikeProduct({
    userId: 'user-123',
    productId: 'product-123',
  });

  const mockPrismaLikeProduct = {
    userId: 'user-123',
    productId: 'product-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaLikeProductRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaLikeProductMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaLikeProductRepository>(
      PrismaLikeProductRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('likeProduct', () => {
    it('should like a product successfully', async () => {
      mockPrismaService.productLike.upsert.mockResolvedValue(
        mockPrismaLikeProduct,
      );
      mockPrismaMapper.toDomain.mockReturnValue(mockLikeProduct);

      const result = await repository.likeProduct(mockLikeProduct);

      expect(prismaService.productLike.upsert).toHaveBeenCalledWith({
        where: {
          productId_userId: {
            productId: mockLikeProduct.productId,
            userId: mockLikeProduct.userId,
          },
        },
        create: {
          userId: mockLikeProduct.userId,
          productId: mockLikeProduct.productId,
        },
        update: {},
      });
      expect(result).toEqual(mockLikeProduct);
    });

    it('should handle database errors gracefully', async () => {
      const error = { code: 'P2002', meta: { target: ['productId_userId'] } };
      mockPrismaService.productLike.upsert.mockRejectedValue(error);

      await expect(repository.likeProduct(mockLikeProduct)).rejects.toThrow(
        NotAcceptableException,
      );
    });
  });

  describe('getLikedProducts', () => {
    it('should return a list of liked products', async () => {
      mockPrismaService.productLike.findMany.mockResolvedValue([
        mockPrismaLikeProduct,
      ]);
      mockPrismaMapper.toDomain.mockReturnValue(mockLikeProduct);

      const result = await repository.getLikedProducts(mockLikeProduct.userId);

      expect(prismaService.productLike.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockLikeProduct.userId,
        },
      });
      expect(result).toEqual([mockLikeProduct]);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockPrismaService.productLike.findMany.mockRejectedValue(error);

      await expect(
        repository.getLikedProducts(mockLikeProduct.userId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
