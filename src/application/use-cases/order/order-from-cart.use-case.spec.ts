import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';
import { CreateOrderFromCartUseCase } from './order-from-cart.use-case';

describe('CreateOrderFromCartUseCase', () => {
  let useCase: CreateOrderFromCartUseCase;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  const mockCartDetails = [
    { id: '1', userId: 'user123', productId: 'prod1', quantity: 1 },
    { id: '2', userId: 'user123', productId: 'prod2', quantity: 1 },
  ];

  const mockProducts = [
    { productId: 'prod1', name: 'Product 1', price: 100, stock: 5 },
    { productId: 'prod2', name: 'Product 2', price: 200, stock: 3 },
  ];

  const mockOrder = new Order({
    id: mockUuid,
    status: 'PENDING',
    userId: 'user123',
    total: 400,
  });

  const mockRepositories = {
    cartDetail: {
      getCartDetailsByUser: jest.fn(),
    },
    product: {
      getProductsByIds: jest.fn(),
    },
    order: {
      createFullOrder: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderFromCartUseCase,
        {
          provide: CartDetailRepository,
          useValue: mockRepositories.cartDetail,
        },
        {
          provide: ProductRepository,
          useValue: mockRepositories.product,
        },
        {
          provide: OrderRepository,
          useValue: mockRepositories.order,
        },
        {
          provide: UuidService,
          useValue: { generateUuid: () => mockUuid },
        },
      ],
    }).compile();

    useCase = module.get<CreateOrderFromCartUseCase>(
      CreateOrderFromCartUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = 'user123';

    it('should create order successfully from cart', async () => {
      mockRepositories.cartDetail.getCartDetailsByUser.mockResolvedValue(
        mockCartDetails,
      );
      mockRepositories.product.getProductsByIds.mockResolvedValue(mockProducts);
      mockRepositories.order.createFullOrder.mockResolvedValue(mockOrder);

      const result = await useCase.execute({ userId });

      expect(result).toEqual(mockOrder);
      expect(
        mockRepositories.cartDetail.getCartDetailsByUser,
      ).toHaveBeenCalledWith(userId);
      expect(mockRepositories.product.getProductsByIds).toHaveBeenCalledWith([
        'prod1',
        'prod2',
      ]);
      expect(mockRepositories.order.createFullOrder).toHaveBeenCalled();
      expect(result.total).toBe(400);
      expect(result.status).toBe('PENDING');
    });

    it('should throw BadRequestException when cart is empty', async () => {
      mockRepositories.cartDetail.getCartDetailsByUser.mockResolvedValue([]);

      await expect(useCase.execute({ userId })).rejects.toThrow(
        new BadRequestException('Empty cart'),
      );
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const lowStockProducts = [
        { productId: 'prod1', name: 'Product 1', price: 100, stock: 1 },
        { productId: 'prod2', name: 'Product 2', price: 200, stock: 0 },
      ];
      mockRepositories.cartDetail.getCartDetailsByUser.mockResolvedValue(
        mockCartDetails,
      );
      mockRepositories.product.getProductsByIds.mockResolvedValue(
        lowStockProducts,
      );

      await expect(useCase.execute({ userId })).rejects.toThrow(
        new BadRequestException('Insuficient stock'),
      );
    });

    it('should calculate total price correctly', async () => {
      mockRepositories.cartDetail.getCartDetailsByUser.mockResolvedValue(
        mockCartDetails,
      );
      mockRepositories.product.getProductsByIds.mockResolvedValue(mockProducts);
      mockRepositories.order.createFullOrder.mockResolvedValue(mockOrder);

      const result = await useCase.execute({ userId });

      const expectedTotal = 2 * 100 + 1 * 200;
      expect(result.total).toBe(expectedTotal);
    });

    it('should create order details with correct data', async () => {
      mockRepositories.cartDetail.getCartDetailsByUser.mockResolvedValue(
        mockCartDetails,
      );
      console.log(mockProducts);
      mockRepositories.product.getProductsByIds.mockResolvedValue(mockProducts);
      mockRepositories.order.createFullOrder.mockImplementation(
        (order) => order,
      );

      const result = await useCase.execute({ userId });

      expect(result.orderDetails).toHaveLength(2);
      result.orderDetails.forEach((detail: OrderDetail) => {
        expect(detail).toHaveProperty('orderId', mockUuid);
        expect(detail).toHaveProperty('quantity');
        expect(detail).toHaveProperty('unitPrice');
        expect(detail).toHaveProperty('subtotal');
        expect(detail.subtotal).toBe(detail.quantity * detail.unitPrice);
      });
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepositories.cartDetail.getCartDetailsByUser.mockRejectedValue(error);

      await expect(useCase.execute({ userId })).rejects.toThrow(error);
    });
  });
});
