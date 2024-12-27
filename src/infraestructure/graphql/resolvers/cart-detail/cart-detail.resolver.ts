import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CartDetail } from '../../entities/cart-detail.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { GetCartDetailsUseCase } from 'src/application/use-cases/cart/get-cart-details.use-case';
import { CartDetailProps } from 'src/domain/cart-detail';
import { User } from 'src/domain/user';
import { CreateCartDetailInput } from '../../dto/cart/input/create-cart-detail.input';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart/add-to-cart.use-cases';

@Resolver(() => CartDetail)
export class CartDetailResolver {
  constructor(
    private readonly getCartDetailsUseCase: GetCartDetailsUseCase,
    private readonly addProductToCartUseCase: AddProductToCartUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [CartDetail], { name: 'cartItems' })
  async getCartDetails(@Context() context: any): Promise<CartDetailProps[]> {
    const currentUser: User = context.req.user;
    const cartDetails = await this.getCartDetailsUseCase.execute({
      userId: currentUser.id,
    });
    return cartDetails.map(CartDetail.fromDomainToEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => CartDetail, { name: 'addItemToCart' })
  async addItemToCart(
    @Args('data') data: CreateCartDetailInput,
    @Context() context: any,
  ): Promise<CartDetail> {
    const currentUser: User = context.req.user;
    const { productId, quantity } = data;
    const cartDetail = await this.addProductToCartUseCase.execute({
      productId,
      userId: currentUser.id,
      quantity,
    });
    return CartDetail.fromDomainToEntity(cartDetail);
  }
}