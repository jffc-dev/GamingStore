import { Module } from '@nestjs/common';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { ProductResolver } from './product.resolver';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product';

@Module({
  providers: [
    CreateProductUseCase,
    ListProductsUseCase,
    ProductResolver,
    GetProductUseCase,
  ],
  imports: [UuidModule],
})
export class ProductModule {}
