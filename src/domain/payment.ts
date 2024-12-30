import { Entity } from 'src/core/entity';

type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface PaymentProps {
  paymentId?: string;
  orderId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Payment extends Entity<PaymentProps> {
  constructor(props: PaymentProps) {
    super(props);
  }

  get paymentId(): string | undefined {
    return this.props.paymentId;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get stripePaymentId(): string {
    return this.props.stripePaymentId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get paymentAt(): Date | undefined {
    return this.props.paymentAt;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  set status(status: PaymentStatus) {
    this.props.status = status;
  }

  set paymentAt(paymentAt: Date) {
    this.props.paymentAt = paymentAt;
  }

  set stripePaymentId(stripePaymentId: string) {
    this.props.stripePaymentId = stripePaymentId;
  }
}
