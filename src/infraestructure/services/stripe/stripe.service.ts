import { Injectable } from '@nestjs/common';
import { EnvService } from 'src/infraestructure/env/env.service';
import Stripe from 'stripe';

interface ICreatePaymentIntentProps {
  amount: number;
  currency: 'usd';
  metadata: { paymentId: string };
}

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly envService: EnvService) {
    const stripeApiKey = this.envService.get('STRIPE_API_KEY');
    this.stripe = new Stripe(stripeApiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(
    props: ICreatePaymentIntentProps,
  ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const { amount, currency, metadata } = props;
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      metadata,
    });

    return paymentIntent;
  }
}
