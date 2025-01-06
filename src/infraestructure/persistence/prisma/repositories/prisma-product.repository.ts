import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { PrismaProductMapper } from '../mappers/prisma-product.mapper';
import { IListProductsUseCaseProps } from 'src/application/use-cases/product/list-products.use-case';
import { Prisma } from '@prisma/client';
import {
  ACTION_CREATE,
  ACTION_FIND,
  ACTION_UPDATE,
} from 'src/application/utils/constants';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaService) {}

  async filterProducts(dto: IListProductsUseCaseProps): Promise<Product[]> {
    try {
      const { first, after, isActive, categoryId } = dto;
      const filters = { isActive, categoryId };
      const take = first;
      const cursor = after ? { productId: after } : undefined;

      const products = await this.prisma.product.findMany({
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor,
        where: {
          isDeleted: false,
          ...filters,
        },
      });

      return products.map(PrismaProductMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async create(product: Product): Promise<Product> {
    const data = PrismaProductMapper.toPrisma(product);

    try {
      const createdProduct = await this.prisma.product.create({
        data,
      });

      return PrismaProductMapper.toDomain(createdProduct);
    } catch (error) {
      this.handleDBError(error, ACTION_CREATE);
    }
  }

  async listProducts(): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          isDeleted: false,
        },
      });

      return products.map(PrismaProductMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async softDeleteProductById(productId: string): Promise<boolean> {
    try {
      await this.prisma.product.update({
        where: {
          productId,
        },
        data: {
          isDeleted: true,
        },
      });

      return true;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async updateProduct(productId: string, data: Product): Promise<Product> {
    try {
      const dataToUpdate = PrismaProductMapper.toPrisma(data);
      const updatedProduct = await this.prisma.product.update({
        where: {
          productId,
        },
        data: dataToUpdate,
      });

      return PrismaProductMapper.toDomain(updatedProduct);
    } catch (error) {
      this.handleDBError(error, ACTION_UPDATE);
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          productId,
        },
      });

      if (!product) return null;

      return PrismaProductMapper.toDomain(product);
    } catch (error) {
      this.handleDBError(error);
      return null;
    }
  }

  async getProductByIdOrThrow(productId: string): Promise<Product> {
    try {
      const product = await this.prisma.product.findUniqueOrThrow({
        where: {
          productId,
        },
      });

      return PrismaProductMapper.toDomain(product);
    } catch (error) {
      this.handleDBError(error, ACTION_FIND);
    }
  }

  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          productId: { in: productIds },
        },
      });

      return products.map(PrismaProductMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
      return null;
    }
  }

  handleDBError(
    error: Prisma.PrismaClientKnownRequestError,
    action?: string,
  ): void {
    console.log(11111, error);
    const { code, meta = {} } = error;
    meta.action = action;

    if (code === 'P2025') {
      throw error;
    } else if (code === 'P2003') {
      if (meta.field_name === 'product_category_id_fkey (index)')
        meta.field_name = 'category';
      else meta.field_name = 'unknown';

      throw error;
    }

    if (
      error.message.includes('violates check constraint') &&
      error.message.includes('check_stock')
    ) {
      error.code = 'CUSTOM-001';
      error.meta.custom_message = 'Invalid stock';
    }

    throw error;
  }
}
