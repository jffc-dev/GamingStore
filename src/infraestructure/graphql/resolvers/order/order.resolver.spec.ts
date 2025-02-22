import { Test, TestingModule } from '@nestjs/testing';
import { OrderResolver } from './order.resolver';
import { CreateOrderFromCartUseCase } from 'src/application/use-cases/order/order-from-cart.use-case';
import { GetUserOrdersUseCase } from 'src/application/use-cases/order/get-orders.use-case';
import { OrderDetailsLoader } from '../../../common/dataloaders/order-details.loader';
import { Order as OrderEntity } from '../../entities/order.entity';
import { OrderDetail } from '../../entities/order-detail.entity';
import { Order } from 'src/domain/order';

describe('OrderResolver', () => {
  let resolver: OrderResolver;
  let createOrderFromCartUseCase: CreateOrderFromCartUseCase;
  let getUserOrdersUseCase: GetUserOrdersUseCase;
  let orderDetailsLoader: OrderDetailsLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderResolver,
        {
          provide: CreateOrderFromCartUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetUserOrdersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: OrderDetailsLoader,
          useValue: { load: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<OrderResolver>(OrderResolver);
    createOrderFromCartUseCase = module.get<CreateOrderFromCartUseCase>(
      CreateOrderFromCartUseCase,
    );
    getUserOrdersUseCase =
      module.get<GetUserOrdersUseCase>(GetUserOrdersUseCase);
    orderDetailsLoader = module.get<OrderDetailsLoader>(OrderDetailsLoader);
  });

  describe('createOrder', () => {
    it('should call CreateOrderFromCartUseCase and return an Order', async () => {
      const mockOrder = new Order({
        id: 'order123',
        status: 'PAID',
        userId: 'user123',
        total: 100,
      });

      jest
        .spyOn(createOrderFromCartUseCase, 'execute')
        .mockResolvedValue(mockOrder);

      const context = { req: { user: { id: 'user123' } } };
      const result = await resolver.createOrder(context);

      expect(createOrderFromCartUseCase.execute).toHaveBeenCalledWith({
        userId: 'user123',
      });
      expect(result).toEqual(OrderEntity.fromDomainToEntity(mockOrder));
    });
  });

  describe('getUserOrders', () => {
    it('should call GetUserOrdersUseCase and return a list of Orders', async () => {
      const mockOrders = [
        new Order({
          id: 'order1',
          status: 'PENDING',
          userId: 'user123',
          createdAt: new Date(),
          total: 100,
        }),
        new Order({
          id: 'order2',
          status: 'PENDING',
          userId: 'user123',
          createdAt: new Date(),
          total: 100,
        }),
      ];
      jest.spyOn(getUserOrdersUseCase, 'execute').mockResolvedValue(mockOrders);

      const context = { req: { user: { id: 'user123' } } };
      const result = await resolver.getUserOrders(context);

      expect(getUserOrdersUseCase.execute).toHaveBeenCalledWith({
        filters: { userId: 'user123' },
      });
      expect(result).toEqual(mockOrders.map(OrderEntity.fromDomainToEntity));
    });
  });

  describe('getOrders', () => {
    it('should call GetUserOrdersUseCase and return a list of Orders for a manager', async () => {
      const mockOrders = [
        new Order({
          id: 'order1',
          status: 'PENDING',
          userId: 'user123',
          createdAt: new Date(),
          total: 100,
        }),
        new Order({
          id: 'order2',
          status: 'PENDING',
          userId: 'user123',
          createdAt: new Date(),
          total: 100,
        }),
      ];
      const filters = { userId: 'user123' };

      jest.spyOn(getUserOrdersUseCase, 'execute').mockResolvedValue(mockOrders);

      const result = await resolver.getOrders(filters);

      expect(getUserOrdersUseCase.execute).toHaveBeenCalledWith({
        filters,
      });
      expect(result).toEqual(mockOrders.map(OrderEntity.fromDomainToEntity));
    });
  });

  describe('orderDetails', () => {
    it('should call OrderDetailsLoader and return a list of OrderDetails', async () => {
      const mockDetails = [new OrderDetail(), new OrderDetail()];
      const order: OrderEntity = {
        id: 'order123',
        status: 'PENDING',
        userId: 'user123',
        createdAt: new Date(),
        orderDetails: [],
      };

      jest.spyOn(orderDetailsLoader, 'load').mockResolvedValue(mockDetails);

      const result = await resolver.orderDetails(order);

      expect(orderDetailsLoader.load).toHaveBeenCalledWith(order.id);
      expect(result).toEqual(mockDetails);
    });
  });
});
