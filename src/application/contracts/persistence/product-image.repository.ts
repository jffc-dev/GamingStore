import { ProductImage } from 'src/domain/product-image';

export abstract class ProductImageRepository {
  abstract getProductImageById(
    imageId: string,
    productId: string,
  ): Promise<ProductImage | null>;
  abstract createProductImage(
    productImage: ProductImage,
  ): Promise<ProductImage | null>;
  abstract getImagesByProductIds(productsId: string[]): Promise<ProductImage[]>;

  abstract handleDBError(error: any): void;
}
