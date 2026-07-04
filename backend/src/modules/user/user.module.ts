import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserSettingsEntity } from './entities/user-settings.entity';
import { UserPlanEntity } from './entities/user-plan.entity';
import { FollowEntity } from './entities/follow.entity';
import { FollowRepository } from './repositories/follow.repository';
import { FollowService } from './services/follow.service';
import { RelationshipService } from './services/relationship.service';

@Module({
  imports: [
    AuthModule,
    StorageModule,
    TypeOrmModule.forFeature([UserProfileEntity, UserSettingsEntity, UserPlanEntity, FollowEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, FollowRepository, FollowService, RelationshipService],
  exports: [UserService, UserRepository, FollowRepository, FollowService, RelationshipService],
})
export class UserModule {}
