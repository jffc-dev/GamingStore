import { Module } from '@nestjs/common';
import { AuthHttpModule } from './controllers/auth-http/auth-http.module';

@Module({
  controllers: [],
  imports: [AuthHttpModule],
  exports: [],
})
export class HttpModule {}
