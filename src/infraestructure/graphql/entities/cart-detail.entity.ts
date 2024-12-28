import { Field, Int, ObjectType } from '@nestjs/graphql';
import { CartDetail as DomainCartDetail } from 'src/domain/cart-detail';

@ObjectType()
export class CartDetail {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  static fromDomainToEntity(domainObject: DomainCartDetail): CartDetail {
    return {
      userId: domainObject.userId,
      productId: domainObject.productId,
      quantity: domainObject.quantity,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
    };
  }
}
