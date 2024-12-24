import { Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './utils/envSchema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validate: (env) => envSchema.parse(env),
      isGlobal: false,
    }),
  ],
  providers: [EnvService],
})
export class EnvModule {}
