import { BadRequestException, Injectable } from '@nestjs/common';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Payment } from 'src/domain/payment';
import { OrderRepository } from 'src/application/contracts/persistence/order.repository';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { StripeService } from 'src/infraestructure/services/stripe/stripe.service';

interface ICreatePaymentUseCaseProps {
  orderId: string;
}
@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly uuidService: UuidService,
    private readonly orderRepository: OrderRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeService: StripeService,
  ) {}

  async execute({ orderId }: ICreatePaymentUseCaseProps): Promise<Payment> {
    const order = await this.orderRepository.getOrder(orderId);

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const payment = new Payment({
      paymentId: this.uuidService.generateUuid(),
      amount: order.total,
      currency: 'usd',
      orderId: order.id,
      status: 'PENDING',
      stripePaymentId: this.uuidService.generateUuid(),
    });

    const paymentResponse = await this.paymentRepository.createPayment(payment);
    const { amount, currency, paymentId } = paymentResponse;
    console.log(amount);

    const stripeResponse = await this.stripeService.createPaymentIntent({
      amount: amount,
      currency: currency as any,
      metadata: { paymentId },
    });

    console.log(stripeResponse);
    return paymentResponse;
  }
}
