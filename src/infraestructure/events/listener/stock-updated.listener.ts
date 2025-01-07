import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StockUpdatedEvent } from '../input/stock-updated.event';
import { GetProductsByIdsUseCase } from 'src/application/use-cases/product/get-products-by-ids.use-case';
import { EnvService } from 'src/infraestructure/env/env.service';
import { NotifyLastLikerOnLowStockUseCase } from 'src/application/use-cases/user/notify-last-liker-on-low-stock.use-case';

@Injectable()
export class StockUpdatedListener {
  constructor(
    private readonly getProductsByIdsUseCase: GetProductsByIdsUseCase,
    private readonly envService: EnvService,
    private readonly notifyLastLikerOnLowStockUseCase: NotifyLastLikerOnLowStockUseCase,
  ) {}

  @OnEvent('stock.updated')
  async handleOrderCreatedEvent(event: StockUpdatedEvent) {
    const productStockAlertThreshold: number = this.envService.get(
      'PRODUCT_STOCK_ALERT_THRESHOLD',
    );
    const products = await this.getProductsByIdsUseCase.execute({
      productIds: event.productIds,
    });

    for (const product of products) {
      if (product.stock <= productStockAlertThreshold) {
        this.notifyLastLikerOnLowStockUseCase.execute({
          product,
        });
      }
    }
  }
}
