import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './controllers/search.controller';
import { UserSearchService } from './services/user-search.service';
import { SocialDiscoveryService } from './services/social-discovery.service';
import { UserSearchHistoryEntity } from './entities/user-search-history.entity';
import { UserRecommendationCacheEntity } from './entities/user-recommendation-cache.entity';
import { UserInterestEntity } from '../feed/entities/user-interest.entity';
import { UserModule } from '../user/user.module';
import { PrivacyModule } from '../privacy/privacy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserSearchHistoryEntity,
      UserRecommendationCacheEntity,
      UserInterestEntity,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => PrivacyModule),
  ],
  controllers: [SearchController],
  providers: [UserSearchService, SocialDiscoveryService],
  exports: [UserSearchService, SocialDiscoveryService],
})
export class SearchModule {}
