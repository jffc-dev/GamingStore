import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Order } from '../../entities/order.entity';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { User } from 'src/domain/user';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { ListOrdersFilterDto } from '../../dto/order/list-orders.dto';
import { OrderDetail } from '../../entities/order-detail.entity';
import { OrderDetailsLoader } from '../../../common/dataloaders/order-details.loader';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';
import { SkipThrottle } from '@nestjs/throttler';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-orders.use-case';

@SkipThrottle()
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
    private readonly getUserOrdersUseCase: GetUserOrdersUseCase,

    private readonly orderDetailsLoader: OrderDetailsLoader,
  ) {}

  @Auth(ValidRoles.client)
  @Mutation(() => Order, { name: 'createOrder' })
  async createOrder(@Context() context: any): Promise<Order> {
    const currentUser: User = context.req.user;

    const orderResponse = await this.createOrderFromCartUseCase.execute({
      userId: currentUser.id,
    });
    return Order.fromDomainToEntity(orderResponse);
  }

  @Auth(ValidRoles.client)
  @UseGuards(JwtAuthGuard)
  @Query(() => [Order], { name: 'myOrders' })
  async getUserOrders(@Context() context: any): Promise<Order[]> {
    const currentUser: User = context.req.user;
    const userOrders = await this.getUserOrdersUseCase.execute({
      filters: { userId: currentUser.id },
    });
    return userOrders.map(Order.fromDomainToEntity);
  }

  @Auth(ValidRoles.manager)
  @Query(() => [Order], { name: 'orders' })
  async getOrders(@Args() filters: ListOrdersFilterDto): Promise<Order[]> {
    const userOrders = await this.getUserOrdersUseCase.execute({
      filters: { userId: filters.userId },
    });
    return userOrders.map(Order.fromDomainToEntity);
  }

  @ResolveField(() => [OrderDetail])
  async orderDetails(@Parent() order: Order): Promise<OrderDetail[]> {
    const details = await this.orderDetailsLoader.load(order.id);
    return details;
  }
}
