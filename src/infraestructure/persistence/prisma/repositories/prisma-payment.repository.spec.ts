import { Test, TestingModule } from '@nestjs/testing';
import { PrismaPaymentRepository } from './prisma-payment.repository';
import { PrismaService } from '../prisma.service';
import { Payment } from 'src/domain/payment';

import { PrismaClient } from '@prisma/client';

describe('PrismaPaymentRepository', () => {
  let repository: PrismaPaymentRepository;

  const mockPayment: Payment = new Payment({
    paymentId: 'payment-123',
    orderId: 'order-123',
    amount: 100,
    currency: 'USD',
    status: 'PENDING',
    stripePaymentId: 'stripe-123',
    paymentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPrismaPayment = {
    paymentId: mockPayment.paymentId,
    orderId: mockPayment.orderId,
    amount: mockPayment.amount,
    currency: mockPayment.currency,
    status: mockPayment.status,
    stripePaymentId: mockPayment.stripePaymentId,
    paymentAt: mockPayment.paymentAt,
    createdAt: mockPayment.createdAt,
    updatedAt: mockPayment.updatedAt,
  };

  const prismaMock = {
    payment: {
      update: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    order: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPaymentRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaPaymentRepository>(PrismaPaymentRepository);
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      (prismaMock.payment.create as jest.Mock).mockResolvedValue(
        mockPrismaPayment,
      );

      const result = await repository.createPayment(mockPayment);

      expect(prismaMock.payment.create).toHaveBeenCalledWith({
        data: {
          paymentId: mockPayment.paymentId,
          amount: mockPayment.amount,
          currency: mockPayment.currency,
          stripePaymentId: mockPayment.stripePaymentId,
          order: {
            connect: { orderId: mockPayment.orderId },
          },
        },
      });
      expect(result).toBeDefined();
      expect(result.paymentId).toBe(mockPayment.paymentId);
    });
  });

  describe('getPayment', () => {
    it('should return payment when found', async () => {
      (prismaMock.payment.findUnique as jest.Mock).mockResolvedValue(
        mockPrismaPayment,
      );

      const result = await repository.getPayment(mockPayment.paymentId);

      expect(prismaMock.payment.findUnique).toHaveBeenCalledWith({
        where: { paymentId: mockPayment.paymentId },
      });
      expect(result).toBeDefined();
      expect(result.paymentId).toBe(mockPayment.paymentId);
    });

    it('should return null when payment not found', async () => {
      (prismaMock.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getPayment('non-existent');

      expect(result).toBeNull();
    });
  });
});
