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

  async find(options?: any): Promise<CommunityRoleEntity[]> {
    return this.repo.find(options);
  }

  async findOne(options?: any): Promise<CommunityRoleEntity | null> {
    return this.repo.findOne(options);
  }

  async create(
    data: Partial<CommunityRoleEntity>,
  ): Promise<CommunityRoleEntity> {
    const role = this.repo.create(data);
    return this.repo.save(role);
  }

  async createRole(
    data: Partial<CommunityRoleEntity>,
  ): Promise<CommunityRoleEntity> {
    return this.create(data);
  }

  async save(
    role: CommunityRoleEntity | Partial<CommunityRoleEntity>,
  ): Promise<CommunityRoleEntity> {
    return this.repo.save(role as any);
  }

  async remove(role: CommunityRoleEntity): Promise<CommunityRoleEntity> {
    return this.repo.remove(role);
  }
}
