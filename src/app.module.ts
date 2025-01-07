import { Module } from '@nestjs/common';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { NotificationsModule } from './infraestructure/notifications/notifications.module';
import { GraphqlModule } from './infraestructure/graphql/graphql.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    EventEmitterModule.forRoot(),
    HttpModule,
    GraphqlModule,
    NotificationsModule,
  ],
})
export class AppModule {
  constructor() {}
}
