import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { CartDetail } from 'src/domain/cart-detail';
import { GetCartDetailsUseCase } from './get-cart-details.use-case';

describe('GetCartDetailsUseCase', () => {
  let useCase: GetCartDetailsUseCase;
  let cartDetailRepository: CartDetailRepository;

  const mockCartDetails: CartDetail[] = [
    new CartDetail({
      userId: 'user123',
      productId: 'product1',
      quantity: 2,
    }),
    new CartDetail({
      userId: 'user123',
      productId: 'product2',
      quantity: 1,
    }),
  ];

  const mockCartDetailRepository = {
    getCartDetailsByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCartDetailsUseCase,
        {
          provide: CartDetailRepository,
          useValue: mockCartDetailRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetCartDetailsUseCase>(GetCartDetailsUseCase);
    cartDetailRepository =
      module.get<CartDetailRepository>(CartDetailRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return cart details for a user successfully', async () => {
      const userId = 'user123';
      mockCartDetailRepository.getCartDetailsByUser.mockResolvedValue(
        mockCartDetails,
      );

      const result = await useCase.execute({ userId });

      expect(result).toEqual(mockCartDetails);
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledWith(
        userId,
      );
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should return empty array when user has no cart items', async () => {
      const userId = 'userWithNoItems';
      mockCartDetailRepository.getCartDetailsByUser.mockResolvedValue([]);

      const result = await useCase.execute({ userId });

      expect(result).toEqual([]);
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledWith(
        userId,
      );
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle repository errors', async () => {
      const userId = 'user123';
      const error = new Error('Database error');
      mockCartDetailRepository.getCartDetailsByUser.mockRejectedValue(error);

      await expect(useCase.execute({ userId })).rejects.toThrow(error);
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledWith(
        userId,
      );
      expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledTimes(
        1,
      );
    });

    // it('should verify cart details structure in response', async () => {
    //   const userId = 'user123';
    //   mockCartDetailRepository.getCartDetailsByUser.mockResolvedValue(
    //     mockCartDetails,
    //   );

    //   const result = await useCase.execute({ userId });

    //   expect(result).toBeInstanceOf(Array);
    //   result.forEach((cartDetail) => {
    //     expect(cartDetail).toHaveProperty('id');
    //     expect(cartDetail).toHaveProperty('userId');
    //     expect(cartDetail).toHaveProperty('productId');
    //     expect(cartDetail).toHaveProperty('quantity');
    //   });
    //   expect(cartDetailRepository.getCartDetailsByUser).toHaveBeenCalledWith(
    //     userId,
    //   );
    // });
  });
});
