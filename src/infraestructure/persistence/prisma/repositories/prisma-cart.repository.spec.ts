import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { CartDetail } from 'src/domain/cart-detail';
import { PrismaCartDetailMapper } from '../mappers/prisma-cart-detail.mapper';
import {
  NotFoundException,
  NotAcceptableException,
  InternalServerErrorException,
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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaCartDetailRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
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
    const mockCartDetail = new CartDetail({
      userId: 'user-1',
      productId: 'product-1',
      quantity: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mockPrismaCartDetail =
      PrismaCartDetailMapper.toPrisma(mockCartDetail);

    it('should successfully add item to cart', async () => {
      mockPrismaService.cartDetail.upsert.mockResolvedValue(
        mockPrismaCartDetail,
      );

      const result = await repository.addToCart(mockCartDetail);

      expect(prismaService.cartDetail.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            productId: mockCartDetail.productId,
            userId: mockCartDetail.userId,
          },
        },
        create: mockPrismaCartDetail,
        update: mockPrismaCartDetail,
      });
      expect(result).toEqual(mockCartDetail);
    });

    it('should throw NotFoundException when product not found', async () => {
      const error = { code: 'P2025' };
      mockPrismaService.cartDetail.upsert.mockRejectedValue(error);

      await expect(repository.addToCart(mockCartDetail)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotAcceptableException on duplicate entry', async () => {
      const error = {
        code: 'P2002',
        meta: { target: ['userId'] },
      };
      mockPrismaService.cartDetail.upsert.mockRejectedValue(error);

      await expect(repository.addToCart(mockCartDetail)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should throw InternalServerErrorException on unknown error', async () => {
      const error = new Error('Unknown error');
      mockPrismaService.cartDetail.upsert.mockRejectedValue(error);

      await expect(repository.addToCart(mockCartDetail)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getCartDetailsByUser', () => {
    const mockUserId = 'user-1';
    const mockCartDetails = [
      new CartDetail({
        userId: mockUserId,
        productId: 'product-1',
        quantity: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new CartDetail({
        userId: mockUserId,
        productId: 'product-2',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ];

    const mockPrismaCartDetails = mockCartDetails.map(
      PrismaCartDetailMapper.toPrisma,
    );

    it('should successfully get cart details by user', async () => {
      mockPrismaService.cartDetail.findMany.mockResolvedValue(
        mockPrismaCartDetails,
      );

      const result = await repository.getCartDetailsByUser(mockUserId);

      expect(prismaService.cartDetail.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });
      expect(result).toEqual(mockCartDetails);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      const error = new Error('Database error');
      mockPrismaService.cartDetail.findMany.mockRejectedValue(error);

      await expect(repository.getCartDetailsByUser(mockUserId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('handleDBError', () => {
    it('should throw NotFoundException for P2025 error code', () => {
      const error = { code: 'P2025' };

      expect(() => repository.handleDBError(error)).toThrow(NotFoundException);
      expect(() => repository.handleDBError(error)).toThrow(
        'Product not found',
      );
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
