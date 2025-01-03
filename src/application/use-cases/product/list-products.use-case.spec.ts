import { Test } from '@nestjs/testing';
import { ListProductsUseCase } from './list-products.use-case';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let productRepository: jest.Mocked<ProductRepository>;

  const mockProducts = [
    new Product({
      productId: 'product-1',
      name: 'Product 1',
      description: 'Description 1',
      stock: 10,
      price: 100,
      categoryId: 'category-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Product({
      productId: 'product-2',
      name: 'Product 2',
      description: 'Description 2',
      stock: 20,
      price: 200,
      categoryId: 'category-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    new Product({
      productId: 'product-3',
      name: 'Product 3',
      description: 'Description 3',
      stock: 30,
      price: 300,
      categoryId: 'category-2',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ListProductsUseCase,
        {
          provide: ProductRepository,
          useValue: {
            filterProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<ListProductsUseCase>(ListProductsUseCase);
    productRepository = moduleRef.get(ProductRepository);
  });

  it('should return first N products without cursor', async () => {
    const first = 2;
    productRepository.filterProducts.mockResolvedValue(mockProducts);

    const result = await useCase.execute({ first });

    expect(productRepository.filterProducts).toHaveBeenCalledWith({ first });
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].cursor).toBe('product-1');
    expect(result.edges[1].cursor).toBe('product-2');
    expect(result.pageInfo).toEqual({
      hasNextPage: true,
      hasPreviousPage: false,
      startCursor: 'product-1',
      endCursor: 'product-2',
    });
  });

  it('should handle pagination with after cursor', async () => {
    const first = 2;
    const after = 'product-1';
    productRepository.filterProducts.mockResolvedValue(mockProducts.slice(1));

    const result = await useCase.execute({ first, after });

    expect(productRepository.filterProducts).toHaveBeenCalledWith({
      first,
      after,
    });
    expect(result.edges).toHaveLength(2);
    expect(result.edges[0].cursor).toBe('product-2');
    expect(result.edges[1].cursor).toBe('product-3');
    expect(result.pageInfo).toEqual({
      hasNextPage: false,
      hasPreviousPage: true,
      startCursor: 'product-2',
      endCursor: 'product-3',
    });
  });

  it('should filter by category', async () => {
    const first = 2;
    const categoryId = 'category-1';
    const filteredProducts = mockProducts.filter(
      (p) => p.categoryId === categoryId,
    );
    productRepository.filterProducts.mockResolvedValue(filteredProducts);

    const result = await useCase.execute({ first, categoryId });

    expect(productRepository.filterProducts).toHaveBeenCalledWith({
      first,
      categoryId,
    });
    expect(result.edges).toHaveLength(2);
    expect(
      result.edges.every((edge) => edge.node.categoryId === categoryId),
    ).toBe(true);
  });

  it('should filter by isActive', async () => {
    const first = 2;
    const isActive = true;
    const filteredProducts = mockProducts.filter(
      (p) => p.isActive === isActive,
    );
    productRepository.filterProducts.mockResolvedValue(filteredProducts);

    const result = await useCase.execute({ first, isActive });

    expect(productRepository.filterProducts).toHaveBeenCalledWith({
      first,
      isActive,
    });
    expect(result.edges.every((edge) => edge.node.isActive === isActive)).toBe(
      true,
    );
  });

  it('should handle empty results', async () => {
    const first = 2;
    productRepository.filterProducts.mockResolvedValue([]);

    const result = await useCase.execute({ first });

    expect(result.edges).toHaveLength(0);
    expect(result.pageInfo).toEqual({
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    });
  });

  it('should correctly transform product data to edge/node structure', async () => {
    const first = 1;
    productRepository.filterProducts.mockResolvedValue([mockProducts[0]]);

    const result = await useCase.execute({ first });

    const expectedNode = {
      id: mockProducts[0].productId,
      name: mockProducts[0].name,
      description: mockProducts[0].description,
      stock: mockProducts[0].stock,
      price: mockProducts[0].price,
      categoryId: mockProducts[0].categoryId,
      isActive: mockProducts[0].isActive,
      createdAt: mockProducts[0].createdAt,
      updatedAt: mockProducts[0].updatedAt,
    };

    expect(result.edges[0].node).toEqual(expectedNode);
    expect(result.edges[0].cursor).toBe(mockProducts[0].productId);
  });
});
