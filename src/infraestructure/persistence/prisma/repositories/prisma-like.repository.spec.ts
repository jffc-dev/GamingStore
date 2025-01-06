import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { LikeProduct } from 'src/domain/like-product';
import { PrismaLikeProductMapper } from '../mappers/prisma-like.mapper';
import {
  NotFoundException,
  NotAcceptableException,
  InternalServerErrorException,
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
    const mockLikeProduct = new LikeProduct({
      userId: 'user-1',
      productId: 'product-1',
      createdAt: new Date(),
    });

    const mockPrismaLikeProduct =
      PrismaLikeProductMapper.toPrisma(mockLikeProduct);

    it('should successfully like a product', async () => {
      mockPrismaService.productLike.upsert.mockResolvedValue(
        mockPrismaLikeProduct,
      );

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

    it('should throw NotFoundException when like not found', async () => {
      const error = { code: 'P2025' };
      mockPrismaService.productLike.upsert.mockRejectedValue(error);

      await expect(repository.likeProduct(mockLikeProduct)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotAcceptableException on duplicate entry', async () => {
      const error = {
        code: 'P2002',
        meta: { target: ['userId'] },
      };
      mockPrismaService.productLike.upsert.mockRejectedValue(error);

      await expect(repository.likeProduct(mockLikeProduct)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      const error = new Error('Unknown error');
      mockPrismaService.productLike.upsert.mockRejectedValue(error);

      await expect(repository.likeProduct(mockLikeProduct)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getLikedProducts', () => {
    const mockUserId = 'user-1';
    const mockLikedProducts = [
      new LikeProduct({
        userId: mockUserId,
        productId: 'product-1',
        createdAt: new Date(),
      }),
      new LikeProduct({
        userId: mockUserId,
        productId: 'product-2',
        createdAt: new Date(),
      }),
    ];

    const mockPrismaLikedProducts = mockLikedProducts.map(
      PrismaLikeProductMapper.toPrisma,
    );

    it('should successfully get liked products by user', async () => {
      mockPrismaService.productLike.findMany.mockResolvedValue(
        mockPrismaLikedProducts,
      );

      const result = await repository.getLikedProducts(mockUserId);

      expect(prismaService.productLike.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(mockLikedProducts);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockPrismaService.productLike.findMany.mockRejectedValue(error);

      await expect(repository.getLikedProducts(mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('handleDBError', () => {
    it('should throw NotFoundException for P2025 error code', () => {
      const error = { code: 'P2025' };

      expect(() => repository.handleDBError(error)).toThrow(NotFoundException);
      expect(() => repository.handleDBError(error)).toThrow('Like not found');
    });

    it('should throw NotAcceptableException for P2002 error code', () => {
      const error = {
        code: 'P2002',
        meta: { target: ['userId'] },
      };

      expect(() => repository.handleDBError(error)).toThrow(
        NotAcceptableException,
      );
      expect(() => repository.handleDBError(error)).toThrow(
        'userId had been already registered',
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
