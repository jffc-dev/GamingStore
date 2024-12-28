import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsUUID, Min } from 'class-validator';

@InputType()
export class CreateCartDetailInput {
  @IsUUID()
  @Field(() => String)
  productId: string;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  quantity: number;
}
