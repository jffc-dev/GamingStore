import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { CreateProductInput } from 'src/infraestructure/graphql/dto/product/inputs/create-product.input';
import { CreateProductUseCase } from './create-products.use-case';

describe('CreateProductUseCase', () => {
  let createProductUseCase: CreateProductUseCase;
  let productRepositoryMock: jest.Mocked<ProductRepository>;
  let uuidServiceMock: jest.Mocked<UuidService>;

  const mockCreateProductInput: CreateProductInput = {
    name: 'Product 1',
    categoryId: 'cat1',
    description: 'Product description',
    stock: 10,
    isActive: true,
    price: 100,
  };

  const mockProduct = new Product({
    productId: 'uuid-123',
    ...mockCreateProductInput,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: ProductRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: UuidService,
          useValue: {
            generateUuid: jest.fn(),
          },
        },
      ],
    }).compile();

    createProductUseCase =
      module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepositoryMock = module.get(ProductRepository);
    uuidServiceMock = module.get(UuidService);
  });

  it('should be defined', () => {
    expect(createProductUseCase).toBeDefined();
  });

  it('should create a product successfully', async () => {
    uuidServiceMock.generateUuid.mockReturnValue('uuid-123');
    productRepositoryMock.create.mockResolvedValue(mockProduct);

    const result = await createProductUseCase.execute(mockCreateProductInput);

    expect(result).toEqual(mockProduct);
    expect(uuidServiceMock.generateUuid).toHaveBeenCalledTimes(1);
    expect(productRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: 'uuid-123',
        name: 'Product 1',
        categoryId: 'cat1',
        description: 'Product description',
        stock: 10,
        isActive: true,
        price: 100,
      }),
    );
  });

  it('should throw an error if the repository fails', async () => {
    uuidServiceMock.generateUuid.mockReturnValue('uuid-123');
    productRepositoryMock.create.mockRejectedValue(
      new Error('Repository error'),
    );

    await expect(
      createProductUseCase.execute(mockCreateProductInput),
    ).rejects.toThrow('Repository error');

    expect(uuidServiceMock.generateUuid).toHaveBeenCalledTimes(1);
    expect(productRepositoryMock.create).toHaveBeenCalledTimes(1);
  });
});
