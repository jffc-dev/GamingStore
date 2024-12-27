import { Injectable } from '@nestjs/common';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { CartDetail } from 'src/domain/cart-detail';

interface IGetCartDetailsUseCaseProps {
  userId: string;
}
@Injectable()
export class GetCartDetailsUseCase {
  constructor(private readonly cartDetailRepository: CartDetailRepository) {}

  async execute({
    userId,
  }: IGetCartDetailsUseCaseProps): Promise<CartDetail[]> {
    const cartDetailsResponse =
      await this.cartDetailRepository.getCartDetailsByUser(userId);

    return cartDetailsResponse;
  }
}
