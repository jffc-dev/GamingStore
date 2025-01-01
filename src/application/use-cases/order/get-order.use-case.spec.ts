import { Test, TestingModule } from '@nestjs/testing';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { Order } from '../../../domain/order';
import { GetOrderByIdUseCase } from './get-order.use-case';

describe('GetOrderByIdUseCase', () => {
  let getOrderByIdUseCase: GetOrderByIdUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  beforeEach(async () => {
    const mockOrderRepository: Partial<jest.Mocked<OrderRepository>> = {
      getOrder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderByIdUseCase,
        { provide: OrderRepository, useValue: mockOrderRepository },
      ],
    }).compile();

    getOrderByIdUseCase = module.get<GetOrderByIdUseCase>(GetOrderByIdUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('should be defined', () => {
    expect(getOrderByIdUseCase).toBeDefined();
  });

  describe('execute', () => {
    it('should call orderRepository.getOrder with the correct orderId', async () => {
      const mockOrderId = 'order-id-123';
      const mockOrder = new Order({
        id: mockOrderId,
        status: 'PENDING',
        total: 10,
        userId: '',
      });
      orderRepository.getOrder.mockResolvedValue(mockOrder);

      const result = await getOrderByIdUseCase.execute({
        orderId: mockOrderId,
      });

      expect(orderRepository.getOrder).toHaveBeenCalledWith(mockOrderId);
      expect(result).toBe(mockOrder);
    });

    it('should throw an error if orderRepository.getOrder throws an error', async () => {
      const mockOrderId = 'order-id-123';
      const mockError = new Error('Order not found');
      orderRepository.getOrder.mockRejectedValue(mockError);

      await expect(
        getOrderByIdUseCase.execute({ orderId: mockOrderId }),
      ).rejects.toThrow(mockError);

      expect(orderRepository.getOrder).toHaveBeenCalledWith(mockOrderId);
    });
  });
});
