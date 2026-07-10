import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampfireEntity } from './entities/campfire.entity';
import { CampfireRepository } from './repositories/campfire.repository';
import { CampfireCacheService } from './services/campfire-cache.service';
import { CampfirePolicyService } from './services/campfire-policy.service';
import { CampfireService } from './services/campfire.service';
import { CampfireController } from './controllers/campfire.controller';
import { CampfireEventDispatcher } from './events/campfire-event.dispatcher';

// Discovery
import { CampfireDiscoveryRepository } from './repositories/campfire-discovery.repository';
import { CampfireRankingService } from './services/campfire-ranking.service';
import { CampfireRecommendationService } from './services/campfire-recommendation.service';
import { CampfireDiscoveryCacheService } from './services/campfire-discovery-cache.service';
import { CampfireDiscoveryService } from './services/campfire-discovery.service';
import { CampfireDiscoveryController } from './controllers/campfire-discovery.controller';
import { CampfireDiscoverySubscriber } from './events/campfire-discovery.subscriber';
import { CampfireGateway } from './gateways/campfire.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([CampfireEntity]),
  ],
  controllers: [
    CampfireDiscoveryController,
    CampfireController,
  ],
  providers: [
    CampfireEventDispatcher,
    CampfireRepository,
    CampfireCacheService,
    CampfirePolicyService,
    CampfireService,
    
    // Discovery
    CampfireDiscoveryRepository,
    CampfireRankingService,
    CampfireRecommendationService,
    CampfireDiscoveryCacheService,
    CampfireDiscoveryService,
    CampfireDiscoverySubscriber,
    CampfireGateway,
  ],
  exports: [CampfireService, CampfireDiscoveryService, CampfireGateway],
})
export class CampfireModule {}
