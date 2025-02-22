import { Entity } from 'src/application/core/entity';

export interface CartDetailProps {
  userId: string;
  productId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CartDetail extends Entity<CartDetailProps> {
  constructor(props: CartDetailProps) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
}
