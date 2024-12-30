import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Patch,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user';
import { Response } from 'express';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password';
import { RegisterUserDto } from '../../dto/user/register-user.dto';
import { LoginUserDto } from '../../dto/user/login-user.dto';
import { ForgotPasswordDto } from '../../dto/user/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/user/reset-password.dto';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';

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
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    try {
      const { token } = await this.registerUserUseCase.execute(registerUserDto);

      return { token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    try {
      const { token } = await this.loginUserUseCase.execute(loginUserDto);
      return { token };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Auth()
  @Post('logout')
  async logoutUser(@Res() res: Response) {
    try {
      res.clearCookie('auth_token');

      return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const data = await this.forgotPasswordUseCase.execute(forgotPasswordDto);
      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const data = await this.resetPasswordUseCase.execute(resetPasswordDto);
      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
