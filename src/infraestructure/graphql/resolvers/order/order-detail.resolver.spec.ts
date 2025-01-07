import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailResolver } from './order-detail.resolver';
import { ProductLoader } from 'src/infraestructure/common/dataloaders/product.loader';
import { OrderDetail } from 'src/domain/order-detail';

describe('OrderDetailResolver', () => {
  let resolver: OrderDetailResolver;
  let productLoader: ProductLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderDetailResolver,
        {
          provide: ProductLoader,
          useValue: {
            load: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<OrderDetailResolver>(OrderDetailResolver);
    productLoader = module.get<ProductLoader>(ProductLoader);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('product', () => {
    it('should handle product loader errors', async () => {
      const mockOrderDetail = new OrderDetail({
        productId: 'product-1',
        quantity: 2,
        orderId: 'order-1',
        unitPrice: 100,
      });

      jest
        .spyOn(productLoader, 'load')
        .mockRejectedValue(new Error('Product not found'));

      await expect(resolver.product(mockOrderDetail)).rejects.toThrow(
        'Product not found',
      );
      expect(productLoader.load).toHaveBeenCalledWith('product-1');
    });
  });
});
