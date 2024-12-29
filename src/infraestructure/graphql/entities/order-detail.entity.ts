import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { OrderDetail as DomainOrderDetail } from 'src/domain/order-detail';

@ObjectType()
export class OrderDetail {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  orderId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int, { nullable: true })
  quantity: number;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field(() => Float, { nullable: true })
  subtotal?: number;

  static fromDomainToEntity(domainObject: DomainOrderDetail): OrderDetail {
    return {
      id: domainObject.id,
      orderId: domainObject.orderId,
      productId: domainObject.productId,
      quantity: domainObject.quantity,
      unitPrice: domainObject.unitPrice,
      subtotal: domainObject.subtotal,
    };
  }
}
