import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { SearchModule } from '../search/search.module';
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

import { CommunityEventDispatcher } from './events/community-event.dispatcher';
import { CommunityService } from './services/community.service';
import { CommunityMembershipService } from './services/community-membership.service';
import { CommunityInviteService } from './services/community-invite.service';
import { CommunityDiscoveryService } from './services/community-discovery.service';

import { CommunityController } from './controllers/community.controller';
import { CommunityDiscoveryController } from './controllers/community-discovery.controller';
import { CommunityMembershipController } from './controllers/community-membership.controller';

import { CommunityPresenceTracker } from './services/community-presence.tracker';

@Module({
  imports: [
    UserModule,
    ChatModule,
    SearchModule,
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
    CommunityEventDispatcher,
    CommunityService,
    CommunityMembershipService,
    CommunityInviteService,
    CommunityDiscoveryService,
    CommunityPresenceTracker,
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
    CommunityEventDispatcher,
    CommunityService,
    CommunityMembershipService,
    CommunityInviteService,
    CommunityDiscoveryService,
    CommunityPresenceTracker,
  ],
})
export class CommunityModule {}
