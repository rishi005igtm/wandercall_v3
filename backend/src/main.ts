import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API Routing Prefix
  app.setGlobalPrefix('api/v1');

  // Enable graceful shutdown hooks for container management (ECS/K8s)
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();

