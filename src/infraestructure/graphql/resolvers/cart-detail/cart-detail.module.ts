import { Module } from '@nestjs/common';
import { CartDetailResolver } from './cart-detail.resolver';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart/add-to-cart.use-cases';
import { GetCartDetailsUseCase } from 'src/application/use-cases/cart/get-cart-details.use-case';

@Module({
  providers: [
    AddProductToCartUseCase,
    GetCartDetailsUseCase,

    CartDetailResolver,
  ],
  imports: [],
})
export class CartDetailModule {}
