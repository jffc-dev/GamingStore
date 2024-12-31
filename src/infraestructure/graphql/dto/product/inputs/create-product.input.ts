import { InputType, Field, Float } from '@nestjs/graphql';
import { Min } from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  categoryId?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Min(1, { message: 'Stock must be greater than 0' })
  @Field(() => Float, { nullable: true })
  stock?: number;

  @Field(() => Boolean)
  isActive?: boolean;

  @Min(1, { message: 'Price must be greater than 0' })
  @Field(() => Float)
  price: number;
}
