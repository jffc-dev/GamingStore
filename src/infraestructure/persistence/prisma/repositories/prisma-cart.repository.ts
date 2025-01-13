import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { CartDetail } from 'src/domain/cart-detail';
import { PrismaCartDetailMapper } from '../mappers/prisma-cart-detail.mapper';
import { Prisma } from '@prisma/client';
import { PrismaClientManager } from '../prisma-client-manager';

@Injectable()
export class PrismaCartDetailRepository implements CartDetailRepository {
  constructor(
    private prisma: PrismaService,
    private clientManager: PrismaClientManager,
  ) {}

  async cleanCartDetailsByUser(userId: string): Promise<boolean> {
    const prismaTx = this.clientManager.getClient();
    const deleteCart = await prismaTx.cartDetail.deleteMany({
      where: {
        userId,
      },
    });
    return !!deleteCart;
  }

  async addToCart(data: CartDetail): Promise<CartDetail> {
    const prismaData = PrismaCartDetailMapper.toPrisma(data);

    try {
      const createdCartDetail = await this.prisma.cartDetail.upsert({
        where: {
          userId_productId: {
            productId: prismaData.productId,
            userId: prismaData.userId,
          },
        },
        create: prismaData,
        update: prismaData,
      });

      return PrismaCartDetailMapper.toDomain(createdCartDetail);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getCartDetailsByUser(userId: string): Promise<CartDetail[]> {
    try {
      const prismaTx = this.clientManager.getClient();
      const cartDetails = await prismaTx.cartDetail.findMany({
        where: {
          userId,
        },
      });

      return cartDetails.map(PrismaCartDetailMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
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
