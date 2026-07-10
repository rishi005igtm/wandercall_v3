import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampfireEntity } from '../entities/campfire.entity';
import { CampfireQueryDto } from '../dto/campfire-query.dto';

export interface ICampfireRepository {
  create(campfire: Partial<CampfireEntity>): Promise<CampfireEntity>;
  findById(id: string): Promise<CampfireEntity | null>;
  update(id: string, partial: Partial<CampfireEntity>): Promise<CampfireEntity>;
  softDelete(id: string): Promise<void>;
  findAndCount(query: CampfireQueryDto): Promise<[CampfireEntity[], number]>;
}

@Injectable()
export class CampfireRepository implements ICampfireRepository {
  constructor(
    @InjectRepository(CampfireEntity)
    private readonly repository: Repository<CampfireEntity>,
  ) {}

  async create(campfire: Partial<CampfireEntity>): Promise<CampfireEntity> {
    const entity = this.repository.create(campfire);
    const saved = await this.repository.save(entity);
    return (await this.findById(saved.id)) || saved;
  }

  async findById(id: string): Promise<CampfireEntity | null> {
    if (!id) return null;
    const cleanId = id.split('--')[0];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cleanId)) {
      return null;
    }

    const qb = this.repository.createQueryBuilder('campfire');
    qb.where('campfire.id = :id', { id: cleanId });
    qb.leftJoin('users_profile', 'userProfile', '"userProfile"."userId" = campfire."hostId"');
    qb.leftJoin('users_auth', 'userAuth', '"userAuth"."id" = campfire."hostId"');
    qb.addSelect(['userProfile.displayName', 'userProfile.avatarUrl', 'userProfile.username', 'userAuth.displayName']);

    const { entities, raw } = await qb.getRawAndEntities();
    if (entities.length === 0) return null;

    const entity = entities[0];
    const rawRow = raw[0];
    if (rawRow) {
      entity.hostName = rawRow.userProfile_displayName || rawRow.userAuth_displayName || 'Wanderer';
      entity.hostAvatar = rawRow.userProfile_avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      entity.hostUsername = rawRow.userProfile_username || null;
    }
    return entity;
  }

  async update(id: string, partial: Partial<CampfireEntity>): Promise<CampfireEntity> {
    await this.repository.update(id, partial);
    return this.findById(id) as Promise<CampfireEntity>;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findAndCount(query: CampfireQueryDto): Promise<[CampfireEntity[], number]> {
    const qb = this.repository.createQueryBuilder('campfire');

    if (query.communityId) {
      qb.andWhere('campfire.communityId = :communityId', { communityId: query.communityId });
    }

    if (query.hostId) {
      qb.andWhere('campfire.hostId = :hostId', { hostId: query.hostId });
    }

    if (query.status) {
      qb.andWhere('campfire.status = :status', { status: query.status });
    }

    if (query.category) {
      qb.andWhere('campfire.category = :category', { category: query.category });
    }

    if (query.mood) {
      qb.andWhere('campfire.mood = :mood', { mood: query.mood });
    }

    if (query.search) {
      qb.andWhere('LOWER(campfire.title) LIKE LOWER(:search)', { search: `%${query.search}%` });
    }

    if (query.savedByUserId) {
      qb.andWhere('campfire.remindedUserIds @> :savedUserJson', { savedUserJson: JSON.stringify([query.savedByUserId]) });
    }

    if (query.participantUserId) {
      qb.andWhere('campfire.joinedUserIds @> :participantUserJson', { participantUserJson: JSON.stringify([query.participantUserId]) });
    }

    if (query.offset) qb.offset(query.offset);
    qb.limit(query.limit || 20);
    qb.orderBy('campfire.createdAt', 'DESC');

    qb.leftJoin('users_profile', 'userProfile', '"userProfile"."userId" = campfire."hostId"');
    qb.leftJoin('users_auth', 'userAuth', '"userAuth"."id" = campfire."hostId"');
    qb.addSelect(['userProfile.displayName', 'userProfile.avatarUrl', 'userProfile.username', 'userAuth.displayName']);

    const count = await qb.getCount();
    const { entities: items, raw } = await qb.getRawAndEntities();

    items.forEach((item) => {
      const rawRow = raw.find((r) => r.campfire_id === item.id);
      if (rawRow) {
        item.hostName = rawRow.userProfile_displayName || rawRow.userAuth_displayName || 'Wanderer';
        item.hostAvatar = rawRow.userProfile_avatarUrl || null;
        item.hostUsername = rawRow.userProfile_username || null;
      }
    });

    return [items, count];
  }
}
