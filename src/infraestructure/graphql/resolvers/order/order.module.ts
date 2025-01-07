import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { OrderDetailsLoader } from '../../../common/dataloaders/order-details.loader';
import { GetOrderDetailsUseCase } from 'src/application/use-cases/order/get-order-details.use-case';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-orders.use-case';
import { OrderDetailResolver } from './order-detail.resolver';
import { ProductLoader } from 'src/infraestructure/common/dataloaders/product.loader';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';

@Module({
  providers: [
    CreateOrderFromCartUseCase,
    GetOrderDetailsUseCase,
    GetUserOrdersUseCase,
    GetProductsByIdsUseCase,

    OrderResolver,
    OrderDetailResolver,

    OrderDetailsLoader,
    ProductLoader,
  ],
  imports: [UuidModule],
})
export class OrderModule {}
