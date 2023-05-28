import { NestFactory } from '@nestjs/core';
import { ChainModule } from './chain.module';

async function bootstrap() {
  const app = await NestFactory.create(ChainModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
