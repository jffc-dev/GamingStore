import { Entity } from 'src/application/core/entity';

export interface ProductImageProps {
  id?: string;
  productId: string;
  url: string;
  createdAt?: Date;
}

export class ProductImage extends Entity<ProductImageProps> {
  constructor(props: ProductImageProps) {
    super(props);
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get url(): string {
    return this.props.url;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  set url(newUrl: string) {
    this.props.url = newUrl;
  }

  set createdAt(date: Date) {
    this.props.createdAt = date;
  }
}
