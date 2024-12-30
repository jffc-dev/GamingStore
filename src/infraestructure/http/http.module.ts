import { Module } from '@nestjs/common';
import { AuthHttpModule } from './controllers/auth-http/auth-http.module';
import { ProductImageModule } from './controllers/product-image/product-image.module';
import { PaymentModule } from './controllers/payment/payment.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  controllers: [],
  imports: [
    AuthHttpModule,
    ProductImageModule,
    PaymentModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 3,
      },
    ]),
  ],
  exports: [],
})
export class HttpModule {}
