import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { GetProductDto } from 'src/infraestructure/graphql/dto/product/get-product.dto';
import { GetProductUseCase } from './get-product.use-case';

describe('GetProductUseCase', () => {
  let getProductUseCase: GetProductUseCase;
  let productRepositoryMock: jest.Mocked<ProductRepository>;

  const mockProduct = new Product({
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

  const mockGetProductDto: GetProductDto = {
    productId: 'prod-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        {
          provide: ProductRepository,
          useValue: {
            getProductById: jest.fn(),
            getProductByIdOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    getProductUseCase = module.get<GetProductUseCase>(GetProductUseCase);
    productRepositoryMock = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(getProductUseCase).toBeDefined();
  });

  it('should return a product successfully', async () => {
    productRepositoryMock.getProductByIdOrThrow.mockResolvedValue(mockProduct);

    const result = await getProductUseCase.execute(mockGetProductDto);

    expect(result).toEqual(mockProduct);
    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledWith(
      mockGetProductDto.productId,
    );
    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should throw an error if the repository returns null', async () => {
    productRepositoryMock.getProductByIdOrThrow.mockResolvedValue(null);

    await expect(
      getProductUseCase.execute(mockGetProductDto),
    ).resolves.toBeNull();

    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledWith(
      mockGetProductDto.productId,
    );
    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should propagate any repository error', async () => {
    productRepositoryMock.getProductByIdOrThrow.mockRejectedValue(
      new Error('Repository error'),
    );

    await expect(getProductUseCase.execute(mockGetProductDto)).rejects.toThrow(
      'Repository error',
    );

    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledWith(
      mockGetProductDto.productId,
    );
    expect(productRepositoryMock.getProductByIdOrThrow).toHaveBeenCalledTimes(
      1,
    );
  });
});
