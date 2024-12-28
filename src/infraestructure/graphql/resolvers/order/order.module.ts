import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-user-orders.use-case';

@Module({
  providers: [CreateOrderFromCartUseCase, GetUserOrdersUseCase, OrderResolver],
  imports: [UuidModule],
})
export class OrderModule {}
