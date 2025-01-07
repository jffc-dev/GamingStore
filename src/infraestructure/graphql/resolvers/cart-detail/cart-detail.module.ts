import { Module } from '@nestjs/common';
import { CartDetailResolver } from './cart-detail.resolver';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart/add-to-cart.use-cases';
import { GetCartDetailsUseCase } from 'src/application/use-cases/cart/get-cart-details.use-case';
import { ProductLoader } from '../../../common/dataloaders/product.loader';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';

@Module({
  providers: [
    AddProductToCartUseCase,
    GetCartDetailsUseCase,
    GetProductsByIdsUseCase,

    CartDetailResolver,
    ProductLoader,
  ],
  imports: [],
})
export class CartDetailModule {}
