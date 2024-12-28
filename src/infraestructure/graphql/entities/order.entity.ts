import { ObjectType, Field, Float } from '@nestjs/graphql';
import { OrderDetail } from './order-detail.entity';
import { Order as DomainOrder } from 'src/domain/order';

@ObjectType()
export class Order {
  @Field(() => String)
  orderId: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  userId: string;

  @Field(() => Float, { nullable: true })
  total?: number;

  @Field(() => Boolean, { defaultValue: false })
  isDeleted: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => [OrderDetail])
  orderDetails: OrderDetail[];

  static fromDomainToEntity(domainObject: DomainOrder): Order {
    return {
      orderId: domainObject.id,
      status: domainObject.status,
      userId: domainObject.userId,
      total: domainObject.total,
      isDeleted: domainObject.isDeleted,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
      deletedAt: domainObject.deletedAt,
      orderDetails: [],
    };
  }
}
