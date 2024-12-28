import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderRepository } from '../../../../application/contracts/persistence/order.repository';
import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';
import {
  PrismaOrderDetailMapper,
  PrismaOrderMapper,
} from '../mappers/prisma-order.mapper';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaService) {}

  async createOrder(order: Order): Promise<Order> {
    const createdOrder = await this.prisma.order.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        status: order.status,
        total: order.total,
      },
    });

    return PrismaOrderMapper.toDomain(createdOrder);
  }

  async createFullOrder(order: Order): Promise<Order> {
    const createdOrder = await this.prisma.order.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        status: order.status,
        total: order.total,
      },
    });

    return PrismaOrderMapper.toDomain(createdOrder);
  }

  async createOrderDetail(orderDetail: OrderDetail): Promise<OrderDetail> {
    const createdDetailOrder = await this.prisma.orderDetail.create({
      data: {
        orderDetailId: orderDetail.id,
        orderId: orderDetail.orderId,
        productId: orderDetail.productId,
        quantity: orderDetail.quantity,
        subtotal: orderDetail.subtotal,
        unitPrice: orderDetail.unitPrice,
      },
    });

    return PrismaOrderDetailMapper.toDomain(createdDetailOrder);
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new Error(`Product not found`);
    } else if (code === 'P2002') {
      throw new Error(`${meta.target[0]} had been already registered`);
    }

    throw new Error(`Internal server error`);
  }
}
