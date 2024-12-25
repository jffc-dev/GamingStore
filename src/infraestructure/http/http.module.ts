import { Module } from '@nestjs/common';
import { AuthModule } from './controllers/auth/auth.module';

@Module({
  controllers: [],
  imports: [AuthModule],
  exports: [],
})
export class HttpModule {}
