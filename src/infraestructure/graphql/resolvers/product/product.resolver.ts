import { Query, Resolver } from '@nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products';

@Resolver()
export class ProductResolver {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Query(() => [Product], { name: 'todos' })
  async findAll(): Promise<[Product]> {
    return await this.listProductsUseCase.execute({});
  }
}
