import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import { Product } from 'src/domain/product';
import { PrismaProductMapper } from '../mappers/prisma-product.mapper';
import { IListProductsUseCaseProps } from 'src/application/use-cases/product/list-products.use-case';
import { Prisma } from '@prisma/client';

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
      this.handleDBError(error);
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
      this.handleDBError(error);
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

  handleDBError(error: Prisma.PrismaClientKnownRequestError): void {
    const { code, meta } = error;
    console.log(error);
    if (code === 'P2025') {
      throw new NotFoundException(`Product not found`);
    } else if (code === 'P2002') {
      throw new NotAcceptableException(
        `${meta.target[0]} had been already registered`,
      );
    } else if (code === 'P2003') {
      throw new NotAcceptableException(`Relation ${meta.field_name} failed`);
    }
    throw new InternalServerErrorException(error);
  }
}
