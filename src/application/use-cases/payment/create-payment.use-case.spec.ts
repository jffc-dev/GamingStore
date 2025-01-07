import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { OrderRepository } from 'src/application/contracts/persistence/order.repository';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { StripeService } from 'src/infraestructure/services/stripe/stripe.service';
import { Payment } from 'src/domain/payment';
import {
  DEFAULT_CURRENCY,
  INITIAL_PAYMENT_STATE,
} from 'src/application/utils/constants';
import { CreatePaymentUseCase } from './create-payment.use-case';

describe('CreatePaymentUseCase', () => {
  let useCase: CreatePaymentUseCase;

  const mockUuid = '123e4567-e89b-12d3-a456-426614174000';

  const mockOrder = {
    id: 'order123',
    userId: 'user123',
    total: 1000,
    status: 'PENDING',
  };

  const mockPayment = new Payment({
    paymentId: mockUuid,
    amount: 1000,
    currency: DEFAULT_CURRENCY,
    orderId: 'order123',
    status: INITIAL_PAYMENT_STATE,
    stripePaymentId: mockUuid,
  });

  const mockStripeResponse = {
    id: 'stripe_payment_123',
    amount: 1000,
    currency: DEFAULT_CURRENCY,
    status: 'requires_payment_method',
  };

  const mockDependencies = {
    uuid: { generateUuid: jest.fn(() => mockUuid) },
    order: { getOrderOrThrow: jest.fn() },
    payment: { createPayment: jest.fn() },
    stripe: { createPaymentIntent: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        { provide: UuidService, useValue: mockDependencies.uuid },
        { provide: OrderRepository, useValue: mockDependencies.order },
        { provide: PaymentRepository, useValue: mockDependencies.payment },
        { provide: StripeService, useValue: mockDependencies.stripe },
      ],
    }).compile();

    useCase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validInput = {
      orderId: 'order123',
      userId: 'user123',
    };

    it('should create payment successfully', async () => {
      mockDependencies.order.getOrderOrThrow.mockResolvedValue(mockOrder);
      mockDependencies.payment.createPayment.mockResolvedValue(mockPayment);
      mockDependencies.stripe.createPaymentIntent.mockResolvedValue(
        mockStripeResponse,
      );

      const result = await useCase.execute(validInput);

      expect(result).toEqual(mockPayment);
      expect(mockDependencies.order.getOrderOrThrow).toHaveBeenCalledWith(
        validInput.orderId,
      );
      expect(mockDependencies.payment.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: mockOrder.total,
          currency: DEFAULT_CURRENCY,
          orderId: mockOrder.id,
          status: INITIAL_PAYMENT_STATE,
        }),
      );
      expect(mockDependencies.stripe.createPaymentIntent).toHaveBeenCalledWith({
        amount: mockPayment.amount,
        currency: mockPayment.currency,
        metadata: { paymentId: mockPayment.paymentId },
      });
    });

    it('should throw BadRequestException when order not found', async () => {
      mockDependencies.order.getOrderOrThrow.mockResolvedValue(null);

      expect(mockDependencies.payment.createPayment).not.toHaveBeenCalled();
      expect(
        mockDependencies.stripe.createPaymentIntent,
      ).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when order belongs to different user', async () => {
      mockDependencies.order.getOrderOrThrow.mockResolvedValue({
        ...mockOrder,
        userId: 'differentUser',
      });

      await expect(useCase.execute(validInput)).rejects.toThrow(
        new BadRequestException('This order is not yours'),
      );
      expect(mockDependencies.payment.createPayment).not.toHaveBeenCalled();
      expect(
        mockDependencies.stripe.createPaymentIntent,
      ).not.toHaveBeenCalled();
    });

    it('should handle payment repository errors', async () => {
      const error = new Error('Payment creation failed');
      mockDependencies.order.getOrderOrThrow.mockResolvedValue(mockOrder);
      mockDependencies.payment.createPayment.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(error);
      expect(
        mockDependencies.stripe.createPaymentIntent,
      ).not.toHaveBeenCalled();
    });

    it('should handle stripe service errors', async () => {
      const error = new Error('Stripe service error');
      mockDependencies.order.getOrderOrThrow.mockResolvedValue(mockOrder);
      mockDependencies.payment.createPayment.mockResolvedValue(mockPayment);
      mockDependencies.stripe.createPaymentIntent.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(error);
    });

    it('should create payment with correct initial status', async () => {
      mockDependencies.order.getOrderOrThrow.mockResolvedValue(mockOrder);
      mockDependencies.payment.createPayment.mockResolvedValue(mockPayment);
      mockDependencies.stripe.createPaymentIntent.mockResolvedValue(
        mockStripeResponse,
      );

      await useCase.execute(validInput);

      expect(mockDependencies.payment.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          status: INITIAL_PAYMENT_STATE,
        }),
      );
    });
  });
});
