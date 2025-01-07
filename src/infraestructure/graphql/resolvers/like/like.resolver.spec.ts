import { Test, TestingModule } from '@nestjs/testing';
import { LikeResolver } from './like.resolver';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { GetLikedProductsUseCase } from 'src/application/use-cases/like/get-likes.use-case';
import { ProductLoader } from '../../../common/dataloaders/product.loader';
import { LikeProductInput } from '../../dto/like/input/like-product.input';
import { User } from 'src/domain/user';
import { LikeProduct } from 'src/domain/like-product';
import { LikeProduct as LikeProductEntity } from '../../entities/like-product.entity';
import { Product as ProductEntity } from '../../entities/product.entity';
import { Product } from 'src/domain/product';

describe('LikeResolver', () => {
  let resolver: LikeResolver;
  let likeProductUseCase: jest.Mocked<LikeProductUseCase>;
  let getLikedProductsUseCase: jest.Mocked<GetLikedProductsUseCase>;
  let productLoader: jest.Mocked<ProductLoader>;

  const mockUser: User = { id: 'user1' } as User;
  const mockLikeProduct: LikeProduct = new LikeProduct({
    productId: 'product1',
    userId: 'user1',
    createdAt: new Date(),
  });

  const mockProduct = new Product({
    productId: 'product1',
    categoryId: 'category1',
    name: 'Sample Product',
    description: 'Sample description',
    price: 100,
    stock: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeResolver,
        {
          provide: LikeProductUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetLikedProductsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ProductLoader,
          useValue: {
            load: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<LikeResolver>(LikeResolver);
    likeProductUseCase = module.get(LikeProductUseCase);
    getLikedProductsUseCase = module.get(GetLikedProductsUseCase);
    productLoader = module.get(ProductLoader);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('likeProduct', () => {
    it('should like a product and return the result', async () => {
      const mockInput: LikeProductInput = { productId: 'product1' };
      jest
        .spyOn(likeProductUseCase, 'execute')
        .mockResolvedValue(mockLikeProduct);

      const context = { req: { user: mockUser } };
      const result = await resolver.likeProduct(mockInput, context);

      expect(likeProductUseCase.execute).toHaveBeenCalledWith({
        productId: mockInput.productId,
        userId: mockUser.id,
      });
      expect(result).toEqual(
        LikeProductEntity.fromDomainToEntity(mockLikeProduct),
      );
    });
  });

  describe('getLikedProducts', () => {
    it('should return a list of liked products', async () => {
      jest
        .spyOn(getLikedProductsUseCase, 'execute')
        .mockResolvedValue([mockLikeProduct]);

      const context = { req: { user: mockUser } };
      const result = await resolver.getLikedProducts(context);

      expect(getLikedProductsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(result).toEqual([
        LikeProductEntity.fromDomainToEntity(mockLikeProduct),
      ]);
    });
  });

  describe('product', () => {
    it('should return the product associated with a like', async () => {
      jest.spyOn(productLoader, 'load').mockResolvedValue(mockProduct);

      const result = await resolver.product(mockLikeProduct);

      expect(productLoader.load).toHaveBeenCalledWith(
        mockLikeProduct.productId,
      );
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });
});
