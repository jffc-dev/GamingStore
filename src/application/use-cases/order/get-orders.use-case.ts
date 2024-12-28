import { Injectable } from '@nestjs/common';
import { Order } from 'src/domain/order';
import { OrderRepository } from '../../contracts/persistence/order.repository';

interface IFiltersProps {
  userId?: string;
}

interface IGetUserOrdersUseCaseProps {
  filters?: IFiltersProps;
}
@Injectable()
export class GetUserOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({ filters }: IGetUserOrdersUseCaseProps): Promise<Order[]> {
    const { userId } = filters;
    const ordersResponse = await this.orderRepository.getOrders(userId);
    return ordersResponse;
  }
}
