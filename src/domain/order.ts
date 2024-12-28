import { Entity } from 'src/core/entity';
import { OrderDetail } from './order-detail';

export interface OrderProps {
  id?: string;
  status: StatusType;
  userId: string;
  total: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  orderDetails?: OrderDetail[];
}

type StatusType = 'PENDING' | 'PAID';

export class Order extends Entity<OrderProps> {
  constructor(props: OrderProps) {
    super(props);
    this.orderDetails = [];
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get status(): StatusType {
    return this.props.status;
  }

  set status(value: StatusType) {
    this.props.status = value;
  }

  get userId(): string {
    return this.props.userId;
  }

  get total(): number | undefined {
    return this.props.total;
  }

  set total(value: number | undefined) {
    this.props.total = value;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted ?? false;
  }

  set isDeleted(value: boolean) {
    this.props.isDeleted = value;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  get orderDetails(): OrderDetail[] | undefined {
    return this.props.orderDetails;
  }

  set orderDetails(details: OrderDetail[] | undefined) {
    this.props.orderDetails = details;
  }
}
