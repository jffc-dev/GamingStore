import { BadRequestException, Injectable } from '@nestjs/common';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Order } from 'src/domain/order';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { OrderDetail } from 'src/domain/order-detail';

interface ICreateOrderFromCartUseCaseProps {
  userId: string;
}
@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(
    private readonly cartDetailRepository: CartDetailRepository,
    private readonly productRepository: ProductRepository,
    private readonly uuidService: UuidService,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute({ userId }: ICreateOrderFromCartUseCaseProps): Promise<Order> {
    const cartDetailsResponse =
      await this.cartDetailRepository.getCartDetailsByUser(userId);

    if (!cartDetailsResponse.length) {
      throw new BadRequestException('Empty cart');
    }

    const productIds = cartDetailsResponse.map(
      (cartDetail) => cartDetail.productId,
    );

    const productsResponse =
      await this.productRepository.getProductsByIds(productIds);

    // stock validation
    let validStock = true;
    let total = 0;
    for (const cartDetail of cartDetailsResponse) {
      const product = productsResponse.find(
        (product) => product.productId === cartDetail.productId,
      );

      if (product.stock < cartDetail.quantity) {
        validStock = false;
      }

      total += cartDetail.quantity * product.price;
    }

    if (!validStock) {
      throw new BadRequestException('Insuficient stock');
    }

    // create order
    const orderId = this.uuidService.generateUuid();
    const order = new Order({
      id: orderId,
      status: 'PENDING',
      userId: userId,
      total: total,
    });

    // TODO: delete
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 10000);
    });

    let id = 1;
    for (const cartDetail of cartDetailsResponse) {
      const product = productsResponse.find(
        (product) => product.productId === cartDetail.productId,
      );

      const orderDetail = new OrderDetail({
        id: id,
        orderId: orderId,
        productId: cartDetail.productId,
        quantity: cartDetail.quantity,
        unitPrice: product.price,
        subtotal: product.price * cartDetail.quantity,
      });

      order.orderDetails.push(orderDetail);
      product.stock = product.stock - cartDetail.quantity;

      id++;
    }

    const orderResponse = await this.orderRepository.createFullOrder(
      order,
      userId,
    );

    return orderResponse;
  }
}
