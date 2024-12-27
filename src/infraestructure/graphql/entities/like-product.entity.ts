import { Field, ObjectType } from '@nestjs/graphql';
import { LikeProduct as DomainLikeProduct } from 'src/domain/like-product';

@ObjectType()
export class LikeProduct {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  static fromDomainToEntity(domainObject: DomainLikeProduct): LikeProduct {
    return {
      userId: domainObject.userId,
      productId: domainObject.productId,
      createdAt: domainObject.createdAt,
    };
  }
}
