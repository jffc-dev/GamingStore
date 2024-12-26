import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/login-user';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { EnvService } from 'src/infraestructure/env/env.service';
import { ForgotPasswordUseCase } from 'src/application/use-cases/forgot-password';
import { NotificationsModule } from 'src/infraestructure/notifications/notifications.module';

@Module({
  providers: [RegisterUserUseCase, LoginUserUseCase, ForgotPasswordUseCase],
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
  ],
})
export class AuthModule {}
