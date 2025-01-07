import { Field, ObjectType } from '@nestjs/graphql';
import { LikeProduct as DomainLikeProduct } from 'src/domain/like-product';

@ObjectType()
export class LikeProduct {
  @Field(() => String)
  productId: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  static fromDomainToEntity(domainObject: DomainLikeProduct): LikeProduct {
    return {
      productId: domainObject.productId,
      createdAt: domainObject.createdAt,
    };
  }
}
