import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { CartDetail } from 'src/domain/cart-detail';
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

  const mockCartDetail: CartDetail = new CartDetail({
    userId: 'user-123',
    productId: 'product-123',
    quantity: 2,
    createdAt: new Date('2025-01-04T02:20:59.681Z'),
    updatedAt: new Date('2025-01-04T02:20:59.681Z'),
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
      mockPrismaService.cartDetail.upsert.mockResolvedValue(
        mockPrismaCartDetail,
      );

      const result = await repository.addToCart(mockCartDetail);

      expect(result.userId).toEqual(mockCartDetail.userId);
      expect(result.quantity).toEqual(mockCartDetail.quantity);
      expect(result.productId).toEqual(mockCartDetail.productId);
    });
  });

  describe('getCartDetailsByUser', () => {
    it('should return a list of cart details for a user', async () => {
      const prismaCartDetails = [mockPrismaCartDetail];
      const domainCartDetails = [mockCartDetail];

      mockPrismaService.cartDetail.findMany.mockResolvedValue(
        prismaCartDetails,
      );

      const result = await repository.getCartDetailsByUser('user-123');

      expect(prismaService.cartDetail.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });

      expect(result[0].userId).toEqual(domainCartDetails[0].userId);
      expect(result[0].quantity).toEqual(domainCartDetails[0].quantity);
      expect(result[0].productId).toEqual(domainCartDetails[0].productId);
    });
  });
});
