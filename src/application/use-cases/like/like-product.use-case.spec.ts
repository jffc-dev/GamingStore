import { Test, TestingModule } from '@nestjs/testing';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import { LikeProduct } from 'src/domain/like-product';
import { LikeProductUseCase } from './like-product.use-case';

describe('LikeProductUseCase', () => {
  let useCase: LikeProductUseCase;
  let likeProductRepository: LikeProductRepository;

  const mockLikeProduct = new LikeProduct({
    userId: 'user123',
    productId: 'product456',
    createdAt: new Date(),
  });

  const mockLikeProductRepository = {
    likeProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeProductUseCase,
        {
          provide: LikeProductRepository,
          useValue: mockLikeProductRepository,
        },
      ],
    }).compile();

    useCase = module.get<LikeProductUseCase>(LikeProductUseCase);
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
    const validInput = {
      userId: 'user123',
      productId: 'product456',
    };

    it('should successfully like a product', async () => {
      mockLikeProductRepository.likeProduct.mockResolvedValue(mockLikeProduct);

      const result = await useCase.execute(validInput);

      expect(result).toEqual(mockLikeProduct);
      expect(likeProductRepository.likeProduct).toHaveBeenCalledWith(
        expect.any(LikeProduct),
      );
      expect(likeProductRepository.likeProduct).toHaveBeenCalledTimes(1);
    });

    it('should create LikeProduct with correct properties', async () => {
      mockLikeProductRepository.likeProduct.mockResolvedValue(mockLikeProduct);

      await useCase.execute(validInput);

      expect(likeProductRepository.likeProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validInput.userId,
          productId: validInput.productId,
        }),
      );
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockLikeProductRepository.likeProduct.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(error);
      expect(likeProductRepository.likeProduct).toHaveBeenCalledTimes(1);
    });

    // it('should verify the created LikeProduct has all required properties', async () => {
    //   mockLikeProductRepository.likeProduct.mockImplementation(
    //     (likeProduct) => {
    //       return Promise.resolve({
    //         ...likeProduct,
    //         id: '1',
    //         createdAt: new Date(),
    //       });
    //     },
    //   );

    //   const result = await useCase.execute(validInput);

    //   expect(result).toHaveProperty('id');
    //   expect(result).toHaveProperty('userId', validInput.userId);
    //   expect(result).toHaveProperty('productId', validInput.productId);
    //   expect(result).toHaveProperty('createdAt');
    //   expect(result.createdAt).toBeInstanceOf(Date);
    // });

    it('should not modify input parameters', async () => {
      const originalInput = { ...validInput };
      mockLikeProductRepository.likeProduct.mockResolvedValue(mockLikeProduct);

      await useCase.execute(validInput);

      expect(validInput).toEqual(originalInput);
    });
  });
});
