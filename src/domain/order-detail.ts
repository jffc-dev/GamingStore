import { Entity } from 'src/core/entity';

export interface OrderDetailProps {
  id?: number;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export class OrderDetail extends Entity<OrderDetailProps> {
  constructor(props: OrderDetailProps) {
    super(props);
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  set quantity(value: number) {
    this.props.quantity = value;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  set unitPrice(value: number) {
    this.props.unitPrice = value;
  }

  get subtotal(): number | undefined {
    return this.props.subtotal;
  }

  set subtotal(value: number | undefined) {
    this.props.subtotal = value;
  }
}
