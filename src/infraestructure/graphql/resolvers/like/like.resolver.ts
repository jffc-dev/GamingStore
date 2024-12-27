import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { LikeProduct } from '../../entities/like-product.entity';
import { LikeProductInput } from '../../dto/like/input/like-product.input';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { User } from 'src/domain/user';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => LikeProduct)
export class LikeResolver {
  constructor(private readonly likeProductUseCase: LikeProductUseCase) {}

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
}
