import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { LikeProduct } from '../../entities/like-product.entity';
import { LikeProductInput } from '../../dto/like/input/like-product.input';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { User } from 'src/domain/user';
import { GetLikedProductsUseCase } from '../../../../application/use-cases/like/get-likes.use-case';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';

@Resolver(() => LikeProduct)
export class LikeResolver {
  constructor(
    private readonly likeProductUseCase: LikeProductUseCase,
    private readonly getLikedProductsUseCase: GetLikedProductsUseCase,
  ) {}

  @Auth(ValidRoles.client)
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

  @Auth(ValidRoles.client)
  @Query(() => [LikeProduct], { name: 'likedProducts' })
  async getLikedProducts(@Context() context: any): Promise<LikeProduct[]> {
    const currentUser: User = context.req.user;
    const likedProducts = await this.getLikedProductsUseCase.execute({
      userId: currentUser.id,
    });
    return likedProducts.map(LikeProduct.fromDomainToEntity);
  }
}
