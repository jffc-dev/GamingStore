import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { OrderDetail } from 'src/domain/order-detail';

interface IGetOrderDetailsUseCaseProps {
  orderIds: string[];
}
@Injectable()
export class GetOrderDetailsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute({
    orderIds,
  }: IGetOrderDetailsUseCaseProps): Promise<OrderDetail[]> {
    const ordersResponse =
      await this.orderRepository.getDetailsByOrderIds(orderIds);
    return ordersResponse;
  }
}
