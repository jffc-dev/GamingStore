import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProductUseCase } from './delete-product.use-case';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';

const mockProductRepository = () => ({
  softDeleteProductById: jest.fn(),
});

describe('DeleteProductUseCase', () => {
  let deleteProductUseCase: DeleteProductUseCase;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        { provide: ProductRepository, useFactory: mockProductRepository },
      ],
    }).compile();

    deleteProductUseCase =
      module.get<DeleteProductUseCase>(DeleteProductUseCase);
    productRepository = module.get(ProductRepository);
  });

  it('should be defined', () => {
    expect(deleteProductUseCase).toBeDefined();
    expect(productRepository).toBeDefined();
  });

  it('should call softDeleteProductById with the correct productId', async () => {
    const productId = 'test-product-id';
    const deleteResponse = true;

    productRepository.softDeleteProductById.mockResolvedValue(deleteResponse);

    const result = await deleteProductUseCase.execute({ productId });

    expect(productRepository.softDeleteProductById).toHaveBeenCalledWith(
      productId,
    );
    expect(result).toBe(deleteResponse);
  });

  it('should return false if the product was not deleted', async () => {
    const productId = 'non-existent-product-id';
    const deleteResponse = false;

    productRepository.softDeleteProductById.mockResolvedValue(deleteResponse);

    const result = await deleteProductUseCase.execute({ productId });

    expect(productRepository.softDeleteProductById).toHaveBeenCalledWith(
      productId,
    );
    expect(result).toBe(deleteResponse);
  });

  it('should throw an error if productRepository.softDeleteProductById throws', async () => {
    const productId = 'test-product-id';
    const error = new Error('Repository error');

    productRepository.softDeleteProductById.mockRejectedValue(error);

    await expect(deleteProductUseCase.execute({ productId })).rejects.toThrow(
      'Repository error',
    );
    expect(productRepository.softDeleteProductById).toHaveBeenCalledWith(
      productId,
    );
  });
});
