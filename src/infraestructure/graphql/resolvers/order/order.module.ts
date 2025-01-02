import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { OrderDetailsLoader } from './dataloaders/order-details.loader';
import { GetOrderDetailsUseCase } from 'src/application/use-cases/order/get-order-details.use-case';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-orders.use-case';

@Module({
  providers: [
    CreateOrderFromCartUseCase,
    GetOrderDetailsUseCase,
    GetUserOrdersUseCase,

    OrderResolver,

    OrderDetailsLoader,
  ],
  imports: [UuidModule],
})
export class OrderModule {}
