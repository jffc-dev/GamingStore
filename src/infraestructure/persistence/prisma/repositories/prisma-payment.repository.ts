import { Injectable } from '@nestjs/common';
import { PaymentRepository } from 'src/application/contracts/persistence/payment.repository';
import { PrismaService } from '../prisma.service';
import { Payment } from 'src/domain/payment';
import { PrismaPaymentMapper } from '../mappers/prisma-payment.mapper';
import { Prisma } from '@prisma/client';
import {
  ACTION_CREATE,
  ACTION_FIND,
  ACTION_UPDATE,
} from 'src/application/utils/constants';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private prisma: PrismaService) {}

  async updatePayment(paymentId: string, data: Payment): Promise<Payment> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: {
            paymentId,
          },
          data: {
            status: data.status,
            paymentAt: data.paymentAt,
          },
        });

        let updatedOrder = null;

        if (data.status === 'PAID') {
          updatedOrder = await tx.order.update({
            where: {
              orderId: updatedPayment.orderId,
            },
            data: {
              status: data.status,
            },
          });
        }

        return { updatedPayment, updatedOrder };
      });

      return PrismaPaymentMapper.toDomain(result.updatedPayment);
    } catch (error) {
      this.handleDBError(error, ACTION_UPDATE);
    }
  }

  async createPayment(data: Payment): Promise<Payment> {
    try {
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
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    try {
      const order = await this.prisma.payment.findUnique({
        where: {
          paymentId,
        },
      });

      if (!order) {
        return null;
      }

      return PrismaPaymentMapper.toDomain(order);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
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
