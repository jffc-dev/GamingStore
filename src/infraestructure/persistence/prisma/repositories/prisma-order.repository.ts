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

  async getOrder(orderId: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: {
        orderId,
      },
    });

    if (!order) {
      return null;
    }

    if (!order) return null;

    return PrismaOrderMapper.toDomain(order);
  }

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

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
      },
    });

    return orders.map(PrismaOrderMapper.toDomain);
  }

  async getOrders(userId?: string): Promise<Order[]> {
    const filter = {
      userId,
    };
    const orders = await this.prisma.order.findMany({
      where: filter,
    });

    return orders.map(PrismaOrderMapper.toDomain);
  }

  async getDetailsByOrderIds(orderIds: string[]): Promise<OrderDetail[]> {
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: {
        orderId: { in: orderIds },
      },
    });

    return orderDetails.map(PrismaOrderDetailMapper.toDomain);
  }

  async createFullOrder(order: Order, userId: string): Promise<Order> {
    const result = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          status: order.status,
          total: order.total,
          orderDetails: {
            create: order.orderDetails.map((detail) => ({
              orderDetailId: detail.id,
              productId: detail.productId,
              quantity: detail.quantity,
              unitPrice: detail.unitPrice,
              subtotal: detail.subtotal,
            })),
          },
        },
      });

      const stockPromises = [];
      order.orderDetails.map((orderDetail) => {
        const stockPromise = tx.product.update({
          where: {
            productId: orderDetail.productId,
          },
          data: {
            stock: { decrement: orderDetail.quantity },
          },
        });
        stockPromises.push(stockPromise);
      });

      const stockResults = await Promise.all(stockPromises);

      const deleteCart = await tx.cartDetail.deleteMany({
        where: {
          userId,
        },
      });

      return { createdOrder, stockResults, deleteCart };
    });

    return PrismaOrderMapper.toDomain(result.createdOrder);
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
      throw new Error(`Order not found`);
    } else if (code === 'P2002') {
      throw new Error(`${meta.target[0]} had been already registered`);
    }

    throw new Error(`Internal server error`);
  }
}
