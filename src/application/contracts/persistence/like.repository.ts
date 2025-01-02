import { LikeProduct } from 'src/domain/like-product';
import { User } from 'src/domain/user';

export abstract class LikeProductRepository {
  abstract likeProduct(likeProduct: LikeProduct): Promise<LikeProduct>;
  abstract getLikedProducts(userId: string): Promise<LikeProduct[]>;
  abstract findLastUserWhoLikedButNotPurchased(
    productId: string,
  ): Promise<User | null>;

  abstract handleDBError(error: any): void;
}
