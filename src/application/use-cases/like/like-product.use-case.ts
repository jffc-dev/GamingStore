import { Injectable } from '@nestjs/common';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';

interface ILikeProductUseCaseProps {
  productId: string;
  userId: string;
}
@Injectable()
export class LikeProductUseCase {
  constructor(private readonly likeProductRepository: LikeProductRepository) {}

  async execute({ productId, userId }: ILikeProductUseCaseProps): Promise<any> {
    const likeProduct = new LikeProduct({
      productId,
      userId,
    });

    const likeProductResponse =
      await this.likeProductRepository.likeProduct(likeProduct);

    return likeProductResponse;
  }
}
