import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityMemberEntity } from '../entities/community-member.entity';

@Injectable()
export class CommunityMemberRepository {
  constructor(
    @InjectRepository(CommunityMemberEntity)
    private readonly repo: Repository<CommunityMemberEntity>,
  ) {}

  async create(data: Partial<CommunityMemberEntity>): Promise<CommunityMemberEntity> {
    const member = this.repo.create(data);
    return this.repo.save(member);
  }

  async save(member: CommunityMemberEntity | Partial<CommunityMemberEntity>): Promise<CommunityMemberEntity> {
    return this.repo.save(member as any);
  }

  async find(options?: any): Promise<CommunityMemberEntity[]> {
    return this.repo.find(options);
  }

  async findOne(options?: any): Promise<CommunityMemberEntity | null> {
    return this.repo.findOne(options);
  }

  async findByUserAndCommunity(userId: string, communityId: string): Promise<CommunityMemberEntity | null> {
    return this.repo.findOne({ where: { userId, communityId } });
  }

  async findByUser(userId: string): Promise<CommunityMemberEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  async remove(userIdOrEntity: string | CommunityMemberEntity, communityId?: string): Promise<void> {
    if (typeof userIdOrEntity === 'object') {
      await this.repo.remove(userIdOrEntity);
    } else if (communityId) {
      await this.repo.delete({ userId: userIdOrEntity, communityId });
    }
  }
}
