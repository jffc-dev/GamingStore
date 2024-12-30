import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
// import { UnifiedExceptionFilter } from './infraestructure/common/filter/exception.filter';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  await app.listen(port);
  logger.log(`App running on port: ${port}`);
}
bootstrap();
