import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { PrismaProductRepository } from './repositories/prisma-product.repository';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { PrismaCartDetailRepository } from './repositories/prisma-cart.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    {
      provide: CartDetailRepository,
      useClass: PrismaCartDetailRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    ProductRepository,
    CartDetailRepository,
  ],
})
export class PrismaModule {}
