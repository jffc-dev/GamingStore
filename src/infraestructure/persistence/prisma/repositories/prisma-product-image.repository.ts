import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { ProductImage } from 'src/domain/product-image';
import { PrismaProductImageMapper } from '../mappers/prisma-product-image.mapper';

@Injectable()
export class PrismaProductImageRepository implements ProductImageRepository {
  constructor(private prisma: PrismaService) {}

  async getImagesByProductIds(productsId: string[]): Promise<ProductImage[]> {
    try {
      const productImages = await this.prisma.productImage.findMany({
        where: {
          productId: { in: productsId },
        },
      });

      return productImages.map(PrismaProductImageMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async createProductImage(
    productImage: ProductImage,
  ): Promise<ProductImage | null> {
    try {
      const createdProductImage = await this.prisma.productImage.create({
        data: {
          productImageId: productImage.id,
          productId: productImage.productId,
          url: productImage.url,
        },
      });

      return PrismaProductImageMapper.toDomain(createdProductImage);
    } catch (error) {
      this.handleDBError(error);
    }
  }
  async getProductImageById(
    imageId: string,
    productId: string,
  ): Promise<ProductImage | null> {
    try {
      const productImage = await this.prisma.productImage.findUnique({
        where: {
          productImageId: imageId,
          productId: productId,
        },
      });

      return PrismaProductImageMapper.toDomain(productImage);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new NotFoundException(`Product image not found`);
    } else if (code === 'P2002') {
      throw new NotAcceptableException(
        `${meta.target[0]} had been already registered`,
      );
    }
    throw new InternalServerErrorException(error);
  }
}
