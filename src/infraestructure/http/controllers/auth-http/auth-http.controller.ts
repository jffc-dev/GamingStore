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
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user.use-case';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user.use-case';
import { Request } from 'express';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password.use-case';
import { RegisterUserDto } from '../../dto/user/register-user.dto';
import { LoginUserDto } from '../../dto/user/login-user.dto';
import { ForgotPasswordDto } from '../../dto/user/forgot-password.dto';
import { ResetPasswordDto } from '../../dto/user/reset-password.dto';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator.decorator';
import { LogoutUserUseCase } from 'src/application/use-cases/user/logout.use-case';
import { SkipThrottle } from '@nestjs/throttler';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';

@SkipThrottle()
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

    private readonly notificationsService: NotificationsService,
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

  // @HttpCode(204)
  @SkipThrottle({ default: false })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const data = await this.forgotPasswordUseCase.execute(forgotPasswordDto);
      return { token: data.resetPasswordToken };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @SkipThrottle({ default: false })
  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      const data = await this.resetPasswordUseCase.execute(resetPasswordDto);
      return data;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('valid')
  async valid() {
    await this.notificationsService.sendEmail({
      subject: 'Forgot',
      body: 'data',
      to: 'javierflores@ravn.co',
    });
    return 1;
  }
}
