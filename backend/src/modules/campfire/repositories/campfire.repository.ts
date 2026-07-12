import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampfireEntity } from '../entities/campfire.entity';

@Injectable()
export class CampfireRepository {
  constructor(
    @InjectRepository(CampfireEntity)
    private readonly repo: Repository<CampfireEntity>,
  ) {}

  async create(data: Partial<CampfireEntity>): Promise<CampfireEntity> {
    const campfire = this.repo.create(data);
    return this.repo.save(campfire);
  }

  async findById(id: string): Promise<CampfireEntity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (entity) {
      await this.hydrateHosts([entity]);
    }
    return entity;
  }

  async update(id: string, data: Partial<CampfireEntity>): Promise<CampfireEntity> {
    await this.repo.update(id, data);
    const updated = await this.findById(id);
    if (!updated) throw new Error('Entity not found after update');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async findLive(limit: number = 20, offset: number = 0): Promise<[CampfireEntity[], number]> {
    const [items, total] = await this.repo.findAndCount({
      where: { status: 'LIVE' as any },
      order: { startedAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    await this.hydrateHosts(items);
    return [items, total];
  }

  // Find campfires by host id, optionally excluding deleted via softDelete behavior
  async findByHostId(hostId: string): Promise<CampfireEntity[]> {
    const items = await this.repo.find({ where: { hostId }, order: { createdAt: 'DESC' } });
    await this.hydrateHosts(items);
    return items;
  }

  async search(query: any): Promise<[CampfireEntity[], number]> {
    const { status, hostId, communityId, limit = 20, offset = 0 } = query;
    const where: any = {};
    
    // The frontend passes 'ACTIVE' for live campfires.
    if (status === 'ACTIVE') {
      where.status = 'LIVE';
    } else if (status) {
      where.status = status;
    }
    
    if (hostId) where.hostId = hostId;
    if (communityId) where.communityId = communityId;
    
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      take: Number(limit),
      skip: Number(offset),
    });
    await this.hydrateHosts(items);
    return [items, total];
  }

  private async hydrateHosts(items: CampfireEntity[]): Promise<CampfireEntity[]> {
    if (!items || items.length === 0) return items;
    const hostIds = Array.from(new Set(items.map(i => i.hostId).filter(Boolean)));
    if (hostIds.length === 0) return items;

    try {
      const profiles = await this.repo.manager.query(
        `SELECT up."userId", up."displayName", up."avatarUrl", up."username", ua."displayName" as "authName"
         FROM users_auth ua
         LEFT JOIN users_profile up ON up."userId" = ua."id"
         WHERE ua."id" IN (${hostIds.map((_, i) => `$${i + 1}`).join(', ')})`,
        hostIds
      );

      const profileMap = new Map<string, any>(profiles.map((p: any) => [p.userId, p]));

      for (const item of items) {
        const p: any = profileMap.get(item.hostId);
        if (p) {
          item.hostName = p.displayName || p.authName || 'Wanderer';
          item.hostAvatar = p.avatarUrl || null;
        } else {
          item.hostName = 'Wanderer';
          item.hostAvatar = null;
        }
      }
    } catch (e) {
      // Fallback if query fails
      for (const item of items) {
        if (!item.hostName) item.hostName = 'Wanderer';
        if (!item.hostAvatar) item.hostAvatar = null;
      }
    }
    return items;
  }
}
