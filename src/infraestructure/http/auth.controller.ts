import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
)
@Controller('api/auth')
export class AuthController {
  constructor(private registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const response = await this.registerUserUseCase.execute(registerUserDto);
      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}