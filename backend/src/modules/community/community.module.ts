import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { SearchModule } from '../search/search.module';
import { PostEntity } from '../feed/entities/post.entity';
import { CommunityEntity } from './entities/community.entity';
import { CommunitySettingsEntity } from './entities/community-settings.entity';
import { CommunityCategoryEntity } from './entities/community-category.entity';
import { CommunityCoordinateEntity } from './entities/community-coordinate.entity';
import { CommunitySavedEntity } from './entities/community-saved.entity';
import { CommunityStatisticsEntity } from './entities/community-statistics.entity';
import { CommunityMemberEntity } from './entities/community-member.entity';
import { CommunityRoleEntity } from './entities/community-role.entity';
import { CommunityInviteEntity } from './entities/community-invite.entity';
import { CommunityBanEntity } from './entities/community-ban.entity';
import { CommunityAuditLogEntity } from './entities/community-audit-log.entity';

import { CommunityRepository } from './repositories/community.repository';
import { CommunitySettingsRepository } from './repositories/community-settings.repository';
import { CommunityCategoryRepository } from './repositories/community-category.repository';
import { CommunityCoordinateRepository } from './repositories/community-coordinate.repository';
import { CommunitySavedRepository } from './repositories/community-saved.repository';
import { CommunityStatisticsRepository } from './repositories/community-statistics.repository';
import { CommunityMemberRepository } from './repositories/community-member.repository';
import { CommunityRoleRepository } from './repositories/community-role.repository';
import { CommunityBanRepository } from './repositories/community-ban.repository';
import { CommunityInviteRepository } from './repositories/community-invite.repository';
import { CommunityAuditLogRepository } from './repositories/community-audit-log.repository';

import { CommunityEventDispatcher } from './events/community-event.dispatcher';
import { CommunityService } from './services/community.service';
import { CommunityMembershipService } from './services/community-membership.service';
import { CommunityInviteService } from './services/community-invite.service';
import { CommunityDiscoveryService } from './services/community-discovery.service';
import { CommunityPermissionService } from './services/community-permission.service';
import { CommunityAuditService } from './services/community-audit.service';
import { CommunityRoleService } from './services/community-role.service';
import { CommunityModerationService } from './services/community-moderation.service';
import { CommunityStoryService } from './services/community-story.service';
import { CommunityStatisticsService } from './services/community-statistics.service';

import { CommunityController } from './controllers/community.controller';
import { CommunityDiscoveryController } from './controllers/community-discovery.controller';
import { CommunityMembershipController } from './controllers/community-membership.controller';

import { CommunityPresenceTracker } from './services/community-presence.tracker';
import { CommunityRoleSeederService } from './services/community-role-seeder.service';

import { RedisModule } from '../redis/redis.module';
import { CommunityRedisPresenceService } from './services/community-redis-presence.service';
import { CommunityRankingEngine } from './services/community-ranking.engine';

import { CommunityStatisticsSubscriber } from './subscribers/community-statistics.subscriber';
import { CommunitySearchSubscriber } from './subscribers/community-search.subscriber';
import { CommunityGalaxySubscriber } from './subscribers/community-galaxy.subscriber';

@Module({
  imports: [
    UserModule,
    forwardRef(() => ChatModule),
    SearchModule,
    RedisModule,
    TypeOrmModule.forFeature([
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
      CommunityAuditLogEntity,
      PostEntity,
    ]),
  ],
  controllers: [
    CommunityController,
    CommunityDiscoveryController,
    CommunityMembershipController,
  ],
  providers: [
    CommunityRepository,
    CommunitySettingsRepository,
    CommunityCategoryRepository,
    CommunityCoordinateRepository,
    CommunitySavedRepository,
    CommunityStatisticsRepository,
    CommunityMemberRepository,
    CommunityRoleRepository,
    CommunityBanRepository,
    CommunityInviteRepository,
    CommunityAuditLogRepository,
    CommunityEventDispatcher,
    CommunityService,
    CommunityMembershipService,
    CommunityInviteService,
    CommunityDiscoveryService,
    CommunityPermissionService,
    CommunityAuditService,
    CommunityRoleService,
    CommunityModerationService,
    CommunityStoryService,
    CommunityStatisticsService,
    CommunityPresenceTracker,
    CommunityRoleSeederService,
    CommunityRedisPresenceService,
    CommunityRankingEngine,
    CommunityStatisticsSubscriber,
    CommunitySearchSubscriber,
    CommunityGalaxySubscriber,
  ],
  exports: [
    CommunityRepository,
    CommunitySettingsRepository,
    CommunityCategoryRepository,
    CommunityCoordinateRepository,
    CommunitySavedRepository,
    CommunityStatisticsRepository,
    CommunityMemberRepository,
    CommunityRoleRepository,
    CommunityBanRepository,
    CommunityInviteRepository,
    CommunityAuditLogRepository,
    CommunityEventDispatcher,
    CommunityService,
    CommunityMembershipService,
    CommunityInviteService,
    CommunityDiscoveryService,
    CommunityPermissionService,
    CommunityAuditService,
    CommunityRoleService,
    CommunityModerationService,
    CommunityStoryService,
    CommunityStatisticsService,
    CommunityPresenceTracker,
    CommunityRoleSeederService,
    CommunityRedisPresenceService,
    CommunityRankingEngine,
  ],
})
export class CommunityModule {}
