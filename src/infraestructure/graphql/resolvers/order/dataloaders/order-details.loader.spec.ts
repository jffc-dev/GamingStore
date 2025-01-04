import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailsLoader } from './order-details.loader';
import { GetOrderDetailsUseCase } from 'src/application/use-cases/order/get-order-details.use-case';
import { OrderDetail as OrderDetailEntity } from 'src/infraestructure/graphql/entities/order-detail.entity';

describe('OrderDetailsLoader', () => {
  let loader: OrderDetailsLoader;
  let getOrderDetailsUseCase: GetOrderDetailsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailsLoader,
        {
          provide: GetOrderDetailsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    loader = module.get<OrderDetailsLoader>(OrderDetailsLoader);
    getOrderDetailsUseCase = module.get<GetOrderDetailsUseCase>(
      GetOrderDetailsUseCase,
    );
  });

  describe('batchLoadFunction', () => {
    it('should handle empty input orderIds', async () => {
      const mockOrderIds: string[] = [];
      jest.spyOn(getOrderDetailsUseCase, 'execute').mockResolvedValue([]);

      const result = await loader.batchLoadFunction(mockOrderIds);

      expect(getOrderDetailsUseCase.execute).toHaveBeenCalledWith({
        orderIds: mockOrderIds,
      });
      expect(result).toEqual([]);
    });
  });

  describe('mapResults', () => {
    it('should map results correctly to orderIds', () => {
      const mockOrderIds = ['order1', 'order2'];
      const mockDetails: OrderDetailEntity[] = [
        {
          id: 1,
          orderId: 'order1',
          productId: 'product1',
          quantity: 2,
          subtotal: 50,
          unitPrice: 25,
        },
        {
          id: 2,
          orderId: 'order2',
          productId: 'product2',
          quantity: 1,
          subtotal: 30,
          unitPrice: 30,
        },
      ];

      const result = loader.mapResults(mockOrderIds, mockDetails);

      expect(result).toEqual([[mockDetails[0]], [mockDetails[1]]]);
    });

    it('should handle cases with no matching details for some orderIds', () => {
      const mockOrderIds = ['order1', 'order2', 'order3'];
      const mockDetails: OrderDetailEntity[] = [
        {
          id: 1,
          orderId: 'order1',
          productId: 'product1',
          quantity: 2,
          subtotal: 50,
          unitPrice: 25,
        },
      ];

      const result = loader.mapResults(mockOrderIds, mockDetails);

      expect(result).toEqual([[mockDetails[0]], [], []]);
    });
  });
});
