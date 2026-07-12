import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CampfireEntity } from '../entities/campfire.entity';
import { CampfireCursorPaginationDto, CampfireSortField, CampfireDiscoveryResponse } from '../dto/campfire-discovery.dto';

@Injectable()
export class CampfireDiscoveryRepository {
  constructor(
    @InjectRepository(CampfireEntity)
    private readonly repository: Repository<CampfireEntity>,
  ) {}

  async findDiscoverable(query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    const qb = this.repository.createQueryBuilder('campfire');

    this.applyFilters(qb, query);
    this.applySearch(qb, query.search);
    this.applyCursorAndSort(qb, query);

    const limit = query.limit || 20;
    // Fetch one extra to determine if there is a next page
    qb.limit(limit + 1);

    qb.leftJoin('users_profile', 'userProfile', '"userProfile"."userId" = campfire."hostId"');
    qb.leftJoin('users_auth', 'userAuth', '"userAuth"."id" = campfire."hostId"');
    qb.addSelect(['userProfile.displayName', 'userProfile.avatarUrl', 'userProfile.username', 'userAuth.displayName']);

    const { entities: items, raw } = await qb.getRawAndEntities();

    // Hydrate host profile data
    items.forEach((item) => {
      const rawRow = raw.find((r) => r.campfire_id === item.id);
      if (rawRow) {
        item.hostName = rawRow.userProfile_displayName || rawRow.userAuth_displayName || 'Wanderer';
        item.hostAvatar = rawRow.userProfile_avatarUrl || null;
        item.hostUsername = rawRow.userProfile_username || null;
      } else {
        item.hostName = 'Wanderer';
        item.hostAvatar = null;
      }
    });
    
    const hasNext = items.length > limit;
    const paginatedItems = hasNext ? items.slice(0, limit) : items;
    
    let nextCursor: string | undefined = undefined;
    if (hasNext && paginatedItems.length > 0) {
      nextCursor = this.generateNextCursor(paginatedItems[paginatedItems.length - 1], query.sort);
    }

    return {
      items: paginatedItems,
      nextCursor,
      hasNext,
    };
  }

  private applyFilters(qb: SelectQueryBuilder<CampfireEntity>, query: CampfireCursorPaginationDto) {
    // Only fetch non-deleted
    qb.andWhere('campfire.deletedAt IS NULL');

    if (query.category) {
      qb.andWhere('campfire.category = :category', { category: query.category });
    }

    if (query.mood) {
      qb.andWhere('campfire.mood = :mood', { mood: query.mood });
    }

    if (query.visibility) {
      qb.andWhere('campfire.visibility = :visibility', { visibility: query.visibility });
    }

    if (query.status) {
      if ((query.status as string) === 'LIVE' || (query.status as string) === 'ACTIVE') {
        qb.andWhere('campfire.status IN (:...statuses)', { statuses: ['LIVE', 'ACTIVE'] });
      } else {
        qb.andWhere('campfire.status = :status', { status: query.status });
      }
    }

    if (query.communityId) {
      qb.andWhere('campfire.communityId = :communityId', { communityId: query.communityId });
    }

    if (query.hostId) {
      qb.andWhere('campfire.hostId = :hostId', { hostId: query.hostId });
    }
  }

  private applySearch(qb: SelectQueryBuilder<CampfireEntity>, search?: string) {
    if (!search) return;
    
    const searchTerm = `%${search.toLowerCase()}%`;
    qb.andWhere(
      '(LOWER(campfire.title) LIKE :search OR LOWER(campfire.description) LIKE :search)', 
      { search: searchTerm }
    );
  }

  private applyCursorAndSort(qb: SelectQueryBuilder<CampfireEntity>, query: CampfireCursorPaginationDto) {
    const sort = query.sort || CampfireSortField.NEWEST;
    const cursor = query.cursor;

    switch (sort) {
      case CampfireSortField.OLDEST:
        qb.orderBy('campfire.createdAt', 'ASC');
        if (cursor) {
          qb.andWhere('campfire.createdAt > :cursor', { cursor: new Date(cursor) });
        }
        break;
      
      case CampfireSortField.RECENTLY_STARTED:
        qb.orderBy('campfire.startedAt', 'DESC');
        qb.addOrderBy('campfire.createdAt', 'DESC');
        if (cursor) {
          qb.andWhere('campfire.startedAt < :cursor', { cursor: new Date(cursor) });
        }
        break;

      case CampfireSortField.ALPHABETICAL:
        qb.orderBy('campfire.title', 'ASC');
        qb.addOrderBy('campfire.id', 'ASC');
        if (cursor) {
          // Simplistic cursor for alphabetical
          qb.andWhere('campfire.title > :cursor', { cursor });
        }
        break;

      // Ranking service handles popular/trending mostly via cache, 
      // but fallback to newest if they hit repository direct
      case CampfireSortField.POPULARITY:
      case CampfireSortField.TRENDING:
      case CampfireSortField.PARTICIPANTS:
      case CampfireSortField.NEWEST:
      default:
        qb.orderBy('campfire.createdAt', 'DESC');
        if (cursor) {
          qb.andWhere('campfire.createdAt < :cursor', { cursor: new Date(cursor) });
        }
        break;
    }
  }

  private generateNextCursor(lastItem: CampfireEntity, sort?: CampfireSortField): string {
    switch (sort) {
      case CampfireSortField.OLDEST:
      case CampfireSortField.POPULARITY:
      case CampfireSortField.TRENDING:
      case CampfireSortField.PARTICIPANTS:
      case CampfireSortField.NEWEST:
        return lastItem.createdAt.toISOString();
      case CampfireSortField.RECENTLY_STARTED:
        return lastItem.startedAt ? lastItem.startedAt.toISOString() : lastItem.createdAt.toISOString();
      case CampfireSortField.ALPHABETICAL:
        return lastItem.title;
      default:
        return lastItem.createdAt.toISOString();
    }
  }
}
