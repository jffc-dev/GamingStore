import { ArgsType, Field } from '@nestjs/graphql';
import { IsString, IsUUID } from 'class-validator';

@ArgsType()
export class GetProductDto {
  @IsString()
  @IsUUID()
  @Field(() => String)
  id: string;
}
