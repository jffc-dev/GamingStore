import { Module } from '@nestjs/common';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    HttpModule,
  ],
})
export class AppModule {
  constructor() {}
}
