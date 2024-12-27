import { Module } from '@nestjs/common';
import { LikeResolver } from './like.resolver';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';

@Module({
  providers: [LikeProductUseCase, LikeResolver],
})
export class LikeModule {}
