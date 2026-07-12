import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampfireEntity } from './entities/campfire.entity';
import { CampfireMessageEntity } from './entities/campfire-message.entity';
import { CampfireRepository } from './repositories/campfire.repository';
import { CampfireMessageRepository } from './repositories/campfire-message.repository';
import { CampfireEventDispatcher } from './events/campfire-event.dispatcher';
import { CampfireService } from './services/campfire.service';
import { CampfirePresenceService } from './services/campfire-presence.service';
import { CampfireChatService } from './services/campfire-chat.service';
import { CampfireController } from './controllers/campfire.controller';
import { CampfireGateway } from './gateways/campfire.gateway';
import { LivekitService } from './services/livekit.service';
import { LiveSessionEntity } from './entities/live-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CampfireEntity, CampfireMessageEntity, LiveSessionEntity]),
  ],
  controllers: [CampfireController],
  providers: [
    CampfireRepository,
    CampfireMessageRepository,
    CampfireEventDispatcher,
    CampfireService,
    CampfirePresenceService,
    CampfireChatService,
    LivekitService,
    CampfireGateway,
  ],
  exports: [CampfireService, CampfirePresenceService, LivekitService],
})
export class CampfireModule {}
