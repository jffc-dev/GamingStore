import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { GetImagesByProductUseCase } from 'src/application/use-cases/product-image/images-by-product.use-case';
import { ProductImage } from 'src/infraestructure/graphql/entities/product-image.entity';

@Injectable()
export class ImagesByProductLoader extends DataLoader<string, ProductImage[]> {
  constructor(
    private readonly getImagesByProductUseCase: GetImagesByProductUseCase,
  ) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(productIds: string[]) {
    const images = await this.getImagesByProductUseCase.execute({ productIds });

    const mappedImages = this.mapResults(productIds, images);

    return mappedImages;
  }

  mapResults(productIds, images: ProductImage[]): ProductImage[][] {
    const imagesMap = productIds.reduce(
      (acc, productId) => {
        acc[productId] = [];
        return acc;
      },
      {} as Record<string, ProductImage[]>,
    );

    images.forEach((image) => {
      imagesMap[image.productId].push({
        id: image.id,
        url: image.url,
        createdAt: image.createdAt,
        productId: '',
        dato: '',
      });
    });

    return productIds.map((productId) => imagesMap[productId]);
  }
}
