import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';

export abstract class OrderRepository {
  abstract createOrder(data: Order): Promise<Order>;
  abstract createOrderDetail(data: OrderDetail): Promise<OrderDetail>;
  abstract createFullOrder(data: Order, userId: string): Promise<Order>;
  abstract getOrdersByUser(userId: string): Promise<Order[]>;
  abstract getOrders(userId: string): Promise<Order[]>;
  abstract getDetailsByOrderIds(orderIds: string[]): Promise<OrderDetail[]>;

  abstract handleDBError(error: any): void;
}
