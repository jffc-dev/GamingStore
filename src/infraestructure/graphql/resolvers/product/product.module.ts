import { Module } from '@nestjs/common';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products.use-case';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products.use-case';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';
import { ProductResolver } from './product.resolver';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product.use-case';
import { UpdateProductUseCase } from 'src/application/use-cases/product/update-product.use-case';
import { DeleteProductUseCase } from 'src/application/use-cases/product/delete-product.use-case';
import { AvailableProductUseCase } from 'src/application/use-cases/product/avilable-product.use-case';
import { GetImagesByProductUseCase } from 'src/application/use-cases/product-image/images-by-product.use-case';
import { ImagesByProductLoader } from './dataloaders/images-by-product.loader';
import { CategoryLoader } from './dataloaders/category.loader';
import { GetCategoryByProductUseCase } from 'src/application/use-cases/category/category-by-product.use-case';

@Module({
  providers: [
    CreateProductUseCase,
    ListProductsUseCase,
    UpdateProductUseCase,
    GetProductUseCase,
    DeleteProductUseCase,
    AvailableProductUseCase,
    GetImagesByProductUseCase,
    GetCategoryByProductUseCase,

    ProductResolver,

    ImagesByProductLoader,
    CategoryLoader,
  ],
  imports: [UuidModule],
})
export class ProductModule {}
