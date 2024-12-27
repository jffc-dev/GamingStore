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

@Module({
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
  controllers: [AuthController],
  imports: [
    EnvModule,
    NotificationsModule,
    BcryptModule,
    UuidModule,
    AuthModule,
  ],
})
export class AuthHttpModule {}
