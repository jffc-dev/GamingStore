import { Module } from '@nestjs/common';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products.use-case';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { ProductResolver } from './product.resolver';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product.use-case';
import { UpdateProductUseCase } from 'src/application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from 'src/application/use-cases/product/delete-product.use-case';

@Module({
  providers: [
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    GetProductUseCase,
    DeleteProductUseCase,

    ProductResolver,
  ],
  imports: [UuidModule],
})
export class ProductModule {}
