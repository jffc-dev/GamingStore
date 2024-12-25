import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from './infraestructure/http/http.module';
import { PersistenceModule } from './infraestructure/persistence/persistence.module';

@Module({
  imports: [
    PersistenceModule.register({
      global: true,
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {}
}
