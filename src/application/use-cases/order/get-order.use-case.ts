import { Injectable } from '@nestjs/common';
import { Order } from 'src/domain/order';
import { OrderRepository } from '../../contracts/persistence/order.repository';

interface IGetOrderByIdUseCaseProps {
  orderId?: string;
}
@Injectable()
export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({ orderId }: IGetOrderByIdUseCaseProps): Promise<Order> {
    const orderResponse = await this.orderRepository.getOrder(orderId);
    return orderResponse;
  }
}
