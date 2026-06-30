import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { StorageModule } from '../storage/storage.module';
import { FeedController } from './controllers/feed.controller';
import { PostService } from './services/post.service';
import { RankingEngine } from './services/ranking.engine';
import { InterestEngine } from './services/interest.engine';
import { RecommendationEngine } from './services/recommendation.engine';
import { PostRepository } from './repositories/post.repository';
import { InteractionRepository } from './repositories/interaction.repository';
import { FeedEventDispatcher } from './events/feed-event.dispatcher';

// Entities
import { PostEntity } from './entities/post.entity';
import { PostLikeEntity } from './entities/post-like.entity';
import { PostSaveEntity } from './entities/post-save.entity';
import { PostCommentEntity } from './entities/post-comment.entity';
import { UserInterestEntity } from './entities/user-interest.entity';
import { UserInteractionEntity } from './entities/user-interaction.entity';
import { FeedImpressionEntity } from './entities/feed-impression.entity';

@Module({
  imports: [
    AuthModule,
    UserModule,
    StorageModule,
    TypeOrmModule.forFeature([
      PostEntity,
      PostLikeEntity,
      PostSaveEntity,
      PostCommentEntity,
      UserInterestEntity,
      UserInteractionEntity,
      FeedImpressionEntity,
    ]),
  ],
  controllers: [FeedController],
  providers: [
    PostService,
    RankingEngine,
    InterestEngine,
    RecommendationEngine,
    PostRepository,
    InteractionRepository,
    FeedEventDispatcher,
  ],
  exports: [
    PostService,
    RankingEngine,
    InterestEngine,
    RecommendationEngine,
    PostRepository,
    InteractionRepository,
    FeedEventDispatcher,
  ],
})
export class FeedModule {}
