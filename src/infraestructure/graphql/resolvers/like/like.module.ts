import { Module } from '@nestjs/common';
import { LikeResolver } from './like.resolver';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { GetLikedProductsUseCase } from 'src/application/use-cases/like/get-likes.use-case';
import { ProductLoader } from '../../../common/dataloaders/product.loader';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';

@Module({
  providers: [
    LikeProductUseCase,
    GetLikedProductsUseCase,
    GetProductsByIdsUseCase,

    LikeResolver,
    ProductLoader,
  ],
})
export class LikeModule {}
