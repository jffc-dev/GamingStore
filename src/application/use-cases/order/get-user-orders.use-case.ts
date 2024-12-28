import { Injectable } from '@nestjs/common';
import { Order } from 'src/domain/order';
import { OrderRepository } from '../../contracts/persistence/order.repository';

interface IGetUserOrdersUseCaseProps {
  userId: string;
}
@Injectable()
export class GetUserOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({ userId }: IGetUserOrdersUseCaseProps): Promise<Order[]> {
    const ordersResponse = await this.orderRepository.getOrdersByUser(userId);
    return ordersResponse;
  }
}
