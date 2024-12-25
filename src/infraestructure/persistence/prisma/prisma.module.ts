import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [PrismaService, UserRepository],
})
export class PrismaModule {}
