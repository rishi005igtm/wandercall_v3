import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dns from 'dns';
import { AppModule } from './app.module';

// FIX for Node 18+ Docker IPv6 resolution ETIMEDOUT bugs
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configure Global CORS Policy
  const corsOrigins = configService.get<string[]>('app.corsOrigins', [
    'http://localhost:3000',
    'http://localhost:5173',
  ]);

  app.enableCors({
    origin:
      corsOrigins.length > 0 && corsOrigins[0] !== '' ? corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    credentials: true,
  });

  // Global API Routing Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(apiPrefix, {
    // Health check must be reachable at /api/v1/health — do NOT exclude it
  });

  // Global Validation Pipe for DTO Class Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Enable graceful shutdown hooks for container management (ECS/K8s)
  // Handles SIGTERM/SIGINT so in-flight requests complete before exit
  app.enableShutdownHooks();

  const port = configService.get<number>('app.port', 5000);
  await app.listen(port, '0.0.0.0'); // Bind to all interfaces, required in containers
}
bootstrap();
