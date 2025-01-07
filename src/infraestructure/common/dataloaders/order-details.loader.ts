import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { GetOrderDetailsUseCase } from 'src/application/use-cases/order/get-order-details.use-case';
import { OrderDetail } from 'src/infraestructure/graphql/entities/order-detail.entity';

@Injectable()
export class OrderDetailsLoader extends DataLoader<string, OrderDetail[]> {
  constructor(private readonly getOrderDetailsUseCase: GetOrderDetailsUseCase) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(orderIds: string[]) {
    const details = await this.getOrderDetailsUseCase.execute({ orderIds });

    const mappedDetails = this.mapResults(orderIds, details);

    return mappedDetails;
  }

  mapResults(orderIds, details: OrderDetail[]): OrderDetail[][] {
    const detailsMap: OrderDetail[] = orderIds.reduce(
      (acc, orderId) => {
        acc[orderId] = [];
        return acc;
      },
      {} as Record<string, OrderDetail[]>,
    );

    details.forEach((order: OrderDetail) => {
      const detail: OrderDetail = {
        id: order.id,
        orderId: order.orderId,
        productId: order.productId,
        quantity: order.quantity,
        subtotal: order.subtotal,
        unitPrice: order.unitPrice,
      };
      detailsMap[order.orderId].push(detail);
    });

    return orderIds.map((orderId) => detailsMap[orderId]);
  }
}
