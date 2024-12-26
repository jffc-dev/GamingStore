import { Args, Query, Resolver } from '@nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product';

@Resolver()
export class ProductResolver {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
  ) {}

  @Query(() => [Product], { name: 'products' })
  async findAll(): Promise<Product[]> {
    const products = await this.listProductsUseCase.execute({});
    return products.map(Product.fromDomainToEntity);
  }

  @Query(() => [Product], { name: 'product' })
  async findProduct(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Product> {
    const product = await this.getProductUseCase.execute({ productId: id });
    console.log(product.productId);
    return Product.fromDomainToEntity(product);
  }
}
