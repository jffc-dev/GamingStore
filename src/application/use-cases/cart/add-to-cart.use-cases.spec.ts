import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { CartDetail } from 'src/domain/cart-detail';
import { AddProductToCartUseCase } from './add-to-cart.use-cases';

describe('AddProductToCartUseCase', () => {
  let useCase: AddProductToCartUseCase;
  let productRepository: ProductRepository;
  let cartDetailRepository: CartDetailRepository;

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 100,
    stock: 10,
  };

  const mockCartDetail = {
    id: '1',
    productId: '1',
    userId: 'user123',
    quantity: 2,
  };

  const mockProductRepository = {
    getProductById: jest.fn(),
  };

  const mockCartDetailRepository = {
    addToCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProductToCartUseCase,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
        {
          provide: CartDetailRepository,
          useValue: mockCartDetailRepository,
        },
      ],
    }).compile();

    useCase = module.get<AddProductToCartUseCase>(AddProductToCartUseCase);
    productRepository = module.get<ProductRepository>(ProductRepository);
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
    const validInput = {
      productId: '1',
      userId: 'user123',
      quantity: 2,
    };

    it('should successfully add product to cart when all conditions are met', async () => {
      mockProductRepository.getProductById.mockResolvedValue(mockProduct);
      mockCartDetailRepository.addToCart.mockResolvedValue(mockCartDetail);

      const result = await useCase.execute(validInput);

      expect(result).toEqual(mockCartDetail);
      expect(productRepository.getProductById).toHaveBeenCalledWith(
        validInput.productId,
      );
      expect(cartDetailRepository.addToCart).toHaveBeenCalledWith(
        expect.any(CartDetail),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockProductRepository.getProductById.mockResolvedValue(null);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepository.getProductById).toHaveBeenCalledWith(
        validInput.productId,
      );
      expect(cartDetailRepository.addToCart).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when product stock is insufficient', async () => {
      const lowStockProduct = { ...mockProduct, stock: 1 };
      mockProductRepository.getProductById.mockResolvedValue(lowStockProduct);

      await expect(useCase.execute(validInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(productRepository.getProductById).toHaveBeenCalledWith(
        validInput.productId,
      );
      expect(cartDetailRepository.addToCart).not.toHaveBeenCalled();
    });

    it('should handle repository errors when getting product', async () => {
      const error = new Error('Database error');
      mockProductRepository.getProductById.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(error);
      expect(productRepository.getProductById).toHaveBeenCalledWith(
        validInput.productId,
      );
      expect(cartDetailRepository.addToCart).not.toHaveBeenCalled();
    });

    it('should handle repository errors when adding to cart', async () => {
      mockProductRepository.getProductById.mockResolvedValue(mockProduct);
      const error = new Error('Database error');
      mockCartDetailRepository.addToCart.mockRejectedValue(error);

      await expect(useCase.execute(validInput)).rejects.toThrow(error);
      expect(productRepository.getProductById).toHaveBeenCalledWith(
        validInput.productId,
      );
      expect(cartDetailRepository.addToCart).toHaveBeenCalled();
    });

    it('should verify CartDetail object is created with correct properties', async () => {
      mockProductRepository.getProductById.mockResolvedValue(mockProduct);
      mockCartDetailRepository.addToCart.mockResolvedValue(mockCartDetail);

      await useCase.execute(validInput);

      expect(cartDetailRepository.addToCart).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: validInput.productId,
          userId: validInput.userId,
          quantity: validInput.quantity,
        }),
      );
    });
  });
});
