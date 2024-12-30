import { Prisma, Payment as PrismaPayment } from '@prisma/client';
import { Payment } from 'src/domain/payment';

export class PrismaPaymentMapper {
  static toDomain(entity: PrismaPayment): Payment {
    return new Payment({
      paymentId: entity.paymentId,
      orderId: entity.orderId,
      stripePaymentId: entity.stripePaymentId,
      amount: Number(entity.amount),
      currency: entity.currency,
      status: entity.status as any,
      paymentAt: entity.paymentAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPrisma(domain: Payment): Prisma.PaymentUncheckedCreateInput {
    return {
      paymentId: domain.paymentId,
      orderId: domain.orderId,
      stripePaymentId: domain.stripePaymentId,
      amount: domain.amount,
      currency: domain.currency,
      status: domain.status as any,
      paymentAt: domain.paymentAt,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
