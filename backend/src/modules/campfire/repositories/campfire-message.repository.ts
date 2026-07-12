import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampfireMessageEntity } from '../entities/campfire-message.entity';

@Injectable()
export class CampfireMessageRepository {
  constructor(
    @InjectRepository(CampfireMessageEntity)
    private readonly repo: Repository<CampfireMessageEntity>,
  ) {}

  async create(data: Partial<CampfireMessageEntity>): Promise<CampfireMessageEntity> {
    const message = this.repo.create(data);
    return this.repo.save(message);
  }

  async findByCampfireId(campfireId: string, limit: number = 100): Promise<CampfireMessageEntity[]> {
    return this.repo.find({
      where: { campfireId },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  async pruneOldMessages(campfireId: string, keepCount: number = 100): Promise<void> {
    // Determine the ID of the oldest message we want to KEEP
    // So we skip `keepCount` newest messages and delete anything older.
    const messagesToKeep = await this.repo.find({
      where: { campfireId },
      order: { createdAt: 'DESC' },
      select: ['id'],
      take: keepCount,
    });

    if (messagesToKeep.length < keepCount) {
      return; // No need to prune if we have less than keepCount
    }

    // Any message not in the list of top 100 should be deleted.
    const keepIds = messagesToKeep.map(m => m.id);
    await this.repo.createQueryBuilder()
      .delete()
      .from(CampfireMessageEntity)
      .where("campfireId = :campfireId", { campfireId })
      .andWhere("id NOT IN (:...keepIds)", { keepIds })
      .execute();
  }
}
