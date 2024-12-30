import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const port = process.env.PORT ?? 3000;
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });
  console.log(process.env.CORS_ORIGINS?.split(','));
  app.use(helmet());
  app.enableCors({
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(port);

  const logger = new Logger();
  logger.log(`App running on port: ${port}`);
}
bootstrap();
