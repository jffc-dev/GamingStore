import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
