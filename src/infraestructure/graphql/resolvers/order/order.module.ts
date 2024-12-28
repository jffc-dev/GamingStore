import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';

@Module({
  providers: [CreateOrderFromCartUseCase, OrderResolver],
  imports: [UuidModule],
})
export class OrderModule {}
