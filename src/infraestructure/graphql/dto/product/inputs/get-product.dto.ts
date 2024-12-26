import { IsUUID } from 'class-validator';

export class GetProductDto {
  @IsUUID()
  productId: string;
}
