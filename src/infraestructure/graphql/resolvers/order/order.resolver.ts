import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Order } from '../../entities/order.entity';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { User } from 'src/domain/user';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-user-orders.use-case';
import { ListOrdersFilterDto } from '../../dto/order/list-orders.dto';

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
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Order, { name: 'createOrder' })
  async createOrder(@Context() context: any): Promise<Order> {
    const currentUser: User = context.req.user;

    const orderResponse = await this.createOrderFromCartUseCase.execute({
      userId: currentUser.id,
    });
    return Order.fromDomainToEntity(orderResponse);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Order], { name: 'myOrders' })
  async getUserOrders(@Context() context: any): Promise<Order[]> {
    const currentUser: User = context.req.user;
    const userOrders = await this.getUserOrdersUseCase.execute({
      userId: currentUser.id,
    });
    return userOrders.map(Order.fromDomainToEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Order], { name: 'orders' })
  async getOrders(@Args() filters: ListOrdersFilterDto): Promise<Order[]> {
    const userOrders = await this.getUserOrdersUseCase.execute({
      userId: filters.userId,
    });
    return userOrders.map(Order.fromDomainToEntity);
  }
}
