import { Module, forwardRef } from '@nestjs/common';
import { FriendController } from './controllers/friend.controller';
import { FriendService } from './services/friend.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService],
})
export class FriendModule {}
