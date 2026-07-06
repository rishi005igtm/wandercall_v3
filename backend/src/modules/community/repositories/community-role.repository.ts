import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityRoleEntity } from '../entities/community-role.entity';

@Injectable()
export class CommunityRoleRepository {
  constructor(
    @InjectRepository(CommunityRoleEntity)
    private readonly repo: Repository<CommunityRoleEntity>,
  ) {}

  async findByName(name: string): Promise<CommunityRoleEntity | null> {
    return this.repo.findOne({ where: { name } });
  }

  async findById(id: string): Promise<CommunityRoleEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<CommunityRoleEntity[]> {
    return this.repo.find();
  }
}
