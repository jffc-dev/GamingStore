import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { CartDetail } from 'src/domain/cart-detail';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
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

  const mockCartDetail = new CartDetail({
    userId: 'user-1',
    productId: 'product-1',
    quantity: 2,
  });

  const mockPrismaCartDetail = {
    userId: 'user-1',
    productId: 'product-1',
    quantity: 2,
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
    it('should upsert and return a CartDetail entity', async () => {
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
        create: {
          userId: mockCartDetail.userId,
          productId: mockCartDetail.productId,
          quantity: mockCartDetail.quantity,
        },
        update: {
          userId: mockCartDetail.userId,
          productId: mockCartDetail.productId,
          quantity: mockCartDetail.quantity,
        },
      });

      expect(result).toBeInstanceOf(CartDetail);
      expect(result.userId).toBe(mockCartDetail.userId);
      expect(result.productId).toBe(mockCartDetail.productId);
      expect(result.quantity).toBe(mockCartDetail.quantity);
    });

    it('should handle database errors during upsert', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      mockPrismaService.cartDetail.upsert.mockRejectedValue(mockError);

      await expect(repository.addToCart(mockCartDetail)).rejects.toThrow();
    });
  });

  describe('getCartDetailsByUser', () => {
    it('should return an array of CartDetail entities for a user', async () => {
      const mockPrismaCartDetails = [
        mockPrismaCartDetail,
        {
          ...mockPrismaCartDetail,
          cartDetailId: 'cart-detail-2',
          productId: 'product-2',
          quantity: 1,
          price: 150,
        },
      ];

      mockPrismaService.cartDetail.findMany.mockResolvedValue(
        mockPrismaCartDetails,
      );

      const result = await repository.getCartDetailsByUser('user-1');

      expect(prismaService.cartDetail.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CartDetail);
      expect(result[0].userId).toBe('user-1');
      expect(result[1].productId).toBe('product-2');
      expect(result[1].quantity).toBe(1);
    });

    it('should return empty array when no cart details found', async () => {
      mockPrismaService.cartDetail.findMany.mockResolvedValue([]);

      const result = await repository.getCartDetailsByUser('user-1');

      expect(result).toHaveLength(0);
    });

    it('should handle database errors during find', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.cartDetail.findMany.mockRejectedValue(mockError);

      await expect(repository.getCartDetailsByUser('user-1')).rejects.toThrow();
    });
  });

  describe('handleDBError', () => {
    it('should throw the error with added action metadata', () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: {},
      });
      const action = 'TEST_ACTION';

      expect(() => {
        repository.handleDBError(mockError, action);
      }).toThrow();

      expect(mockError.meta).toHaveProperty('action', action);
    });
  });
});
