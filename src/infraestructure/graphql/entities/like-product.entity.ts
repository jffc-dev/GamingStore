import { Field, ObjectType } from '@nestjs/graphql';
import { LikeProduct as DomainLikeProduct } from 'src/domain/like-product';
import { Product } from './product.entity';

@ObjectType()
export class LikeProduct {
  @Field(() => String)
  productId: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Product)
  product: Product;

  static fromDomainToEntity(domainObject: DomainLikeProduct): LikeProduct {
    return {
      productId: domainObject.productId,
      createdAt: domainObject.createdAt,
      product: null,
    };
  }
}
