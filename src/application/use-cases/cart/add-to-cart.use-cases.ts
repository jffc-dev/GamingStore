import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { CartDetail } from 'src/domain/cart-detail';

interface IAddProductToCartUseCaseProps {
  productId: string;
  userId: string;
  quantity: number;
}
@Injectable()
export class AddProductToCartUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly cartDetailRepository: CartDetailRepository,
  ) {}

  async execute({
    productId,
    quantity,
    userId,
  }: IAddProductToCartUseCaseProps): Promise<any> {
    const productResponse =
      await this.productRepository.getProductById(productId);

    if (!productResponse) {
      throw new NotFoundException('Product not found');
    }

    if (productResponse.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cartDetail = new CartDetail({
      productId,
      userId,
      quantity,
    });

    const cartDetailResponse = this.cartDetailRepository.addToCart(cartDetail);
    return cartDetailResponse;
  }
}
