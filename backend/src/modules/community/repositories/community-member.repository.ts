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

  async findByUserAndCommunity(userId: string, communityId: string): Promise<CommunityMemberEntity | null> {
    return this.repo.findOne({ where: { userId, communityId } });
  }

  async findByUser(userId: string): Promise<CommunityMemberEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  async remove(userId: string, communityId: string): Promise<void> {
    await this.repo.delete({ userId, communityId });
  }
}
