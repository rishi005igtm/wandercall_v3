import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityCategoryEntity } from '../entities/community-category.entity';

@Injectable()
export class CommunityCategoryRepository {
  constructor(
    @InjectRepository(CommunityCategoryEntity)
    private readonly repo: Repository<CommunityCategoryEntity>,
  ) {}

  async findAll(): Promise<CommunityCategoryEntity[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<CommunityCategoryEntity | null> {
    return this.repo.findOne({ where: { id } });
  }
}
