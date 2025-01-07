import { Test } from '@nestjs/testing';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { UpdateProductInput } from 'src/infraestructure/graphql/dto/product/inputs/update-product.input';
import { UpdateProductUseCase } from './update-product.use-case';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: ProductRepository;

  const mockProductRepository = {
    getProductByIdOrThrow: jest.fn(),
    updateProduct: jest.fn(),
  };

  const mockUuidService = {
    generate: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: ProductRepository,
          useValue: mockProductRepository,
        },
        {
          provide: UuidService,
          useValue: mockUuidService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    productRepository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const existingProduct = new Product({
    productId: 'product-1',
    categoryId: 'category-1',
    name: 'Original Product',
    price: 100,
    description: 'Original description',
  });

  const updateProductDto: UpdateProductInput = {
    name: 'Updated Product',
    price: 150,
    description: 'Updated description',
  };

  describe('execute', () => {
    it('should update a product successfully', async () => {
      mockProductRepository.getProductByIdOrThrow.mockResolvedValue(
        existingProduct,
      );

      const expectedUpdatedProduct = new Product({
        categoryId: existingProduct.categoryId,
        price: existingProduct.price,
        name: existingProduct.name,
        ...updateProductDto,
      });

      mockProductRepository.updateProduct.mockResolvedValue(
        expectedUpdatedProduct,
      );

      const result = await useCase.execute('product-1', updateProductDto);

      expect(productRepository.getProductByIdOrThrow).toHaveBeenCalledWith(
        'product-1',
      );
      expect(productRepository.updateProduct).toHaveBeenCalledWith(
        'product-1',
        expect.objectContaining({
          categoryId: existingProduct.categoryId,
          name: updateProductDto.name,
          price: updateProductDto.price,
          description: updateProductDto.description,
        }),
      );

      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe(updateProductDto.name);
      expect(result.price).toBe(updateProductDto.price);
      expect(result.description).toBe(updateProductDto.description);
      expect(result.categoryId).toBe(existingProduct.categoryId);
    });

    it('should maintain existing values for non-updated fields', async () => {
      mockProductRepository.getProductByIdOrThrow.mockResolvedValue(
        existingProduct,
      );

      const partialUpdate: UpdateProductInput = {
        name: 'Updated Product',
      };

      const expectedUpdatedProduct = new Product({
        ...existingProduct,
        name: partialUpdate.name,
        categoryId: existingProduct.categoryId,
        price: existingProduct.price,
      });

      mockProductRepository.updateProduct.mockResolvedValue(
        expectedUpdatedProduct,
      );

      const result = await useCase.execute('product-1', partialUpdate);

      expect(result.name).toBe(partialUpdate.name);
      expect(result.price).toBe(existingProduct.price);
    });

    it('should throw error if product is not found', async () => {
      mockProductRepository.getProductByIdOrThrow.mockRejectedValue(
        new Error('Product not found'),
      );

      await expect(
        useCase.execute('non-existent-id', updateProductDto),
      ).rejects.toThrow('Product not found');

      expect(productRepository.updateProduct).not.toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      mockProductRepository.getProductByIdOrThrow.mockResolvedValue(
        existingProduct,
      );
      mockProductRepository.updateProduct.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(
        useCase.execute('product-1', updateProductDto),
      ).rejects.toThrow('Update failed');
    });
  });
});
