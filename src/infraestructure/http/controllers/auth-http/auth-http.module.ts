import { Module } from '@nestjs/common';
import { AuthController } from './auth-http.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password';
import { NotificationsModule } from 'src/infraestructure/notifications/notifications.module';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password';
import { BcryptModule } from 'src/infraestructure/services/bcrypt/bcrypt.module';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { AuthModule } from 'src/infraestructure/services/auth/auth.module';
import { LogoutUserUseCase } from 'src/application/use-cases/user/logout.user-case';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    LogoutUserUseCase,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AuthController],
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 3,
      },
    ]),
    EnvModule,
    NotificationsModule,
    BcryptModule,
    UuidModule,
    AuthModule,
  ],
})
export class AuthHttpModule {}
