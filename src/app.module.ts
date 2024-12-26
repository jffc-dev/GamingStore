import { Module } from '@nestjs/common';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { NotificationsModule } from './infraestructure/notifications/notifications.module';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    HttpModule,
    NotificationsModule,
  ],
})
export class AppModule {
  constructor() {}
}
