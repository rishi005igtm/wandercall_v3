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

  async findById(id: string): Promise<CommunityInviteEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(invite: CommunityInviteEntity): Promise<CommunityInviteEntity> {
    return this.repo.save(invite);
  }

  async updateStatus(id: string, status: CommunityInviteStatus): Promise<void> {
    await this.repo.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

