import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

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
