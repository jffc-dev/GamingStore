import { Injectable } from '@nestjs/common';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';
import {
  PRODUCT_LOW_STOCK,
  PRODUCT_LOW_STOCK_SUBJECT,
} from 'src/application/utils/constants';
import { Product } from 'src/domain/product';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';

interface INotifyLastLikerOnLowStockUseCase {
  product: Product;
}
@Injectable()
export class NotifyLastLikerOnLowStockUseCase {
  constructor(
    private readonly likeProductRepository: LikeProductRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({
    product,
  }: INotifyLastLikerOnLowStockUseCase): Promise<boolean> {
    const userToNotify =
      await this.likeProductRepository.findLastUserWhoLikedProductAndDidNotPurchase(
        product.productId,
      );

    const emailBodyTemplate = PRODUCT_LOW_STOCK;
    let emailBody = emailBodyTemplate;
    emailBody = emailBody.replace('{{product_name}}', product.name);
    emailBody = emailBody.replace(
      '{{current_stock}}',
      product.stock.toString(),
    );

    this.notificationsService.sendEmail({
      body: emailBody,
      subject: PRODUCT_LOW_STOCK_SUBJECT,
      to: userToNotify.email,
    });

    return true;
  }
}
