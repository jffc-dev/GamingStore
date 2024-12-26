import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { Product } from 'src/domain/product';
import { UpdateProductDto } from 'src/infraestructure/graphql/dto/product/update-product.dto';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly uuidService: UuidService,
  ) {}

  async execute(
    productId: string,
    updateProductDto: UpdateProductDto,
  ): Promise<any> {
    //TODO: improve update dto
    const product = new Product({
      ...updateProductDto,
    } as any);

    const productResponse = await this.productRepository.updateProduct(
      productId,
      product,
    );

    return productResponse;
  }
}
