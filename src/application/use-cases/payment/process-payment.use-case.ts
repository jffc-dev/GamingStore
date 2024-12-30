import { BadRequestException, Injectable } from '@nestjs/common';
import { Payment } from 'src/domain/payment';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { StripeService } from 'src/infraestructure/services/stripe/stripe.service';
import Stripe from 'stripe';
import { EnvService } from 'src/infraestructure/env/env.service';
import { OrderRepository } from 'src/application/contracts/persistence/order.repository';

interface IProcessPaymentUseCaseProps {
  paymentId: string;
  rawBody: any;
  signature: string;
  paymentAt: number;
}
@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly stripeService: StripeService,
    private readonly envService: EnvService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute({
    paymentId,
    rawBody,
    signature,
    paymentAt,
  }: IProcessPaymentUseCaseProps): Promise<Payment> {
    const payment = await this.paymentRepository.getPayment(paymentId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const order = await this.orderRepository.getOrder(payment.orderId);

    if (order.status !== 'PENDING') {
      throw new BadRequestException('This order has already been paid');
    }

    const endpointSecret = this.envService.get('STRIPE_WEBHOOK_KEY');

    let event: Stripe.Event;

    try {
      event = this.stripeService.webhookConstructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    payment.stripePaymentId = paymentIntent.id;

    switch (event.type) {
      case 'payment_intent.succeeded':
        payment.status = 'PAID';
        payment.paymentAt = new Date(paymentAt * 1000);
        break;
      case 'payment_intent.payment_failed':
        payment.status = 'FAILED';
        break;
      default:
        throw new BadRequestException(`Unhandled event type: ${event.type}`);
    }

    const updatedPayment = await this.paymentRepository.updatePayment(
      paymentId,
      payment,
    );

    return updatedPayment;
  }
}
