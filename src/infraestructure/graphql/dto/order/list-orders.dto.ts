import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, IsUUID } from 'class-validator';

@ArgsType()
export class ListOrdersFilterDto {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
