import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCartDetailInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  productId: string;

  @Field(() => Int)
  quantity?: number;
}
