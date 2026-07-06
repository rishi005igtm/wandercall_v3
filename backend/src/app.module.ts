import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

// Community Platform
import { CommunityModule } from './modules/community/community.module';
import { CommunityEntity } from './modules/community/entities/community.entity';
import { CommunitySettingsEntity } from './modules/community/entities/community-settings.entity';
import { CommunityCategoryEntity } from './modules/community/entities/community-category.entity';
import { CommunityCoordinateEntity } from './modules/community/entities/community-coordinate.entity';
import { CommunitySavedEntity } from './modules/community/entities/community-saved.entity';
import { CommunityStatisticsEntity } from './modules/community/entities/community-statistics.entity';
import { CommunityMemberEntity } from './modules/community/entities/community-member.entity';
import { CommunityRoleEntity } from './modules/community/entities/community-role.entity';
import { CommunityInviteEntity } from './modules/community/entities/community-invite.entity';
import { CommunityBanEntity } from './modules/community/entities/community-ban.entity';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSsl = process.env.DB_SSL === 'true';
        const options: any = {
          type: 'postgres',
          host: configService.get<string>('database.host', 'localhost'),
          port: configService.get<number>('database.port', 5432),
          username: configService.get<string>('database.username', 'postgres'),
          password: configService.get<string>('database.password', 'anmol162004'),
          database: configService.get<string>('database.name', 'postgres'),
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
            // Community Platform entities
            CommunityEntity,
            CommunitySettingsEntity,
            CommunityCategoryEntity,
            CommunityCoordinateEntity,
            CommunitySavedEntity,
            CommunityStatisticsEntity,
            CommunityMemberEntity,
            CommunityRoleEntity,
            CommunityInviteEntity,
            CommunityBanEntity,
          ],
          synchronize: false, // Handled on startup via DatabaseInitializerService
          autoLoadEntities: true,
        };

        if (isSsl) {
          options.ssl = { rejectUnauthorized: false };
        } else {
          options.ssl = false;
        }

        return options;
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
    CommunityModule,
  ],
  controllers: [],
  providers: [DatabaseInitializerService],
})
export class AppModule {}
