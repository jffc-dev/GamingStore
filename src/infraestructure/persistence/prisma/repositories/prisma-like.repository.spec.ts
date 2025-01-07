import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

  const mockLikeProduct = new LikeProduct({
    userId: 'user-1',
    productId: 'product-1',
    createdAt: new Date(),
  });

  const mockPrismaLike = {
    userId: 'user-1',
    productId: 'product-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaLikeProductRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
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
    it('should upsert and return a LikeProduct entity', async () => {
      mockPrismaService.productLike.upsert.mockResolvedValue(mockPrismaLike);

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

      expect(result).toBeInstanceOf(LikeProduct);
      expect(result.userId).toBe(mockLikeProduct.userId);
      expect(result.productId).toBe(mockLikeProduct.productId);
    });

    it('should handle database errors during upsert', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      mockPrismaService.productLike.upsert.mockRejectedValue(mockError);

      await expect(repository.likeProduct(mockLikeProduct)).rejects.toThrow();
    });
  });

  describe('getLikedProducts', () => {
    it('should return an array of LikeProduct entities', async () => {
      const mockPrismaLikes = [
        mockPrismaLike,
        {
          ...mockPrismaLike,
          likeId: 'like-2',
          productId: 'product-2',
        },
      ];

      mockPrismaService.productLike.findMany.mockResolvedValue(mockPrismaLikes);

      const result = await repository.getLikedProducts('user-1');

      expect(prismaService.productLike.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LikeProduct);
      expect(result[0].userId).toBe('user-1');
      expect(result[1].productId).toBe('product-2');
    });

    it('should return empty array when no likes found', async () => {
      mockPrismaService.productLike.findMany.mockResolvedValue([]);

      const result = await repository.getLikedProducts('user-1');

      expect(result).toHaveLength(0);
    });

    it('should handle database errors during find', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.productLike.findMany.mockRejectedValue(mockError);

      await expect(repository.getLikedProducts('user-1')).rejects.toThrow();
    });
  });

  describe('handleDBError', () => {
    it('should throw the error with added action metadata', () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: {},
      });

      expect(() => {
        repository.handleDBError(mockError, 'TEST_ACTION');
      }).toThrow();

      expect(mockError.meta).toHaveProperty('action', 'TEST_ACTION');
    });
  });
});
