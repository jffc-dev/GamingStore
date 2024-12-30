import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user';
import { Request } from 'express';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password';
import { RegisterUserDto } from '../../dto/user/register-user.dto';
import { LoginUserDto } from '../../dto/user/login-user.dto';
import { ForgotPasswordDto } from '../../dto/user/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/user/reset-password.dto';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';
import { LogoutUserUseCase } from 'src/application/use-cases/user/logout.user-case';
import { Throttle } from '@nestjs/throttler';

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
    private readonly logoutUserUseCase: LogoutUserUseCase,
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

  @HttpCode(204)
  @Auth()
  @Post('logout')
  async logoutUser(@Req() request: Request) {
    try {
      const authHeader = request.headers['authorization'];
      const token = authHeader.split(' ')[1];
      const response = await this.logoutUserUseCase.execute({ token });

      if (!response) {
        throw new BadRequestException();
      }
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

  @Auth()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Get('verify-login')
  async verifyLogin() {
    return true;
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
