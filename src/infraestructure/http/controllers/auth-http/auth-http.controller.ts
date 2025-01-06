import {
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
  ) {}

  @Post('register')
  async registerUser(@Body() registerUserDto: RegisterUserDto) {
    const { token } = await this.registerUserUseCase.execute(registerUserDto);
    return { token };
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const { token } = await this.loginUserUseCase.execute(loginUserDto);
    return { token };
  }

  @HttpCode(204)
  @Auth()
  @Post('logout')
  async logoutUser(@Req() request: Request) {
    const authHeader = request.headers['authorization'];
    const token = authHeader.split(' ')[1];
    await this.logoutUserUseCase.execute({ token });
  }

  @SkipThrottle({ default: false })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const data = await this.forgotPasswordUseCase.execute(forgotPasswordDto);
    return { token: data.resetPasswordToken };
  }

  @HttpCode(204)
  @SkipThrottle({ default: false })
  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const data = await this.resetPasswordUseCase.execute(resetPasswordDto);
    return data;
  }

  @Auth()
  @HttpCode(204)
  @Get('validate-login')
  async validate() {}
}
