import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderDetail } from '../../entities/order-detail.entity';
import { SkipThrottle } from '@nestjs/throttler';
import { Product } from '../../entities/product.entity';
import { ProductLoader } from 'src/infraestructure/common/dataloaders/product.loader';

@SkipThrottle()
@UsePipes(
  new ValidationPipe({
    transform: true,
  }),
)
@Resolver(() => OrderDetail)
export class OrderDetailResolver {
  constructor(private readonly productLoader: ProductLoader) {}

  @ResolveField(() => Product)
  async product(@Parent() detail: OrderDetail): Promise<Product> {
    const product = await this.productLoader.load(detail.productId);
    return Product.fromDomainToEntity(product);
  }
}
