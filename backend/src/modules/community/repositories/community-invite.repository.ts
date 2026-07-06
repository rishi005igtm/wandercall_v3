import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityInviteEntity, CommunityInviteStatus } from '../entities/community-invite.entity';

@Injectable()
export class CommunityInviteRepository {
  constructor(
    @InjectRepository(CommunityInviteEntity)
    private readonly repo: Repository<CommunityInviteEntity>,
  ) {}

  async create(data: Partial<CommunityInviteEntity>): Promise<CommunityInviteEntity> {
    const invite = this.repo.create(data);
    return this.repo.save(invite);
  }

  async findPendingInvite(communityId: string, receiverId: string): Promise<CommunityInviteEntity | null> {
    return this.repo.findOne({ 
      where: { 
        communityId, 
        receiverId, 
        status: CommunityInviteStatus.PENDING 
      } 
    });
  }

  async updateStatus(id: string, status: CommunityInviteStatus): Promise<void> {
    await this.repo.update(id, { status });
  }
}
