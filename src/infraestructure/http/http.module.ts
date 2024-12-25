import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { LoginUserUseCase } from 'src/application/use-cases/login-user';

@Module({
  controllers: [AuthController],
  providers: [RegisterUserUseCase, LoginUserUseCase],
  imports: [
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
  ],
})
export class HttpModule {}
