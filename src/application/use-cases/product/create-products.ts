import { Injectable } from '@nestjs/common';
import { CreateProductDto } from 'src/infraestructure/graphql/dto/product/create-product.dto';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute({
    name,
    description,
    stock,
    isActive,
    price,
  }: CreateProductDto): Promise<any> {
    const product = new Product({
      productId: this.uuidService.generateUuid(),
      name,
      description,
      stock,
      isActive,
      price,
    });

    const productResponse = await this.productRepository.create(product);

    return productResponse;
  }
}
