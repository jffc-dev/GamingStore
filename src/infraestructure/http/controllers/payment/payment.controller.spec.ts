import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { ProcessPaymentUseCase } from 'src/application/use-cases/payment/process-payment.use-case';
import { CreatePaymentIntentDto } from '../../dto/payment/payment-intent.dto';
import { User } from 'src/domain/user';
import { Payment } from 'src/domain/payment';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createPaymentUseCase: CreatePaymentUseCase;
  let processPaymentUseCase: ProcessPaymentUseCase;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'client',
  } as User;

  const mockPayment = new Payment({
    paymentId: 'payment-123',
    orderId: 'order-123',
    stripePaymentId: 'stripe-123',
    amount: 1000,
    currency: 'USD',
    status: 'PENDING',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ProcessPaymentUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    createPaymentUseCase =
      module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    processPaymentUseCase = module.get<ProcessPaymentUseCase>(
      ProcessPaymentUseCase,
    );
  });

  describe('createPayment', () => {
    it('should create a payment intent successfully', async () => {
      const paymentIntentDto: CreatePaymentIntentDto = {
        orderId: 'order-123',
      };

      jest
        .spyOn(createPaymentUseCase, 'execute')
        .mockResolvedValue(mockPayment);

      const result = await controller.createPayment(paymentIntentDto, mockUser);

      expect(createPaymentUseCase.execute).toHaveBeenCalledWith({
        ...paymentIntentDto,
        userId: mockUser.id,
      });
      expect(result).toEqual({
        paymentId: mockPayment.paymentId,
        orderId: mockPayment.orderId,
        stripePaymentId: mockPayment.stripePaymentId,
        amount: mockPayment.amount,
        currency: mockPayment.currency,
        status: mockPayment.status,
      });
    });

    it('should throw an error when createPaymentUseCase fails', async () => {
      const paymentIntentDto: CreatePaymentIntentDto = {
        orderId: 'order-123',
      };

      jest
        .spyOn(createPaymentUseCase, 'execute')
        .mockRejectedValue(new Error('Payment creation failed'));

      await expect(
        controller.createPayment(paymentIntentDto, mockUser),
      ).rejects.toThrow('Payment creation failed');
    });
  });

  describe('stripeWebhook', () => {
    it('should process webhook successfully', async () => {
      const mockRequest = {
        headers: {
          'stripe-signature': 'mock-signature',
        },
        body: {
          created: 1234567890,
          data: {
            object: {
              metadata: {
                paymentId: 'payment-123',
              },
            },
          },
        },
        rawBody: Buffer.from('mock-raw-body'),
      };

      jest
        .spyOn(processPaymentUseCase, 'execute')
        .mockResolvedValue(mockPayment);

      const result = await controller.stripeWebhook(mockRequest as any);

      expect(processPaymentUseCase.execute).toHaveBeenCalledWith({
        paymentId: 'payment-123',
        rawBody: mockRequest.rawBody,
        signature: mockRequest.headers['stripe-signature'],
        paymentAt: mockRequest.body.created,
      });
      expect(result).toEqual(mockPayment);
    });

    it('should throw an error when processPaymentUseCase fails', async () => {
      const mockRequest = {
        headers: {
          'stripe-signature': 'mock-signature',
        },
        body: {
          created: 1234567890,
          data: {
            object: {
              metadata: {
                paymentId: 'payment-123',
              },
            },
          },
        },
        rawBody: Buffer.from('mock-raw-body'),
      };

      jest
        .spyOn(processPaymentUseCase, 'execute')
        .mockRejectedValue(new Error('Webhook processing failed'));

      await expect(
        controller.stripeWebhook(mockRequest as any),
      ).rejects.toThrow('Webhook processing failed');
    });
  });
});
