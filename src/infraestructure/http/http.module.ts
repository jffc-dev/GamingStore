import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from 'src/application/use-cases/register-user';

@Module({
  controllers: [AuthController],
  providers: [RegisterUserUseCase],
})
export class HttpModule {}
