import { CartDetail } from 'src/domain/cart-detail';

export abstract class CartDetailRepository {
  abstract addToCart(data: CartDetail): Promise<CartDetail>;
  abstract getCartDetailsByUser(userId: string): Promise<CartDetail[]>;

  abstract handleDBError(error: any): void;
}
