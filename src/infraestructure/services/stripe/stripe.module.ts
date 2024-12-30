import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { EnvModule } from 'src/infraestructure/env/env.module';

@Module({
  providers: [StripeService],
  exports: [StripeService],
  imports: [EnvModule],
})
export class StripeModule {}
