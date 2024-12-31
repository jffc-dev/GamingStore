import { Entity } from 'src/application/core/entity';

export interface LikeProductProps {
  userId: string;
  productId: string;
  createdAt?: Date;
}

export class LikeProduct extends Entity<LikeProductProps> {
  constructor(props: LikeProductProps) {
    super(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
