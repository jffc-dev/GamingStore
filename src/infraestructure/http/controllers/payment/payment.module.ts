import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { CreatePaymentUseCase } from 'src/application/use-cases/payment/create-payment.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { StripeModule } from 'src/infraestructure/services/stripe/stripe.module';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { ProcessPaymentUseCase } from 'src/application/use-cases/payment/process-payment.use-case';

@Module({
  providers: [CreatePaymentUseCase, ProcessPaymentUseCase],
  controllers: [PaymentController],
  imports: [UuidModule, StripeModule, EnvModule],
})
export class PaymentModule {}
