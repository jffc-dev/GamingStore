import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AvailableProductUseCase } from './available-product.use-case';

describe('AvailableProductUseCase', () => {
  let availableProductUseCase: AvailableProductUseCase;
  let productRepositoryMock: jest.Mocked<ProductRepository>;

  const mockProductId = 'prod-123';
  const mockProductProps = {
    productId: mockProductId,
    name: 'Test Product',
    description: 'Test Description',
    stock: 10,
    price: 100,
    categoryId: 'cat-123',
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockProduct = new Product({
    ...mockProductProps,
  });

  const updatedProduct: Product = new Product({
    ...mockProductProps,
    isActive: false,
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailableProductUseCase,
        {
          provide: ProductRepository,
          useValue: {
            getProductById: jest.fn(),
            updateProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    availableProductUseCase = module.get<AvailableProductUseCase>(
      AvailableProductUseCase,
    );
    productRepositoryMock = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(availableProductUseCase).toBeDefined();
  });

  it('should enable a product successfully', async () => {
    const input = { productId: mockProductId, isActive: true };
    const enabledProduct = new Product({
      ...mockProductProps,
      isActive: false,
    });

    productRepositoryMock.getProductById.mockResolvedValue(enabledProduct);
    productRepositoryMock.updateProduct.mockResolvedValue(enabledProduct);

    const result = await availableProductUseCase.execute(input);

    expect(result).toEqual(enabledProduct);
    expect(productRepositoryMock.getProductById).toHaveBeenCalledWith(
      mockProductId,
    );
    expect(productRepositoryMock.updateProduct).toHaveBeenCalledWith(
      mockProductId,
      expect.objectContaining({
        isActive: true,
      }),
    );
  });

  it('should disable a product successfully', async () => {
    const input = { productId: mockProductId, isActive: false };
    productRepositoryMock.getProductById.mockResolvedValue(mockProduct);
    productRepositoryMock.updateProduct.mockResolvedValue(updatedProduct);

    const result = await availableProductUseCase.execute(input);

    expect(result).toEqual(updatedProduct);
    expect(productRepositoryMock.getProductById).toHaveBeenCalledWith(
      mockProductId,
    );
    expect(productRepositoryMock.updateProduct).toHaveBeenCalledWith(
      mockProductId,
      expect.objectContaining({
        isActive: false,
      }),
    );
  });

  it('should throw NotFoundException if product is not found', async () => {
    productRepositoryMock.getProductById.mockResolvedValue(null);

    const input = { productId: 'invalid-id', isActive: true };

    await expect(availableProductUseCase.execute(input)).rejects.toThrow(
      NotFoundException,
    );

    expect(productRepositoryMock.getProductById).toHaveBeenCalledWith(
      'invalid-id',
    );
    expect(productRepositoryMock.updateProduct).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException if product state is already set', async () => {
    productRepositoryMock.getProductById.mockResolvedValue(mockProduct);

    const input = { productId: mockProductId, isActive: true };

    await expect(availableProductUseCase.execute(input)).rejects.toThrow(
      BadRequestException,
    );

    expect(productRepositoryMock.getProductById).toHaveBeenCalledWith(
      mockProductId,
    );
    expect(productRepositoryMock.updateProduct).not.toHaveBeenCalled();
  });
});
