import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class RegisterUserDto extends LoginUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
