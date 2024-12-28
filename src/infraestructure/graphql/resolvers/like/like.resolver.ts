import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LikeProduct } from '../../entities/like-product.entity';
import { LikeProductInput } from '../../dto/like/input/like-product.input';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { User } from 'src/domain/user';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { GetLikedProductsUseCase } from '../../../../application/use-cases/like/get-likes.use-case';

@Resolver(() => LikeProduct)
export class LikeResolver {
  constructor(
    private readonly likeProductUseCase: LikeProductUseCase,
    private readonly getLikedProductsUseCase: GetLikedProductsUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => LikeProduct, { name: 'likeProduct' })
  async likeProduct(
    @Args('data') data: LikeProductInput,
    @Context() context: any,
  ): Promise<LikeProduct> {
    const currentUser: User = context.req.user;
    const { productId } = data;

    const productLike = await this.likeProductUseCase.execute({
      productId,
      userId: currentUser.id,
    });
    return LikeProduct.fromDomainToEntity(productLike);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [LikeProduct], { name: 'likedProducts' })
  async getLikedProducts(@Context() context: any): Promise<LikeProduct[]> {
    const currentUser: User = context.req.user;
    const likedProducts = await this.getLikedProductsUseCase.execute({
      userId: currentUser.id,
    });
    return likedProducts.map(LikeProduct.fromDomainToEntity);
  }
}
