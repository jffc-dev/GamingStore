import { Module } from '@nestjs/common';
import { AuthHttpModule } from './controllers/auth-http/auth-http.module';
import { ProductImageModule } from './controllers/product-image/product-image.module';

@Module({
  controllers: [],
  imports: [AuthHttpModule, ProductImageModule],
  exports: [],
})
export class HttpModule {}
