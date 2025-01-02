import { Test, TestingModule } from '@nestjs/testing';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { GetLikedProductsUseCase } from './get-likes.use-case';

describe('GetLikedProductsUseCase', () => {
  let useCase: GetLikedProductsUseCase;
  let likeProductRepository: LikeProductRepository;

  const mockLikedProducts: LikeProduct[] = [
    new LikeProduct({
      userId: 'user123',
      productId: 'product1',
      createdAt: new Date('2024-01-01'),
    }),
    new LikeProduct({
      userId: 'user123',
      productId: 'product2',
      createdAt: new Date('2024-01-02'),
    }),
  ];

  const mockLikeProductRepository = {
    getLikedProducts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLikedProductsUseCase,
        {
          provide: LikeProductRepository,
          useValue: mockLikeProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetLikedProductsUseCase>(GetLikedProductsUseCase);
    likeProductRepository = module.get<LikeProductRepository>(
      LikeProductRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return liked products for a user successfully', async () => {
      const userId = 'user123';
      mockLikeProductRepository.getLikedProducts.mockResolvedValue(
        mockLikedProducts,
      );

      const result = await useCase.execute({ userId });

      expect(result).toEqual(mockLikedProducts);
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledWith(
        userId,
      );
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no liked products', async () => {
      const userId = 'userWithNoLikes';
      mockLikeProductRepository.getLikedProducts.mockResolvedValue([]);

      const result = await useCase.execute({ userId });

      expect(result).toEqual([]);
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledWith(
        userId,
      );
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const userId = 'user123';
      const error = new Error('Database error');
      mockLikeProductRepository.getLikedProducts.mockRejectedValue(error);

      await expect(useCase.execute({ userId })).rejects.toThrow(error);
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledWith(
        userId,
      );
      expect(likeProductRepository.getLikedProducts).toHaveBeenCalledTimes(1);
    });

    // it('should verify liked products structure in response', async () => {
    //   const userId = 'user123';
    //   mockLikeProductRepository.getLikedProducts.mockResolvedValue(
    //     mockLikedProducts,
    //   );

    //   const result = await useCase.execute({ userId });

    //   expect(result).toBeInstanceOf(Array);
    //   result.forEach((likedProduct) => {
    //     expect(likedProduct).toHaveProperty('id');
    //     expect(likedProduct).toHaveProperty('userId');
    //     expect(likedProduct).toHaveProperty('productId');
    //     expect(likedProduct).toHaveProperty('createdAt');
    //     expect(likedProduct.userId).toBe(userId);
    //   });
    //   expect(likeProductRepository.getLikedProducts).toHaveBeenCalledWith(
    //     userId,
    //   );
    // });
  });
});
