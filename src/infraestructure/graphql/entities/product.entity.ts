import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Product as DomainProduct } from 'src/domain/product';
import { ProductImage } from './product-image.entity';

@ObjectType()
export class Product {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean = true;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [ProductImage], { nullable: true })
  images?: ProductImage[];

  static fromDomainToEntity(domainObject: DomainProduct): Product {
    return {
      id: domainObject.productId,
      name: domainObject.name,
      price: domainObject.price,
      description: domainObject.description,
      isActive: domainObject.isActive,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
    };
  }
}
