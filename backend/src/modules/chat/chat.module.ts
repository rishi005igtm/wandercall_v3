import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationParticipantEntity } from './entities/conversation-participant.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationMemberStateEntity } from './entities/conversation-member-state.entity';

// Repositories
import { MessageRepository } from './repositories/message.repository';
import { ConversationRepository } from './repositories/conversation.repository';

// Services
import { ChatService } from './services/chat.service';
import { PresenceService } from './services/presence.service';
import { ChatEventDispatcher } from './services/chat-event.dispatcher';
import { MessageService } from './services/message.service';
import { ConversationService } from './services/conversation.service';

// Gateway
import { ChatGateway } from './chat.gateway';

// Controller
import { ChatController } from './controllers/chat.controller';

import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PrivacyModule } from '../privacy/privacy.module';
import { RedisModule } from '../redis/redis.module';
import { FriendModule } from '../friend/friend.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConversationEntity,
      ConversationParticipantEntity,
      MessageEntity,
      ConversationMemberStateEntity,
    ]),
    AuthModule,
    UserModule,
    PrivacyModule,
    RedisModule, // Added RedisModule
    forwardRef(() => FriendModule),
    // JwtModule for socket authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'jwt.secret',
          'wandercall_jwt_secret_key_2026',
        ),
        signOptions: {
          expiresIn: configService.get<number>('jwt.expiresIn', 3600),
        },
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [
    // Repositories
    MessageRepository,
    ConversationRepository,

    // Services
    ChatService,
    PresenceService,
    ChatEventDispatcher,
    MessageService,
    ConversationService,

    // Socket Gateway
    ChatGateway,
  ],
  exports: [
    ChatService,
    PresenceService,
    ChatEventDispatcher,
    ChatGateway,
    MessageService,
    ConversationRepository,
  ],
})
export class ChatModule {}
