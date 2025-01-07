import { Test, TestingModule } from '@nestjs/testing';
import { PrismaOrderRepository } from './prisma-order.repository';
import { PrismaService } from '../prisma.service';
import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';

import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ACTION_CREATE } from 'src/application/utils/constants';

describe('PrismaOrderRepository', () => {
  let repository: PrismaOrderRepository;

  const mockOrderProps = {
    id: 'order-123',
    userId: 'user-123',
    status: 'PENDING',
    total: 100,
    orderDetails: [],
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Order;

  const mockOrderDetailProps = {
    id: 123,
    orderId: 'order-123',
    productId: 'product-123',
    quantity: 2,
    unitPrice: 50,
    subtotal: 100,
  };

  const mockPrismaOrder = {
    orderId: mockOrderProps.id,
    userId: mockOrderProps.userId,
    status: mockOrderProps.status,
    total: mockOrderProps.total,
    createdAt: mockOrderProps.createdAt,
    updatedAt: mockOrderProps.updatedAt,
  };

  const mockPrismaOrderDetail = {
    orderDetailId: mockOrderDetailProps.id,
    orderId: mockOrderDetailProps.orderId,
    productId: mockOrderDetailProps.productId,
    quantity: mockOrderDetailProps.quantity,
    unitPrice: mockOrderDetailProps.unitPrice,
    subtotal: mockOrderDetailProps.subtotal,
  };

  const prismaMock = {
    order: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    orderDetail: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    cartDetail: {
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaOrderRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaOrderRepository>(PrismaOrderRepository);
  });

  describe('getOrder', () => {
    it('should return an order when found', async () => {
      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(
        mockPrismaOrder,
      );

      const result = await repository.getOrder(mockOrderProps.id);

      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { orderId: mockOrderProps.id },
      });
      expect(result).toBeDefined();
      expect(result?.id).toBe(mockOrderProps.id);
    });

    it('should return null when order not found', async () => {
      (prismaMock.order.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getOrder('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createOrder', () => {
    it('should create and return an order', async () => {
      (prismaMock.order.create as jest.Mock).mockResolvedValue(mockPrismaOrder);

      const result = await repository.createOrder(mockOrderProps);

      expect(prismaMock.order.create).toHaveBeenCalledWith({
        data: {
          userId: mockOrderProps.userId,
          orderId: mockOrderProps.id,
          status: mockOrderProps.status,
          total: mockOrderProps.total,
        },
      });
      expect(result).toBeDefined();
      expect(result.id).toBe(mockOrderProps.id);
    });
  });

  describe('getOrders', () => {
    it('should return all orders for a user', async () => {
      (prismaMock.order.findMany as jest.Mock).mockResolvedValue([
        mockPrismaOrder,
      ]);

      const result = await repository.getOrders(mockOrderProps.userId);

      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { userId: mockOrderProps.userId },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockOrderProps.id);
    });
  });

  describe('getDetailsByOrderIds', () => {
    it('should return order details for given order IDs', async () => {
      (prismaMock.orderDetail.findMany as jest.Mock).mockResolvedValue([
        mockPrismaOrderDetail,
      ]);

      const result = await repository.getDetailsByOrderIds([mockOrderProps.id]);

      expect(prismaMock.orderDetail.findMany).toHaveBeenCalledWith({
        where: { orderId: { in: [mockOrderProps.id] } },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockOrderDetailProps.id);
    });
  });

  describe('createFullOrder', () => {
    it('should create full order with details and update stock', async () => {
      const mockTransactionResult = {
        createdOrder: mockPrismaOrder,
        stockResults: [{ id: 'product-123', stock: 8 }],
        deleteCart: { count: 1 },
      };

      (prismaMock.$transaction as jest.Mock).mockImplementation(async () => {
        return mockTransactionResult;
      });

      expect(mockPrismaOrder).toBeDefined();
      expect(mockPrismaOrder.orderId).toBe(mockOrderProps.id);
    });
  });

  describe('createOrderDetail', () => {
    it('should create and return an order detail', async () => {
      (prismaMock.orderDetail.create as jest.Mock).mockResolvedValue(
        mockPrismaOrderDetail,
      );

      const mockPrismaDetail = new OrderDetail({ ...mockPrismaOrderDetail });
      const result = await repository.createOrderDetail(mockPrismaDetail);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockOrderDetailProps.id);
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
        repository.handleDBError(mockError, ACTION_CREATE);
      }).toThrow();

      expect(mockError.meta).toHaveProperty('action', ACTION_CREATE);
    });
  });
});
