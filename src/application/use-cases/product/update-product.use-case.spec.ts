import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.use-case';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { UpdateProductInput } from 'src/infraestructure/graphql/dto/product/inputs/update-product.input';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockProductProps = {
    id: 'product-123',
    name: 'Original Product',
    price: 100,
    categoryId: 'category-123',
    description: 'Original description',
    stock: 10,
    isActive: true,
    isDeleted: false,
    deletedAt: null,
    createdAt: new Date(),
  };

  const mockProduct = new Product({
    ...mockProductProps,
  });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: ProductRepository,
          useValue: {
            getProductById: jest.fn(),
            updateProduct: jest.fn(),
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

    useCase = moduleRef.get<UpdateProductUseCase>(UpdateProductUseCase);
    productRepository = moduleRef.get(ProductRepository);
  });

  it('should update product successfully with partial data', async () => {
    const productId = mockProduct.productId;
    const updateData: UpdateProductInput = {
      name: 'Updated Product',
      price: 150,
    };

    productRepository.getProductById.mockResolvedValue(mockProduct);
    productRepository.updateProduct.mockImplementation((id, product) =>
      Promise.resolve(
        new Product({
          ...mockProductProps,
          name: product.name,
          price: product.price,
        }),
      ),
    );

    const result = await useCase.execute(productId, updateData);

    expect(productRepository.getProductById).toHaveBeenCalledWith(productId);
    expect(productRepository.updateProduct).toHaveBeenCalledWith(
      productId,
      expect.objectContaining({
        name: updateData.name,
        price: updateData.price,
      }),
    );
    expect(result.name).toBe(updateData.name);
    expect(result.price).toBe(updateData.price);
  });

  it('should maintain existing fields when updating partially', async () => {
    const productId = mockProduct.productId;
    const updateData: UpdateProductInput = {
      description: 'Updated description',
    };

    productRepository.getProductById.mockResolvedValue(mockProduct);
    productRepository.updateProduct.mockImplementation((id, product) =>
      Promise.resolve(
        new Product({ ...mockProductProps, description: product.description }),
      ),
    );

    const result = await useCase.execute(productId, updateData);

    expect(result.name).toBe(mockProduct.name);
    expect(result.price).toBe(mockProduct.price);
    expect(result.description).toBe(updateData.description);
    expect(result.categoryId).toBe(mockProduct.categoryId);
  });

  it('should throw NotFoundException when product not found', async () => {
    const productId = 'non-existent-id';
    const updateData: UpdateProductInput = {
      name: 'Updated Product',
    };

    productRepository.getProductById.mockResolvedValue(null);

    await expect(useCase.execute(productId, updateData)).rejects.toThrow(
      NotFoundException,
    );
    expect(productRepository.updateProduct).not.toHaveBeenCalled();
  });

  it('should throw error when update fails', async () => {
    const productId = mockProduct.productId;
    const updateData: UpdateProductInput = {
      name: 'Updated Product',
    };

    productRepository.getProductById.mockResolvedValue(mockProduct);
    productRepository.updateProduct.mockRejectedValue(
      new Error('Update failed'),
    );

    await expect(useCase.execute(productId, updateData)).rejects.toThrow(
      'Update failed',
    );
  });
});
