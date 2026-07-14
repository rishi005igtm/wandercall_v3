import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityCoordinateEntity } from '../entities/community-coordinate.entity';

@Injectable()
export class CommunityCoordinateRepository {
  constructor(
    @InjectRepository(CommunityCoordinateEntity)
    private readonly repo: Repository<CommunityCoordinateEntity>,
  ) {}

  async findAll(): Promise<CommunityCoordinateEntity[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<CommunityCoordinateEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByCategoryId(
    categoryId: string,
  ): Promise<CommunityCoordinateEntity[]> {
    return this.repo.find({ where: { categoryId } });
  }
}
