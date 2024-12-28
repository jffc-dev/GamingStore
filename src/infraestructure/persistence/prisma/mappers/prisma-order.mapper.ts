import {
  OrderDetail as PrismaOrderDetail,
  Prisma,
  Order as PrismaOrder,
} from '@prisma/client';
import { Order } from 'src/domain/order';
import { OrderDetail } from 'src/domain/order-detail';

export class PrismaOrderMapper {
  static toDomain(
    entity: PrismaOrder & { orderDetails?: PrismaOrderDetail[] },
  ): Order {
    return new Order({
      id: entity.orderId,
      status: entity.status,
      userId: entity.userId,
      total: entity.total ? Number(entity.total) : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      orderDetails: entity.orderDetails
        ? entity.orderDetails.map((detail) =>
            PrismaOrderDetailMapper.toDomain(detail),
          )
        : undefined,
    });
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      orderId: order.id,
      status: order.status,
      userId: order.userId,
      total: order.total,
      createdAt: order.createdAt,
      orderDetails: order.orderDetails
        ? {
            create: order.orderDetails.map((detail) =>
              PrismaOrderDetailMapper.toPrisma(new OrderDetail(detail)),
            ),
          }
        : undefined,
    };
  }
}

export class PrismaOrderDetailMapper {
  static toDomain(entity: PrismaOrderDetail): OrderDetail {
    return new OrderDetail({
      id: entity.orderDetailId,
      orderId: entity.orderId,
      productId: entity.productId,
      quantity: entity.quantity,
      unitPrice: entity.unitPrice ? Number(entity.unitPrice) : undefined,
      subtotal: entity.subtotal ? Number(entity.subtotal) : undefined,
    });
  }

  static toPrisma(
    orderDetail: OrderDetail,
  ): Prisma.OrderDetailUncheckedCreateInput {
    return {
      orderDetailId: orderDetail.id,
      orderId: orderDetail.orderId,
      productId: orderDetail.productId,
      quantity: orderDetail.quantity,
      unitPrice: orderDetail.unitPrice,
      subtotal: orderDetail.subtotal,
    };
  }
}
