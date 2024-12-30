import { Injectable } from '@nestjs/common';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { PrismaService } from '../prisma.service';
import { Payment } from 'src/domain/payment';
import { PrismaPaymentMapper } from '../mappers/prisma-payment.mapper';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private prisma: PrismaService) {}

  async updatePayment(paymentId: string, data: Payment): Promise<Payment> {
    const result = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: {
          paymentId,
        },
        data: {
          status: data.status as any,
          paymentAt: data.paymentAt,
        },
      });

      const updatedOrder = await tx.order.update({
        where: {
          orderId: updatedPayment.orderId,
        },
        data: {
          status: data.status as any,
        },
      });

      return { updatedPayment, updatedOrder };
    });

    return PrismaPaymentMapper.toDomain(result.updatedPayment);
  }

  async createPayment(data: Payment): Promise<Payment> {
    const createdOrder = await this.prisma.payment.create({
      data: {
        paymentId: data.paymentId,
        amount: data.amount,
        currency: data.currency,
        stripePaymentId: data.stripePaymentId,
        order: {
          connect: { orderId: data.orderId },
        },
      },
    });

    return PrismaPaymentMapper.toDomain(createdOrder);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const order = await this.prisma.payment.findUnique({
      where: {
        paymentId,
      },
    });

    if (!order) {
      return null;
    }

    return PrismaPaymentMapper.toDomain(order);
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new Error(`Payment not found`);
    } else if (code === 'P2002') {
      throw new Error(`${meta.target[0]} had been already registered`);
    }

    throw new Error(`Internal server error`);
  }
}
