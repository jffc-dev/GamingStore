import { InputType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class LikeProductInput {
  @IsUUID()
  @Field(() => String)
  productId: string;
}
