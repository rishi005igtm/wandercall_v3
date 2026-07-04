import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrivacyRepository } from '../repositories/privacy.repository';
import { PrivacyRelationEntity } from '../entities/privacy-relation.entity';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class PrivacyService {
  constructor(
    private readonly privacyRepository: PrivacyRepository,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository?: UserRepository,
  ) {}

  private async resolveTargetUserId(targetIdOrUsername: string): Promise<string> {
    if (!this.userRepository) return targetIdOrUsername;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(targetIdOrUsername)) {
      return targetIdOrUsername;
    }
    const cleanUsername = targetIdOrUsername.startsWith('@') ? targetIdOrUsername.slice(1) : targetIdOrUsername;
    const byUsername = await this.userRepository.findByUsername(cleanUsername);
    if (byUsername) return byUsername.userId;
    throw new NotFoundException(`User '${targetIdOrUsername}' not found.`);
  }

  async getRelation(userId: string, targetUserId: string): Promise<PrivacyRelationEntity | null> {
    const resolvedTargetId = await this.resolveTargetUserId(targetUserId);
    return this.privacyRepository.getRelation(userId, resolvedTargetId);
  }

  async blockUser(userId: string, targetIdOrUsername: string, reason?: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    if (userId === targetUserId) {
      throw new BadRequestException("You cannot block yourself.");
    }
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isBlocked: true, reason });
  }

  async unblockUser(userId: string, targetIdOrUsername: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isBlocked: false, reason: null });
  }

  async getBlockedUsers(userId: string, limit: number = 20, cursor?: string) {
    return this.privacyRepository.getBlockedUsers(userId, limit, cursor);
  }

  async muteUser(userId: string, targetIdOrUsername: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isMuted: true });
  }

  async unmuteUser(userId: string, targetIdOrUsername: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isMuted: false });
  }

  async restrictUser(userId: string, targetIdOrUsername: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isRestricted: true });
  }

  async unrestrictUser(userId: string, targetIdOrUsername: string): Promise<PrivacyRelationEntity> {
    const targetUserId = await this.resolveTargetUserId(targetIdOrUsername);
    return this.privacyRepository.upsertRelation(userId, targetUserId, { isRestricted: false });
  }

  async checkIsBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const relation = await this.getRelation(userId, targetUserId);
    return !!relation?.isBlocked;
  }
}
