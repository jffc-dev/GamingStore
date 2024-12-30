import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { StripeModule } from 'src/infraestructure/services/stripe/stripe.module';

@Module({
  providers: [CreatePaymentUseCase],
  controllers: [PaymentController],
  imports: [UuidModule, StripeModule],
})
export class PaymentModule {}
