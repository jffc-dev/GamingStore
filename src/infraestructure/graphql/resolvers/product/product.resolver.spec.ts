import { Test, TestingModule } from '@nestjs/testing';
import { ProductResolver } from './product.resolver';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products.use-case';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product.use-case';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products.use-case';
import { UpdateProductUseCase } from 'src/application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from 'src/application/use-cases/product/delete-product.use-case';
import { AvailableProductUseCase } from 'src/application/use-cases/product/available-product.use-case';
import { ImagesByProductLoader } from './dataloaders/images-by-product.loader';
import { CategoryLoader } from './dataloaders/category.loader';
import { Product as ProductEntity } from '../../entities/product.entity';
import { Category as CategoryEntity } from '../../entities/category.entity';
import { ProductImage } from '../../entities/product-image.entity';
import { Product } from 'src/domain/product';
import { Category } from 'src/domain/category';

describe('ProductResolver', () => {
  let resolver: ProductResolver;
  let listProductsUseCase: ListProductsUseCase;
  let getProductUseCase: GetProductUseCase;
  let createProductUseCase: CreateProductUseCase;
  let updateProductUseCase: UpdateProductUseCase;
  let deleteProductUseCase: DeleteProductUseCase;
  let availableProductUseCase: AvailableProductUseCase;
  let imagesByProductLoader: ImagesByProductLoader;
  let categoryLoader: CategoryLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductResolver,
        {
          provide: ListProductsUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: AvailableProductUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ImagesByProductLoader,
          useValue: { load: jest.fn() },
        },
        {
          provide: CategoryLoader,
          useValue: { load: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<ProductResolver>(ProductResolver);
    listProductsUseCase = module.get<ListProductsUseCase>(ListProductsUseCase);
    getProductUseCase = module.get<GetProductUseCase>(GetProductUseCase);
    createProductUseCase =
      module.get<CreateProductUseCase>(CreateProductUseCase);
    updateProductUseCase =
      module.get<UpdateProductUseCase>(UpdateProductUseCase);
    deleteProductUseCase =
      module.get<DeleteProductUseCase>(DeleteProductUseCase);
    availableProductUseCase = module.get<AvailableProductUseCase>(
      AvailableProductUseCase,
    );
    imagesByProductLoader = module.get<ImagesByProductLoader>(
      ImagesByProductLoader,
    );
    categoryLoader = module.get<CategoryLoader>(CategoryLoader);
  });

  describe('findAll', () => {
    it('should return a list of products', async () => {
      const mockProducts = {
        edges: [
          {
            cursor: 'cursor1',
            node: { id: '1', name: 'Product A' },
          },
          {
            cursor: 'cursor2',
            node: { id: '2', name: 'Product B' },
          },
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor1',
          endCursor: 'cursor2',
        },
      };

      jest
        .spyOn(listProductsUseCase, 'execute')
        .mockResolvedValue(mockProducts);

      const result = await resolver.findAll({ first: 10 });

      expect(listProductsUseCase.execute).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findProduct', () => {
    it('should return a single product', async () => {
      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      jest.spyOn(getProductUseCase, 'execute').mockResolvedValue(mockProduct);

      const result = await resolver.findProduct({ productId: '1' });

      expect(getProductUseCase.execute).toHaveBeenCalledWith({
        productId: '1',
      });
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      jest
        .spyOn(createProductUseCase, 'execute')
        .mockResolvedValue(mockProduct);

      const result = await resolver.createProduct({
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });

      expect(createProductUseCase.execute).toHaveBeenCalledWith({
        name: 'Product A',
      });
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      jest
        .spyOn(updateProductUseCase, 'execute')
        .mockResolvedValue(mockProduct);

      const result = await resolver.updateProduct(
        { productId: '1' },
        { name: 'Updated Product' },
      );

      expect(updateProductUseCase.execute).toHaveBeenCalledWith('1', {
        name: 'Updated Product',
      });
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      jest.spyOn(deleteProductUseCase, 'execute').mockResolvedValue(true);

      const result = await resolver.deleteProduct({ productId: '1' });

      expect(deleteProductUseCase.execute).toHaveBeenCalledWith({
        productId: '1',
      });
      expect(result).toBe(true);
    });
  });

  describe('enableProduct', () => {
    it('should enable a product', async () => {
      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      jest
        .spyOn(availableProductUseCase, 'execute')
        .mockResolvedValue(mockProduct);

      const result = await resolver.enableProduct({ productId: '1' });

      expect(availableProductUseCase.execute).toHaveBeenCalledWith({
        productId: '1',
        isActive: true,
      });
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });

  describe('disableProduct', () => {
    it('should disable a product', async () => {
      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      jest
        .spyOn(availableProductUseCase, 'execute')
        .mockResolvedValue(mockProduct);

      const result = await resolver.disableProduct({ productId: '1' });

      expect(availableProductUseCase.execute).toHaveBeenCalledWith({
        productId: '1',
        isActive: false,
      });
      expect(result).toEqual(ProductEntity.fromDomainToEntity(mockProduct));
    });
  });

  describe('images', () => {
    it('should return images of a product', async () => {
      const mockImages = [{ id: '1', url: 'image.jpg' }] as ProductImage[];
      jest.spyOn(imagesByProductLoader, 'load').mockResolvedValue(mockImages);

      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      const result = await resolver.images(
        ProductEntity.fromDomainToEntity(mockProduct),
      );

      expect(imagesByProductLoader.load).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockImages);
    });
  });

  describe('category', () => {
    it('should return the category of a product', async () => {
      const mockCategory = new Category({ id: '1', name: 'Category A' });
      jest.spyOn(categoryLoader, 'load').mockResolvedValue(mockCategory);

      const mockProduct = new Product({
        productId: 'product123',
        name: 'Product A',
        price: 10,
        categoryId: 'category123',
      });
      const result = await resolver.category(
        ProductEntity.fromDomainToEntity(mockProduct),
      );

      expect(categoryLoader.load).toHaveBeenCalledWith('1');
      expect(result).toEqual(CategoryEntity.fromDomainToEntity(mockCategory));
    });
  });
});
