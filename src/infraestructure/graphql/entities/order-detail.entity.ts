import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Product } from './product.entity';

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

  @Field(() => Product)
  product: Product;
}
