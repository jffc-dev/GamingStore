import { Module } from '@nestjs/common';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';
import { NotificationsModule } from './infraestructure/notifications/notifications.module';
import { UuidModule } from './infraestructure/services/uuid/uuid.module';
import { BcryptModule } from './infraestructure/services/bcrypt/bcrypt.module';
import { GraphqlModule } from './infraestructure/graphql/graphql.module';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    HttpModule,
    NotificationsModule,
    UuidModule,
    BcryptModule,
    GraphqlModule,
  ],
})
export class AppModule {
  constructor() {}
}
