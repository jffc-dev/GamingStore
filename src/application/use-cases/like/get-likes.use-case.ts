import { Injectable } from '@nestjs/common';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';

interface IGetLikedProductsUseCaseProps {
  userId: string;
}
@Injectable()
export class GetLikedProductsUseCase {
  constructor(private readonly likeProductRepository: LikeProductRepository) {}

  async execute({
    userId,
  }: IGetLikedProductsUseCaseProps): Promise<LikeProduct[]> {
    const likedProducts =
      await this.likeProductRepository.getLikedProducts(userId);

    return likedProducts;
  }
}
