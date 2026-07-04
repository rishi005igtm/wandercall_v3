import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FavoriteFriendEntity } from '../entities/favorite-friend.entity';

@Injectable()
export class FavoriteFriendRepository extends Repository<FavoriteFriendEntity> {
  constructor(private dataSource: DataSource) {
    super(FavoriteFriendEntity, dataSource.createEntityManager());
  }

  async getFavorites(userId: string): Promise<FavoriteFriendEntity[]> {
    return this.createQueryBuilder('fav')
      .leftJoinAndSelect('fav.friend', 'friend')
      .where('fav.userId = :userId', { userId })
      .orderBy('fav.displayOrder', 'ASC')
      .addOrderBy('fav.createdAt', 'DESC')
      .getMany();
  }

  async getFavorite(userId: string, friendId: string): Promise<FavoriteFriendEntity | null> {
    return this.findOne({
      where: { userId, friendId },
    });
  }

  async getMaxDisplayOrder(userId: string): Promise<number> {
    const result = await this.createQueryBuilder('fav')
      .select('MAX(fav.displayOrder)', 'max')
      .where('fav.userId = :userId', { userId })
      .getRawOne();
    return result?.max ? parseInt(result.max, 10) : 0;
  }
}
