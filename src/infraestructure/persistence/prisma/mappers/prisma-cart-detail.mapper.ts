import { Prisma, CartDetail as PrismaCartDetail } from '@prisma/client';
import { CartDetail } from 'src/domain/cart-detail';

export class PrismaCartDetailMapper {
  static toDomain(entity: PrismaCartDetail): CartDetail {
    return new CartDetail({
      userId: entity.userId,
      productId: entity.productId,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

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
