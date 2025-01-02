import { Module } from '@nestjs/common';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { NotificationsModule } from './infraestructure/notifications/notifications.module';
import { GraphqlModule } from './infraestructure/graphql/graphql.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    HttpModule,
    GraphqlModule,
    NotificationsModule,
  ],
})
export class AppModule {
  constructor() {}
}
