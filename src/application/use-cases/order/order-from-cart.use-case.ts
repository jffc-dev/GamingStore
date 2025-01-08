import { BadRequestException, Injectable } from '@nestjs/common';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Order } from 'src/domain/order';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { OrderDetail } from 'src/domain/order-detail';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StockUpdatedEvent } from 'src/infraestructure/events/input/stock-updated.event';
import { TransactionManager } from 'src/application/contracts/persistence/transaction-manager';

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

    private eventEmitter: EventEmitter2,
    private transactionManager: TransactionManager,
  ) {}

  async execute({ userId }: ICreateOrderFromCartUseCaseProps): Promise<Order> {
    return await this.transactionManager.run(async () => {
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

      // if (!validStock) {
      //   throw new BadRequestException('Insuficient stock');
      // }

      // create order
      const orderId = this.uuidService.generateUuid();
      const order = new Order({
        id: orderId,
        status: 'PENDING',
        userId: userId,
        total: total,
      });

      const orderResponse = await this.orderRepository.createOrder(order);

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

        product.stock = product.stock - cartDetail.quantity;
        const orderDetailResponse =
          await this.orderRepository.createOrderDetail(orderDetail);

        console.log(orderDetailResponse);

        const updatedProductResponse =
          await this.productRepository.updateProduct(
            product.productId,
            product,
          );

        console.log(updatedProductResponse);

        id++;
      }

      const orderCreatedEvent = new StockUpdatedEvent();
      orderCreatedEvent.productIds = productIds;
      this.eventEmitter.emit('stock.updated', orderCreatedEvent);

      return orderResponse;
    });
  }
}
