import { InputType, Field, Float } from '@nestjs/graphql';
import { Min, IsOptional, IsBoolean, IsUUID } from 'class-validator';

@InputType()
export class UpdateProductInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  name?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  description?: string;

  @IsOptional()
  @Min(1, { message: 'Stock must be greater than 0' })
  @Field(() => Float, { nullable: true })
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IsOptional()
  @Min(1, { message: 'Price must be greater than 0' })
  @Field(() => Float, { nullable: true })
  price?: number;

  @IsUUID()
  @IsOptional()
  @Field(() => String, { nullable: true })
  categoryId?: string;
}
