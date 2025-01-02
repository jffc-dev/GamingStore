import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { Order } from 'src/domain/order';
import { GetOrderByIdUseCase } from './get-order.use-case';

const mockOrderRepository = () => ({
  getOrder: jest.fn(),
});

describe('GetOrderByIdUseCase', () => {
  let getOrderByIdUseCase: GetOrderByIdUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdUseCase,
        { provide: OrderRepository, useFactory: mockOrderRepository },
      ],
    }).compile();

    getOrderByIdUseCase = module.get<GetOrderByIdUseCase>(GetOrderByIdUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('should be defined', () => {
    expect(getOrderByIdUseCase).toBeDefined();
    expect(orderRepository).toBeDefined();
  });

  it('should call getOrder with the correct orderId', async () => {
    const orderId = 'test-order-id';
    const orderMock = new Order({
      id: orderId,
      total: 100,
      status: 'PENDING',
      userId: 'userID',
    });

    orderRepository.getOrder.mockResolvedValue(orderMock);

    const result = await getOrderByIdUseCase.execute({ orderId });

    expect(orderRepository.getOrder).toHaveBeenCalledWith(orderId);
    expect(result).toEqual(orderMock);
  });

  it('should return null if no order is found', async () => {
    const orderId = 'non-existent-order-id';

    orderRepository.getOrder.mockResolvedValue(null);

    const result = await getOrderByIdUseCase.execute({ orderId });

    expect(orderRepository.getOrder).toHaveBeenCalledWith(orderId);
    expect(result).toBeNull();
  });

  it('should throw an error if orderRepository.getOrder throws', async () => {
    const orderId = 'test-order-id';
    const error = new Error('Repository error');

    orderRepository.getOrder.mockRejectedValue(error);

    await expect(getOrderByIdUseCase.execute({ orderId })).rejects.toThrow(
      'Repository error',
    );
    expect(orderRepository.getOrder).toHaveBeenCalledWith(orderId);
  });
});
