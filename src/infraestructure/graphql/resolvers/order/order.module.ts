import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-user-orders.use-case';
import { OrderDetailsLoader } from './dataloaders/order-details.loader';
import { GetOrderDetailsUseCase } from 'src/application/use-cases/order/get-order-details.use-case';
import { BullModule } from '@nestjs/bull';

@Module({
  providers: [
    CreateOrderFromCartUseCase,
    GetUserOrdersUseCase,
    GetOrderDetailsUseCase,

    OrderResolver,

    OrderDetailsLoader,
  ],
  imports: [
    UuidModule,
    BullModule.registerQueue({
      name: 'stock-notifications',
    }),
  ],
})
export class OrderModule {}
