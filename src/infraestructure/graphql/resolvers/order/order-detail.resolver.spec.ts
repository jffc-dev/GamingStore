import { Test, TestingModule } from '@nestjs/testing';
import { OrderDetailResolver } from './order-detail.resolver';
import { ProductLoader } from 'src/infraestructure/common/dataloaders/product.loader';
import { OrderDetail } from 'src/domain/order-detail';
import { Product } from 'src/domain/product';

describe('OrderDetailResolver', () => {
  let resolver: OrderDetailResolver;
  let productLoader: ProductLoader;

  const mockDomainProduct = new Product({
    productId: 'prod-123',
    name: 'Product 1',
    description: 'A sample product',
    stock: 10,
    price: 100,
    categoryId: 'cat-123',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  });

  const mockEntityProduct = {
    id: 'product-1',
    name: 'Test Product',
    price: 100,
    description: 'Test Description',
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
