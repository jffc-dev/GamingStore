import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { ProductImage } from 'src/domain/product-image';
import { PrismaProductImageMapper } from '../mappers/prisma-product-image.mapper';
import { Prisma } from '@prisma/client';
import { ACTION_CREATE, ACTION_FIND } from 'src/application/utils/constants';

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
      this.handleDBError(error, ACTION_FIND);
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
      this.handleDBError(error, ACTION_CREATE);
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

      if (!productImage) return null;

      return PrismaProductImageMapper.toDomain(productImage);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    const { meta = {} } = error;
    meta.action = action;

    throw error;
  }
}
