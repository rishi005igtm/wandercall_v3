import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './services/friend.service';
import { FavoriteFriendEntity } from './entities/favorite-friend.entity';
import { FavoriteFriendRepository } from './repositories/favorite-friend.repository';
import { FavoriteFriendService } from './services/favorite-friend.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriteFriendEntity]),
    forwardRef(() => UserModule),
  ],
  controllers: [FriendController],
  providers: [FriendService, FavoriteFriendRepository, FavoriteFriendService],
  exports: [FriendService, FavoriteFriendService],
})
export class FriendModule {}
