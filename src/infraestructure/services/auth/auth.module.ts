import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { EnvService } from 'src/infraestructure/env/env.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GetUserByIdUseCase } from 'src/application/use-cases/user/get-user.use-case';

@Module({
  providers: [JwtStrategy, GetUserByIdUseCase],
  imports: [
    EnvModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        return {
          secret: envService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  exports: [JwtModule, JwtStrategy, PassportModule],
})
export class AuthModule {}
