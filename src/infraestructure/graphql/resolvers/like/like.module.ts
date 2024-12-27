import { Module } from '@nestjs/common';
import { LikeResolver } from './like.resolver';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { GetLikedProductsUseCase } from 'src/application/use-cases/like/get-likes.use-case';

@Module({
  providers: [LikeProductUseCase, GetLikedProductsUseCase, LikeResolver],
})
export class LikeModule {}
