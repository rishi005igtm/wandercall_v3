import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FavoriteFriendRepository } from '../repositories/favorite-friend.repository';
import { FavoriteFriendEntity } from '../entities/favorite-friend.entity';
import { RelationshipService } from '../../user/services/relationship.service';

@Injectable()
export class FavoriteFriendService {
  private readonly MAX_FAVORITES = 10;

  constructor(
    private readonly favRepo: FavoriteFriendRepository,
    private readonly relationshipService: RelationshipService,
  ) {}

  async getFavorites(userId: string): Promise<FavoriteFriendEntity[]> {
    return this.favRepo.getFavorites(userId);
  }

  async addFavorite(
    userId: string,
    friendId: string,
  ): Promise<FavoriteFriendEntity> {
    if (userId === friendId) {
      throw new BadRequestException('You cannot favorite yourself.');
    }

    // Verify mutual friendship
    const rel = await this.relationshipService.resolveRelationship(
      userId,
      friendId,
    );
    if (!rel.isFriend) {
      throw new BadRequestException('You can only favorite mutual friends.');
    }

    // Check limit
    const currentFavs = await this.favRepo.getFavorites(userId);
    if (currentFavs.length >= this.MAX_FAVORITES) {
      throw new BadRequestException(
        `You cannot exceed the maximum limit of ${this.MAX_FAVORITES} favorites.`,
      );
    }

    // Check if already exists
    const existing = await this.favRepo.getFavorite(userId, friendId);
    if (existing) {
      return existing;
    }

    const maxOrder = await this.favRepo.getMaxDisplayOrder(userId);
    const newFav = this.favRepo.create({
      userId,
      friendId,
      displayOrder: maxOrder + 1,
    });

    return this.favRepo.save(newFav);
  }

  async removeFavorite(userId: string, friendId: string): Promise<void> {
    const existing = await this.favRepo.getFavorite(userId, friendId);
    if (!existing) {
      throw new NotFoundException('Favorite not found.');
    }
    await this.favRepo.remove(existing);
  }

  async reorderFavorites(
    userId: string,
    orderedFriendIds: string[],
  ): Promise<void> {
    const favs = await this.favRepo.getFavorites(userId);
    const favMap = new Map<string, FavoriteFriendEntity>();
    favs.forEach((f) => favMap.set(f.friendId, f));

    const updates: FavoriteFriendEntity[] = [];
    orderedFriendIds.forEach((friendId, idx) => {
      const fav = favMap.get(friendId);
      if (fav) {
        fav.displayOrder = idx;
        updates.push(fav);
      }
    });

    if (updates.length > 0) {
      await this.favRepo.save(updates);
    }
  }
}
