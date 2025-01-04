import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { ProcessPaymentUseCase } from 'src/application/use-cases/payment/process-payment.use-case';
import { CreatePaymentIntentDto } from '../../dto/payment/payment-intent.dto';
import { User } from 'src/domain/user';

describe('PaymentController', () => {
  let controller: PaymentController;
  let createPaymentUseCase: CreatePaymentUseCase;
  let processPaymentUseCase: ProcessPaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: CreatePaymentUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ProcessPaymentUseCase,
          useValue: { execute: jest.fn() },
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
    it('should call CreatePaymentUseCase with correct data', async () => {
      const dto: CreatePaymentIntentDto = { orderId: '' };
      const user: User = { id: 'userId', email: 'test@example.com' } as User;
      const payment = { id: 'paymentId', amount: 100 } as any;

      jest.spyOn(createPaymentUseCase, 'execute').mockResolvedValue(payment);

      const result = await controller.createPayment(dto, user);

      expect(createPaymentUseCase.execute).toHaveBeenCalledWith({
        ...dto,
        userId: user.id,
      });
      expect(result).toBe(payment);
    });
  });

  describe('stripeWebhook', () => {
    it('should call ProcessPaymentUseCase with correct data', async () => {
      const rawBody = Buffer.from('raw_body_data');
      const signature = 'test_signature';
      const request: any = {
        headers: { 'stripe-signature': signature },
        body: {
          created: new Date().toISOString(),
          data: {
            object: {
              metadata: { paymentId: 'paymentId' },
            },
          },
        },
        rawBody,
      };
      const payment = { id: 'paymentId', status: 'success' } as any;

      jest.spyOn(processPaymentUseCase, 'execute').mockResolvedValue(payment);

      const result = await controller.stripeWebhook(request);

      expect(processPaymentUseCase.execute).toHaveBeenCalledWith({
        paymentId: 'paymentId',
        rawBody,
        signature,
        paymentAt: request.body.created,
      });
      expect(result).toBe(payment);
    });
  });
});
