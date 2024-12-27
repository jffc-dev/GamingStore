import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartDetailRepository } from 'src/application/contracts/persistence/cart.repository';
import { CartDetail } from 'src/domain/cart-detail';
import { PrismaCartDetailMapper } from '../mappers/prisma-cart-detail.mapper';

@Injectable()
export class PrismaCartDetailRepository implements CartDetailRepository {
  constructor(private prisma: PrismaService) {}

  async addToCart(data: CartDetail): Promise<CartDetail> {
    const prismaData = PrismaCartDetailMapper.toPrisma(data);

    try {
      const createdCartDetail = await this.prisma.cartDetail.create({
        data: prismaData,
      });

      return PrismaCartDetailMapper.toDomain(createdCartDetail);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getCartDetailsByUser(userId: string): Promise<CartDetail[]> {
    try {
      const cartDetails = await this.prisma.cartDetail.findMany({
        where: {
          userId,
        },
      });

      return cartDetails.map(PrismaCartDetailMapper.toDomain);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  handleDBError(error: any): void {
    const { code, meta } = error;

    if (code === 'P2025') {
      throw new Error(`Product not found`);
    } else if (code === 'P2002') {
      throw new Error(`${meta.target[0]} had been already registered`);
    }

    throw new Error(`Internal server error`);
  }
}
