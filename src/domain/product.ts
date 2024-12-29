import { Entity } from 'src/core/entity';

export interface ProductProps {
  productId?: string;
  categoryId: string;
  name: string;
  description?: string;
  stock?: number;
  isActive?: boolean;
  price: number;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Product extends Entity<ProductProps> {
  constructor(props: ProductProps) {
    super(props);
  }

  get productId(): string {
    return this.props.productId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get stock(): number {
    return this.props.stock;
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }

  get price(): number {
    return this.props.price;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted ?? false;
  }

  get createdAt(): Date {
    return this.props.createdAt ?? new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt ?? new Date();
  }

  get deletedAt(): Date {
    return this.props.deletedAt;
  }

  set name(value: string) {
    this.props.name = value;
  }

  set description(value: string) {
    this.props.description = value;
  }

  set stock(value: number) {
    this.props.stock = value;
  }

  set isActive(value: boolean) {
    this.props.isActive = value;
  }

  set price(value: number) {
    this.props.price = value;
  }

  set isDeleted(value: boolean) {
    this.props.isDeleted = value;
  }

  set updatedAt(value: Date) {
    this.props.updatedAt = value;
  }

  set deletedAt(value: Date) {
    this.props.deletedAt = value;
  }
}
