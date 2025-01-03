import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaCartDetailMapper } from '../mappers/prisma-cart-detail.mapper';
import { CartDetail } from 'src/domain/cart-detail';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaCartDetailRepository } from './prisma-cart.repository';

describe('PrismaCartDetailRepository', () => {
  let repository: PrismaCartDetailRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cartDetail: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toPrisma: jest.fn(),
    toDomain: jest.fn(),
  };

  const mockCartDetail: CartDetail = new CartDetail({
    userId: 'user-123',
    productId: 'product-123',
    quantity: 2,
  });

  const mockPrismaCartDetail = {
    userId: 'user-123',
    productId: 'product-123',
    quantity: 2,
    price: 100,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaCartDetailRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaCartDetailMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaCartDetailRepository>(
      PrismaCartDetailRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    it('should add a product to the cart or update it', async () => {
      mockPrismaMapper.toPrisma.mockReturnValue(mockPrismaCartDetail);
      mockPrismaService.cartDetail.upsert.mockResolvedValue(
        mockPrismaCartDetail,
      );
      mockPrismaMapper.toDomain.mockReturnValue(mockCartDetail);

      const result = await repository.addToCart(mockCartDetail);

      expect(prismaService.cartDetail.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            productId: mockPrismaCartDetail.productId,
            userId: mockPrismaCartDetail.userId,
          },
        },
        create: mockPrismaCartDetail,
        update: mockPrismaCartDetail,
      });
      expect(result).toEqual(mockCartDetail);
    });

    it('should handle database errors gracefully', async () => {
      const error = { code: 'P2025' };
      mockPrismaService.cartDetail.upsert.mockRejectedValue(error);

      await expect(repository.addToCart(mockCartDetail)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCartDetailsByUser', () => {
    it('should return a list of cart details for a user', async () => {
      const prismaCartDetails = [mockPrismaCartDetail];
      const domainCartDetails = [mockCartDetail];

      mockPrismaService.cartDetail.findMany.mockResolvedValue(
        prismaCartDetails,
      );
      mockPrismaMapper.toDomain.mockReturnValueOnce(mockCartDetail);

      const result = await repository.getCartDetailsByUser('user-123');

      expect(prismaService.cartDetail.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual(domainCartDetails);
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockPrismaService.cartDetail.findMany.mockRejectedValue(error);

      await expect(repository.getCartDetailsByUser('user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
