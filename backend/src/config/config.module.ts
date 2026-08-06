import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { aiConfig } from './ai/ai.config';
import { analyticsConfig } from './analytics/analytics.config';
import { appConfig } from './app/app.config';
import { cacheConfig } from './cache/cache.config';
import { databaseConfig } from './database/database.config';
import { validate } from './env.validation';
import { jwtConfig } from './jwt/jwt.config';
import { kafkaConfig } from './kafka/kafka.config';
import { mailConfig } from './mail/mail.config';
import { notificationConfig } from './notification/notification.config';
import { paymentConfig } from './payment/payment.config';
import { redisConfig } from './redis/redis.config';
import { searchConfig } from './search/search.config';
import { securityConfig } from './security/security.config';
import { socketConfig } from './socket/socket.config';
import { storageConfig } from './storage/storage.config';
import { voiceConfig } from './voice/voice.config';
import campfireConfig from './campfire/campfire.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      // Never set ignoreEnvFile based on NODE_ENV.
      // In Docker/K8s, Docker Compose / Kubernetes already injects all variables
      // into process.env before Node starts — NestJS ConfigModule reads process.env
      // regardless. Setting ignoreEnvFile=true only prevents reading the .env FILE,
      // but Docker Compose's env_file directive already did that job.
      // Leaving this as false means: in local dev, .env is read from disk.
      // In Docker prod, .env is not present in the image (excluded by .dockerignore),
      // so ConfigModule simply finds no file and moves on — no harm done.
      ignoreEnvFile: false,
      envFilePath: ['.env.local', '.env'],
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        kafkaConfig,
        jwtConfig,
        paymentConfig,
        storageConfig,
        cacheConfig,
        searchConfig,
        aiConfig,
        mailConfig,
        notificationConfig,
        voiceConfig,
        securityConfig,
        socketConfig,
        analyticsConfig,
        campfireConfig,
      ],
      validate,
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
