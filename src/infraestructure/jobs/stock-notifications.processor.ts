import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { StockNotificationDto } from './dto/stock-notifications.dto';
import { LikeProductRepository } from 'src/application/contracts/persistence/like.repository';

@Injectable()
@Processor('stock-notifications')
export class StockNotificationsProcessor {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly likeProductRepository: LikeProductRepository,
  ) {}

  @Process('check-stock')
  async handleStockNotification(job: Job<StockNotificationDto>) {
    console.log('aaaaaaaaaaaaaa');
    const { productId, stock } = job.data;

    const lastLikeUser =
      this.likeProductRepository.findLastUserWhoLikedButNotPurchased(productId);

    if (!lastLikeUser) {
      return;
    }

    await this.notificationsService.sendEmail({
      to: lastLikeUser[0].email,
      body: `
        <p>Hello, ${stock}</p>
      `,
      subject: 'Low stock notification',
    });
  }
}
