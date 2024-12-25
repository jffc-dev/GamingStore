import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';
import { LoginUserUseCase } from 'src/application/use-cases/login-user';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { EnvService } from 'src/infraestructure/env/env.service';

@Module({
  providers: [RegisterUserUseCase, LoginUserUseCase],
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        console.log(envService.get('JWT_SECRET'));
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
export class AuthModule {}
