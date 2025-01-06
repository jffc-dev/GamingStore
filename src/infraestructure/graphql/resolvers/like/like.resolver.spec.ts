import { Test, TestingModule } from '@nestjs/testing';
import { LikeResolver } from './like.resolver';
import { LikeProductUseCase } from 'src/application/use-cases/like/like-product.use-case';
import { GetLikedProductsUseCase } from 'src/application/use-cases/like/get-likes.use-case';
import { LikeProduct as LikeProductEntity } from '../../entities/like-product.entity';
import { LikeProductInput } from '../../dto/like/input/like-product.input';
import { User } from 'src/domain/user';
import { LikeProduct } from 'src/domain/like-product';

describe('LikeResolver', () => {
  let resolver: LikeResolver;
  let likeProductUseCase: LikeProductUseCase;
  let getLikedProductsUseCase: GetLikedProductsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeResolver,
        {
          provide: LikeProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetLikedProductsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<LikeResolver>(LikeResolver);
    likeProductUseCase = module.get<LikeProductUseCase>(LikeProductUseCase);
    getLikedProductsUseCase = module.get<GetLikedProductsUseCase>(
      GetLikedProductsUseCase,
    );
  });

  describe('likeProduct', () => {
    it('should like a product and return the result', async () => {
      const mockInput: LikeProductInput = { productId: 'product1' };
      const mockUser: User = { id: 'user1' } as User;
      const mockResult: LikeProductEntity = {
        productId: 'product1',
        userId: 'user1',
      } as LikeProductEntity;

      jest.spyOn(likeProductUseCase, 'execute').mockResolvedValue(mockResult);

      const context = { req: { user: mockUser } };
      const result = await resolver.likeProduct(mockInput, context);

      expect(likeProductUseCase.execute).toHaveBeenCalledWith({
        productId: 'product1',
        userId: 'user1',
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle errors in liking a product', async () => {
      const mockInput: LikeProductInput = { productId: 'product1' };
      const mockUser: User = { id: 'user1' } as User;

      jest
        .spyOn(likeProductUseCase, 'execute')
        .mockRejectedValue(new Error('Error liking product'));

      const context = { req: { user: mockUser } };

      await expect(resolver.likeProduct(mockInput, context)).rejects.toThrow(
        'Error liking product',
      );
    });
  });

  describe('getLikedProducts', () => {
    it('should return liked products for the current user', async () => {
      const mockUser: User = { id: 'user1' } as User;
      const mockLikedProducts: LikeProduct[] = [
        new LikeProduct({
          productId: 'product1',
          userId: 'user1',
        }),
        new LikeProduct({
          productId: 'product2',
          userId: 'user1',
        }),
      ];

      jest
        .spyOn(getLikedProductsUseCase, 'execute')
        .mockResolvedValue(mockLikedProducts);

      const context = { req: { user: mockUser } };
      const result = await resolver.getLikedProducts(context);

      expect(getLikedProductsUseCase.execute).toHaveBeenCalledWith({
        userId: 'user1',
      });
      expect(result).toEqual(
        mockLikedProducts.map(LikeProductEntity.fromDomainToEntity),
      );
    });

    it('should return an empty array if the user has no liked products', async () => {
      const mockUser: User = { id: 'user1' } as User;

      jest.spyOn(getLikedProductsUseCase, 'execute').mockResolvedValue([]);

      const context = { req: { user: mockUser } };
      const result = await resolver.getLikedProducts(context);

      expect(getLikedProductsUseCase.execute).toHaveBeenCalledWith({
        userId: 'user1',
      });
      expect(result).toEqual([]);
    });

    it('should handle errors when fetching liked products', async () => {
      const mockUser: User = { id: 'user1' } as User;

      jest
        .spyOn(getLikedProductsUseCase, 'execute')
        .mockRejectedValue(new Error('Error fetching liked products'));

      const context = { req: { user: mockUser } };

      await expect(resolver.getLikedProducts(context)).rejects.toThrow(
        'Error fetching liked products',
      );
    });
  });
});
