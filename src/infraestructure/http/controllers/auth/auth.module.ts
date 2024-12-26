import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { EnvService } from 'src/infraestructure/env/env.service';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password';
import { NotificationsModule } from 'src/infraestructure/notifications/notifications.module';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password';
import { BcryptModule } from 'src/infraestructure/services/bcrypt/bcrypt.module';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';

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
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        return {
          secret: envService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h',
          },
        };
      },
    }),
    NotificationsModule,
    BcryptModule,
    UuidModule,
  ],
})
export class AuthModule {}
