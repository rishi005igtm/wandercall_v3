import { Injectable, Logger } from '@nestjs/common';
import { CampfireMessageRepository } from '../repositories/campfire-message.repository';
import { CampfireMessageEntity } from '../entities/campfire-message.entity';

@Injectable()
export class CampfireChatService {
  private readonly logger = new Logger(CampfireChatService.name);

  constructor(private readonly messageRepository: CampfireMessageRepository) {}

  async saveMessage(roomId: string, userId: string, userProfile: any, text: string): Promise<CampfireMessageEntity> {
    const displayName = userProfile?.name || userProfile?.displayName || 'Explorer';
    const avatar = userProfile?.avatar || userProfile?.avatarUrl || null;
    const role = userProfile?.role || 'Listener';

    const message = await this.messageRepository.create({
      campfireId: roomId,
      senderId: userId,
      senderName: displayName,
      senderAvatar: avatar,
      senderRole: role,
      text,
    });

    // Prune old messages asynchronously to maintain the 100 limit rolling window
    this.messageRepository.pruneOldMessages(roomId, 100).catch(err => {
      this.logger.error(`Error pruning old campfire messages for room ${roomId}: ${err.message}`);
    });

    return message;
  }

  async getChatHistory(roomId: string): Promise<CampfireMessageEntity[]> {
    return this.messageRepository.findByCampfireId(roomId, 100);
  }
}
