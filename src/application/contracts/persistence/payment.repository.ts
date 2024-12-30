import { Payment } from 'src/domain/Payment';

export abstract class PaymentRepository {
  abstract createPayment(data: Payment): Promise<Payment>;
  abstract getPayment(paymentId: string): Promise<Payment>;

  abstract handleDBError(error: any): void;
}
