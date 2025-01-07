import { Payment } from 'src/domain/payment';

export abstract class PaymentRepository {
  abstract createPayment(data: Payment): Promise<Payment>;
  abstract getPayment(paymentId: string): Promise<Payment>;
  abstract updatePayment(paymentId: string, data: Payment): Promise<Payment>;

  abstract handleDBError(error: any): void;
}
