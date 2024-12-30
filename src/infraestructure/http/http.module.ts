import { Module } from '@nestjs/common';
import { AuthHttpModule } from './controllers/auth-http/auth-http.module';
import { ProductImageModule } from './controllers/product-image/product-image.module';
import { PaymentModule } from './controllers/payment/payment.module';

@Module({
  controllers: [],
  imports: [AuthHttpModule, ProductImageModule, PaymentModule],
  exports: [],
})
export class HttpModule {}
