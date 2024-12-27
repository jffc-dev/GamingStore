import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  stock?: number;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @Field(() => Float, { nullable: true })
  price?: number;
}
