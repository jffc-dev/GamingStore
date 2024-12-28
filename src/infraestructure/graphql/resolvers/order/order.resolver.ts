import { Context, Mutation, Resolver } from '@nestjs/graphql';
import { Order } from '../../entities/order.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { User } from 'src/domain/user';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
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
}
