import { Prisma, CartDetail as PrismaCartDetail } from '@prisma/client';
import { CartDetail } from 'src/domain/cart-detail';

export class PrismaCartDetailMapper {
  // Mapea de Prisma a dominio
  static toDomain(entity: PrismaCartDetail): CartDetail {
    return new CartDetail({
      userId: entity.userId,
      productId: entity.productId,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  // Mapea de dominio a Prisma
  static toPrisma(
    cartDetail: CartDetail,
  ): Prisma.CartDetailUncheckedCreateInput {
    return {
      userId: cartDetail.userId,
      productId: cartDetail.productId,
      quantity: cartDetail.quantity,
      createdAt: cartDetail.createdAt,
      updatedAt: cartDetail.updatedAt,
    };
  }
}
