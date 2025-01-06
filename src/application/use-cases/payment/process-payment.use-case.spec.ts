import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProcessPaymentUseCase } from './process-payment.use-case';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { OrderRepository } from 'src/application/contracts/persistence/order.repository';
import { StripeService } from 'src/infraestructure/services/stripe/stripe.service';
import { EnvService } from 'src/infraestructure/env/env.service';
import { Payment } from 'src/domain/payment';
import Stripe from 'stripe';
import { Order } from 'src/domain/order';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let orderRepository: jest.Mocked<OrderRepository>;
  let stripeService: jest.Mocked<StripeService>;
  let envService: jest.Mocked<EnvService>;

  const mockPaymentId = 'payment-123';
  const mockOrderId = 'order-123';
  const mockUserId = 'user-123';
  const mockStripePaymentId = 'pi_123456';
  const mockSignature = 'test-signature';
  const mockRawBody = 'raw-body-data';
  const mockWebhookKey = 'webhook-secret-key';
  const mockPaymentAt = 1672531200;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        {
          provide: PaymentRepository,
          useValue: {
            getPayment: jest.fn(),
            updatePayment: jest.fn(),
          },
        },
        {
          provide: OrderRepository,
          useValue: {
            getOrder: jest.fn(),
          },
        },
        {
          provide: StripeService,
          useValue: {
            webhookConstructEvent: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    paymentRepository = moduleRef.get(PaymentRepository);
    orderRepository = moduleRef.get(OrderRepository);
    stripeService = moduleRef.get(StripeService);
    envService = moduleRef.get(EnvService);
  });

  it('should process successful payment', async () => {
    const mockPayment = new Payment({
      paymentId: mockPaymentId,
      orderId: mockOrderId,
      status: 'PENDING',
      amount: 10,
      currency: 'USD',
      stripePaymentId: null,
    });

    const mockOrder = new Order({
      id: mockOrderId,
      status: 'PENDING',
      userId: mockUserId,
      total: 10,
    });

    const mockEvent = {
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: mockStripePaymentId,
        } as Stripe.PaymentIntent,
      },
    } as Stripe.Event;

    paymentRepository.getPayment.mockResolvedValue(mockPayment);
    orderRepository.getOrder.mockResolvedValue(mockOrder);
    envService.get.mockReturnValue(mockWebhookKey);
    stripeService.webhookConstructEvent.mockReturnValue(mockEvent);
    paymentRepository.updatePayment.mockImplementation((_, payment) =>
      Promise.resolve(payment as Payment),
    );

    const result = await useCase.execute({
      paymentId: mockPaymentId,
      rawBody: mockRawBody,
      signature: mockSignature,
      paymentAt: mockPaymentAt,
    });

    expect(result.status).toBe('PAID');
    expect(result.stripePaymentId).toBe(mockStripePaymentId);
    expect(result.paymentAt).toEqual(new Date(mockPaymentAt * 1000));
  });

  it('should throw BadRequestException when payment not found', async () => {
    paymentRepository.getPayment.mockResolvedValue(null);

    await expect(
      useCase.execute({
        paymentId: mockPaymentId,
        rawBody: mockRawBody,
        signature: mockSignature,
        paymentAt: mockPaymentAt,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when order already paid', async () => {
    const mockPayment = new Payment({
      paymentId: mockPaymentId,
      orderId: mockOrderId,
      status: 'PENDING',
      amount: 10,
      currency: 'USD',
      stripePaymentId: null,
    });

    const mockOrder = new Order({
      id: mockOrderId,
      status: 'PAID',
      userId: mockUserId,
      total: 10,
    });

    paymentRepository.getPayment.mockResolvedValue(mockPayment);
    orderRepository.getOrder.mockResolvedValue(mockOrder);

    await expect(
      useCase.execute({
        paymentId: mockPaymentId,
        rawBody: mockRawBody,
        signature: mockSignature,
        paymentAt: mockPaymentAt,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when webhook signature verification fails', async () => {
    const mockPayment = new Payment({
      paymentId: mockPaymentId,
      orderId: mockOrderId,
      status: 'PENDING',
      amount: 10,
      currency: 'USD',
      stripePaymentId: null,
    });

    const mockOrder = new Order({
      id: mockOrderId,
      status: 'PENDING',
      userId: mockUserId,
      total: 10,
    });

    paymentRepository.getPayment.mockResolvedValue(mockPayment);
    orderRepository.getOrder.mockResolvedValue(mockOrder);
    envService.get.mockReturnValue(mockWebhookKey);
    stripeService.webhookConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await expect(
      useCase.execute({
        paymentId: mockPaymentId,
        rawBody: mockRawBody,
        signature: mockSignature,
        paymentAt: mockPaymentAt,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
