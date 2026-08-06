import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigModule } from './config';
import { DatabaseInitializerService } from './core/providers/database-initializer.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StorageModule } from './modules/storage/storage.module';
import { FeedModule } from './modules/feed/feed.module';
import { UserAuthEntity } from './modules/auth/entities/user-auth.entity';
import { UserSessionEntity } from './modules/auth/entities/user-session.entity';
import { UserProfileEntity } from './modules/user/entities/user-profile.entity';
import { UserSettingsEntity } from './modules/user/entities/user-settings.entity';
import { UserPlanEntity } from './modules/user/entities/user-plan.entity';
import { FollowEntity } from './modules/user/entities/follow.entity';

import { FriendModule } from './modules/friend/friend.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { SearchModule } from './modules/search/search.module';
import { PrivacyRelationEntity } from './modules/privacy/entities/privacy-relation.entity';
import { FavoriteFriendEntity } from './modules/friend/entities/favorite-friend.entity';
import { UserSearchHistoryEntity } from './modules/search/entities/user-search-history.entity';
import { UserRecommendationCacheEntity } from './modules/search/entities/user-recommendation-cache.entity';

// Chat Platform
import { ChatModule } from './modules/chat/chat.module';
import { ConversationEntity } from './modules/chat/entities/conversation.entity';
import { ConversationParticipantEntity } from './modules/chat/entities/conversation-participant.entity';
import { MessageEntity } from './modules/chat/entities/message.entity';
import { RedisModule } from './modules/redis';

import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    RedisModule,
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('database.host');
        const port = configService.get<number>('database.port', 5432);
        const username = configService.get<string>('database.username');
        const password = configService.get<string>('database.password');
        const database = configService.get<string>('database.name');

        // Fail fast: these are required. If missing, the error is clear immediately
        // instead of a cryptic ECONNREFUSED to 127.0.0.1.
        if (!host) throw new Error('DB_HOST is not set. Check your .env file.');
        if (!username) throw new Error('DB_USERNAME is not set. Check your .env file.');
        if (!database) throw new Error('DB_NAME is not set. Check your .env file.');

        const isSsl =
          configService.get<string>('DB_SSL') === 'true' ||
          configService.get<boolean>('database.ssl') === true;
        const options: TypeOrmModuleOptions = {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [
            UserAuthEntity,
            UserSessionEntity,
            UserProfileEntity,
            UserSettingsEntity,
            UserPlanEntity,
            FollowEntity,
            PrivacyRelationEntity,
            FavoriteFriendEntity,
            UserSearchHistoryEntity,
            UserRecommendationCacheEntity,
            // Chat Platform entities
            ConversationEntity,
            ConversationParticipantEntity,
            MessageEntity,
          ],
          synchronize: false, // Handled on startup via DatabaseInitializerService
          autoLoadEntities: true,
          uuidExtension: 'pgcrypto',
        };

        return {
          ...options,
          ssl: isSsl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UserModule,
    StorageModule,
    FeedModule,
    FriendModule,
    PrivacyModule,
    SearchModule,
    ChatModule,
    HealthModule,
  ],
  controllers: [],
  providers: [DatabaseInitializerService],
})
export class AppModule {}
