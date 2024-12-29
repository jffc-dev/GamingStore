import { ObjectType, Field, Float } from '@nestjs/graphql';
import { OrderDetail } from './order-detail.entity';
import { Order as DomainOrder } from 'src/domain/order';

@ObjectType()
export class Order {
  @Field(() => String)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  userId: string;

  @Field(() => Float, { nullable: true })
  total?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => [OrderDetail])
  orderDetails: OrderDetail[];

  static fromDomainToEntity(domainObject: DomainOrder): Order {
    return {
      id: domainObject.id,
      status: domainObject.status,
      userId: domainObject.userId,
      total: domainObject.total,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
      orderDetails: [],
    };
  }
}
