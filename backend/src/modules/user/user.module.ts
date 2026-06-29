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

@Module({
  imports: [
    AuthModule,
    StorageModule,
    TypeOrmModule.forFeature([UserProfileEntity, UserSettingsEntity, UserPlanEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
