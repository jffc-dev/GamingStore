import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { CreateProductInput } from 'src/infraestructure/graphql/dto/product/inputs/create-product.input';

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
  }: CreateProductInput): Promise<any> {
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
