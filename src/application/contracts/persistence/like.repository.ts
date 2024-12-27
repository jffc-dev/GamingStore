import { LikeProduct } from 'src/domain/like-product';

export abstract class LikeProductRepository {
  abstract likeProduct(likeProduct: LikeProduct): Promise<LikeProduct>;

  abstract handleDBError(error: any): void;
}
