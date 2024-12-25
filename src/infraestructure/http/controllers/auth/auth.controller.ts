import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/login-user';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { LoginUserDto } from '../../dto/login-user.dto';
import { Response } from 'express';
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
  constructor(
    private registerUserUseCase: RegisterUserUseCase,
    private loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    try {
      const { token } = await this.registerUserUseCase.execute(registerUserDto);

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });

      return res.status(HttpStatus.OK).json({ message: 'Login successful' });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    try {
      const { token } = await this.loginUserUseCase.execute(loginUserDto);
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });

      return res.status(HttpStatus.OK).json({ message: 'Login successful' });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
