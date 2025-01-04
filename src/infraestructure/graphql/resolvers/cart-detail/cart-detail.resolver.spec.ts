import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailResolver } from './cart-detail.resolver';
import { GetCartDetailsUseCase } from 'src/application/use-cases/cart/get-cart-details.use-case';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart/add-to-cart.use-cases';
import { CreateCartDetailInput } from '../../dto/cart/input/create-cart-detail.input';
import { CartDetail as CartDetailEntity } from '../../entities/cart-detail.entity';
import { CartDetail } from 'src/domain/cart-detail';

describe('CartDetailResolver', () => {
  let resolver: CartDetailResolver;
  let getCartDetailsUseCase: GetCartDetailsUseCase;
  let addProductToCartUseCase: AddProductToCartUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartDetailResolver,
        {
          provide: GetCartDetailsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: AddProductToCartUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<CartDetailResolver>(CartDetailResolver);
    getCartDetailsUseCase = module.get<GetCartDetailsUseCase>(
      GetCartDetailsUseCase,
    );
    addProductToCartUseCase = module.get<AddProductToCartUseCase>(
      AddProductToCartUseCase,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCartDetails', () => {
    it('should return cart details for the current user', async () => {
      const mockUser = { id: '123' };
      const mockContext = { req: { user: mockUser } };
      const mockCartDetails = [
        new CartDetail({
          productId: 'p1',
          userId: '123',
          quantity: 2,
        }),
      ];
      jest
        .spyOn(getCartDetailsUseCase, 'execute')
        .mockResolvedValue(mockCartDetails);

      const result = await resolver.getCartDetails(mockContext);

      expect(getCartDetailsUseCase.execute).toHaveBeenCalledWith({
        userId: mockUser.id,
      });
      expect(result).toEqual(
        mockCartDetails.map(CartDetailEntity.fromDomainToEntity),
      );
    });
  });

  describe('addItemToCart', () => {
    it('should add a product to the cart', async () => {
      const mockUser = { id: '123' };
      const mockContext = { req: { user: mockUser } };
      const mockInput: CreateCartDetailInput = {
        productId: 'p1',
        quantity: 1,
      };
      const mockCartDetail = new CartDetail({
        productId: 'p1',
        userId: '123',
        quantity: 1,
      });
      jest
        .spyOn(addProductToCartUseCase, 'execute')
        .mockResolvedValue(mockCartDetail);

      const result = await resolver.addItemToCart(mockInput, mockContext);

      expect(addProductToCartUseCase.execute).toHaveBeenCalledWith({
        productId: mockInput.productId,
        userId: mockUser.id,
        quantity: mockInput.quantity,
      });
      expect(result).toEqual(
        CartDetailEntity.fromDomainToEntity(mockCartDetail),
      );
    });
  });
});
