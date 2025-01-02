import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { Order } from 'src/domain/order';
import { GetUserOrdersUseCase } from './get-orders.use-case';

const mockOrderRepository = () => ({
  getOrders: jest.fn(),
});

describe('GetUserOrdersUseCase', () => {
  let getUserOrdersUseCase: GetUserOrdersUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserOrdersUseCase,
        { provide: OrderRepository, useFactory: mockOrderRepository },
      ],
    }).compile();

    getUserOrdersUseCase =
      module.get<GetUserOrdersUseCase>(GetUserOrdersUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('should be defined', () => {
    expect(getUserOrdersUseCase).toBeDefined();
    expect(orderRepository).toBeDefined();
  });

  it('should call getOrders with the correct userId', async () => {
    const userId = 'test-user-id';
    const ordersMock: Order[] = [
      new Order({
        id: 'order1',
        total: 50,
        status: 'PENDING',
        userId: 'userID',
      }),
      new Order({
        id: 'order2',
        total: 75,
        status: 'PENDING',
        userId: 'userID',
      }),
    ];

    orderRepository.getOrders.mockResolvedValue(ordersMock);

    const result = await getUserOrdersUseCase.execute({ filters: { userId } });

    expect(orderRepository.getOrders).toHaveBeenCalledWith(userId);
    expect(result).toEqual(ordersMock);
  });

  it('should return an empty array if no orders are found', async () => {
    const userId = 'test-user-id';

    orderRepository.getOrders.mockResolvedValue([]);

    const result = await getUserOrdersUseCase.execute({ filters: { userId } });

    expect(orderRepository.getOrders).toHaveBeenCalledWith(userId);
    expect(result).toEqual([]);
  });

  it('should throw an error if orderRepository.getOrders throws', async () => {
    const userId = 'test-user-id';
    const error = new Error('Repository error');

    orderRepository.getOrders.mockRejectedValue(error);

    await expect(
      getUserOrdersUseCase.execute({ filters: { userId } }),
    ).rejects.toThrow('Repository error');
    expect(orderRepository.getOrders).toHaveBeenCalledWith(userId);
  });

  //   it('should call getOrders with undefined if filters are not provided', async () => {
  //     const ordersMock: Order[] = [
  //       new Order({
  //         id: 'order1',
  //         total: 50,
  //         status: 'PENDING',
  //         userId: 'userID',
  //       }),
  //       new Order({
  //         id: 'order2',
  //         total: 75,
  //         status: 'PENDING',
  //         userId: 'userID',
  //       }),
  //     ];

  //     orderRepository.getOrders.mockResolvedValue(ordersMock);

  //     const result = await getUserOrdersUseCase.execute({});

  //     expect(orderRepository.getOrders).toHaveBeenCalledWith(undefined);
  //     expect(result).toEqual(ordersMock);
  //   });
});
