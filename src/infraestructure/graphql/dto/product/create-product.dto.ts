import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  stock?: number = 0;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}
