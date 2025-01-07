import { BadRequestException, Injectable } from '@nestjs/common';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Payment } from 'src/domain/payment';
import { OrderRepository } from 'src/application/contracts/persistence/order.repository';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { StripeService } from 'src/infraestructure/services/stripe/stripe.service';
import {
  DEFAULT_CURRENCY,
  INITIAL_PAYMENT_STATE,
} from 'src/application/utils/constants';

interface ICreatePaymentUseCaseProps {
  orderId: string;
  userId: string;
}
@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly uuidService: UuidService,
    private readonly orderRepository: OrderRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeService: StripeService,
  ) {}

  async execute({
    orderId,
    userId,
  }: ICreatePaymentUseCaseProps): Promise<Payment> {
    const order = await this.orderRepository.getOrderOrThrow(orderId);

    if (order.userId !== userId) {
      throw new BadRequestException('This order is not yours');
    }

    const payment = new Payment({
      paymentId: this.uuidService.generateUuid(),
      amount: order.total,
      currency: DEFAULT_CURRENCY,
      orderId: order.id,
      status: INITIAL_PAYMENT_STATE,
      stripePaymentId: this.uuidService.generateUuid(),
    });

    const paymentResponse = await this.paymentRepository.createPayment(payment);
    const { amount, currency, paymentId } = paymentResponse;

    await this.stripeService.createPaymentIntent({
      amount: amount,
      currency: currency,
      metadata: { paymentId },
    });

    return paymentResponse;
  }
}
