import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { UpdateProductInput } from 'src/infraestructure/graphql/dto/product/inputs/update-product.input';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute(
    productId: string,
    updateProductDto: UpdateProductInput,
  ): Promise<any> {
    const getResponse = await this.productRepository.getProductById(productId);

    if (!getResponse) {
      throw new NotFoundException('Product not found');
    }

    const product = new Product({
      categoryId: getResponse.categoryId,
      name: getResponse.name,
      price: getResponse.price,
      ...updateProductDto,
    });

    const productResponse = await this.productRepository.updateProduct(
      productId,
      product,
    );

    return productResponse;
  }
}
