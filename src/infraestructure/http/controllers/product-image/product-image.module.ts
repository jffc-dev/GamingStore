import { Module } from '@nestjs/common';
import { ProductImageController } from './product-image.controller';
import { GetProductImageUseCase } from 'src/application/use-cases/product-image/get-product-image.use-case';
import { CreateProductImageUseCase } from 'src/application/use-cases/product-image/create-product-image.use-case';
import { FileStorageModule } from 'src/infraestructure/services/file-storage/file-storage.module';
import { UuidModule } from 'src/infraestructure/services/uuid/uuid.module';

@Module({
  providers: [GetProductImageUseCase, CreateProductImageUseCase],
  controllers: [ProductImageController],
  imports: [FileStorageModule, UuidModule],
})
export class ProductImageModule {}
