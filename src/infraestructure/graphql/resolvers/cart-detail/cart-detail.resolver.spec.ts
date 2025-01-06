import { Test, TestingModule } from '@nestjs/testing';
import { CartDetailResolver } from './cart-detail.resolver';
import { GetCartDetailsUseCase } from 'src/application/use-cases/cart/get-cart-details.use-case';
import { AddProductToCartUseCase } from 'src/application/use-cases/cart/add-to-cart.use-cases';
import { CartDetail } from 'src/domain/cart-detail';
import { CreateCartDetailInput } from '../../dto/cart/input/create-cart-detail.input';
import { CartDetail as CartDetailEntity } from '../../entities/cart-detail.entity';
import { User } from 'src/domain/user';

describe('CartDetailResolver', () => {
  let resolver: CartDetailResolver;
  let getCartDetailsUseCase: jest.Mocked<GetCartDetailsUseCase>;
  let addProductToCartUseCase: jest.Mocked<AddProductToCartUseCase>;

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
    getCartDetailsUseCase = module.get(GetCartDetailsUseCase);
    addProductToCartUseCase = module.get(AddProductToCartUseCase);
  });

  describe('getCartDetails', () => {
    it('should return cart details for the current user', async () => {
      const mockUser = { id: '123' } as User;
      const mockContext = { req: { user: mockUser } };
      const mockCartDetails = [
        new CartDetail({ productId: 'p1', userId: '123', quantity: 1 }),
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
    it('should add an item to the cart and return the cart detail', async () => {
      const mockUser = { id: '123' } as User;
      const mockInput: CreateCartDetailInput = { productId: 'p1', quantity: 1 };
      const mockContext = { req: { user: mockUser } };
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
