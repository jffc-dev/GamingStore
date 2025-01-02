import { Test, TestingModule } from '@nestjs/testing';
import { GetOrderDetailsUseCase } from './get-order-details.use-case';
import { OrderRepository } from '../../contracts/persistence/order.repository';
import { OrderDetail } from 'src/domain/order-detail';

describe('GetOrderDetailsUseCase', () => {
  let useCase: GetOrderDetailsUseCase;
  let orderRepository: jest.Mocked<OrderRepository>;

  const detail1 = new OrderDetail({
    orderId: '1',
    productId: 'p1',
    quantity: 2,
    unitPrice: 10,
  });
  const detail2 = new OrderDetail({
    orderId: '2',
    productId: 'p2',
    quantity: 1,
    unitPrice: 20,
  });
  const mockOrderDetails: OrderDetail[] = [detail1, detail2];

  beforeEach(async () => {
    const mockOrderRepository = {
      getDetailsByOrderIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrderDetailsUseCase,
        {
          provide: OrderRepository,
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetOrderDetailsUseCase>(GetOrderDetailsUseCase);
    orderRepository = module.get(OrderRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(orderRepository).toBeDefined();
  });

  it('should call getDetailsByOrderIds with the correct parameters', async () => {
    const orderIds = ['1', '2'];
    orderRepository.getDetailsByOrderIds.mockResolvedValue(mockOrderDetails);

    const result = await useCase.execute({ orderIds });

    expect(orderRepository.getDetailsByOrderIds).toHaveBeenCalledWith(orderIds);
    expect(result).toEqual(mockOrderDetails);
  });

  it('should return an empty array if no details are found', async () => {
    const orderIds = ['3'];
    orderRepository.getDetailsByOrderIds.mockResolvedValue([]);

    const result = await useCase.execute({ orderIds });

    expect(orderRepository.getDetailsByOrderIds).toHaveBeenCalledWith(orderIds);
    expect(result).toEqual([]);
  });

  it('should handle errors from the repository', async () => {
    const orderIds = ['1', '2'];
    const error = new Error('Repository error');
    orderRepository.getDetailsByOrderIds.mockRejectedValue(error);

    await expect(useCase.execute({ orderIds })).rejects.toThrow(
      'Repository error',
    );
    expect(orderRepository.getDetailsByOrderIds).toHaveBeenCalledWith(orderIds);
  });
});
