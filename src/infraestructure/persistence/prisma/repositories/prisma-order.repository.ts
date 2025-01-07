import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrderRepository } from '../../../../application/contracts/persistence/order.repository';
import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';
import {
  PrismaOrderDetailMapper,
  PrismaOrderMapper,
} from '../mappers/prisma-order.mapper';
import { ACTION_CREATE, ACTION_FIND } from 'src/application/utils/constants';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private prisma: PrismaService) {}

  async getOrderOrThrow(orderId: string): Promise<Order> {
    try {
      const order = await this.prisma.order.findUniqueOrThrow({
        where: {
          orderId,
        },
      });

      return PrismaOrderMapper.toDomain(order);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          orderId,
        },
      });

      if (!order) {
        return null;
      }

      return PrismaOrderMapper.toDomain(order);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async createOrder(order: Order): Promise<Order> {
    try {
      const createdOrder = await this.prisma.order.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          status: order.status,
          total: order.total,
        },
      });

      return PrismaOrderMapper.toDomain(createdOrder);
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const filter: Record<string, any> = {};

      if (userId) {
        filter.userId = userId;
      }
      const orders = await this.prisma.order.findMany({
        where: filter,
      });

      return orders.map(PrismaOrderMapper.toDomain);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async getDetailsByOrderIds(orderIds: string[]): Promise<OrderDetail[]> {
    try {
      const orderDetails = await this.prisma.orderDetail.findMany({
        where: {
          orderId: { in: orderIds },
        },
      });

      return orderDetails.map(PrismaOrderDetailMapper.toDomain);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async createFullOrder(order: Order, userId: string): Promise<Order> {
    try {
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
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  async createOrderDetail(orderDetail: OrderDetail): Promise<OrderDetail> {
    try {
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
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    const { meta = {} } = error;
    meta.action = action;

    throw error;
  }
}
