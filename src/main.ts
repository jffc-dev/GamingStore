import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { UnifiedExceptionFilter } from './infraestructure/common/filter/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new UnifiedExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
