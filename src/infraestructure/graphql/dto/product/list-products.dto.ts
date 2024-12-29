import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Product } from '../../entities/product.entity';

@ArgsType()
export class ListProductsArgs {
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Int)
  @IsNumber()
  first: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  after?: string;
}

@ObjectType()
export class ProductEdge {
  @Field(() => String)
  cursor: string;

  @Field(() => Product)
  node: Product;
}

@ObjectType()
export class PageInfo {
  @Field(() => Boolean)
  hasNextPage: boolean;

  @Field(() => Boolean)
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor?: string;

  @Field(() => String, { nullable: true })
  endCursor?: string;
}

@ObjectType()
export class PaginatedProducts {
  @Field(() => [ProductEdge])
  edges: ProductEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
