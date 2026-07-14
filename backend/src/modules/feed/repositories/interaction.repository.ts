import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PostSaveEntity } from '../entities/post-save.entity';
import { PostCommentEntity } from '../entities/post-comment.entity';
import { UserInterestEntity } from '../entities/user-interest.entity';
import { UserAuthorAffinityEntity } from '../entities/user-author-affinity.entity';
import { FeedImpressionEntity } from '../entities/feed-impression.entity';
import { UserPostStateEntity } from '../entities/user-post-state.entity';
import { PostLikeEntity } from '../entities/post-like.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class InteractionRepository {
  constructor(
    @InjectRepository(PostSaveEntity)
    private readonly saveRepo: Repository<PostSaveEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepo: Repository<PostCommentEntity>,
    @InjectRepository(UserInterestEntity)
    private readonly interestRepo: Repository<UserInterestEntity>,
    @InjectRepository(UserAuthorAffinityEntity)
    private readonly authorAffinityRepo: Repository<UserAuthorAffinityEntity>,
    @InjectRepository(FeedImpressionEntity)
    private readonly impressionRepo: Repository<FeedImpressionEntity>,
    @InjectRepository(UserPostStateEntity)
    private readonly userPostStateRepo: Repository<UserPostStateEntity>,
    @InjectRepository(PostLikeEntity)
    private readonly postLikeRepo: Repository<PostLikeEntity>,
  ) {}

  // Save operations
  async findSave(
    postId: string,
    userId: string,
  ): Promise<PostSaveEntity | null> {
    return this.saveRepo.findOne({ where: { postId, userId } });
  }

  async findSavesByPostIds(
    userId: string,
    postIds: string[],
  ): Promise<PostSaveEntity[]> {
    if (!postIds || postIds.length === 0) return [];
    return this.saveRepo.find({ where: { userId, postId: In(postIds) } });
  }

  async findSavesByUserId(userId: string): Promise<PostSaveEntity[]> {
    return this.saveRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async saveSave(save: PostSaveEntity): Promise<PostSaveEntity> {
    return this.saveRepo.save(save);
  }

  async deleteSave(postId: string, userId: string): Promise<boolean> {
    const res = await this.saveRepo.delete({ postId, userId });
    return (res.affected ?? 0) > 0;
  }

  // Like operations
  async addLike(like: PostLikeEntity): Promise<PostLikeEntity> {
    return this.postLikeRepo.save(like);
  }

  async removeLike(postId: string, userId: string): Promise<boolean> {
    const res = await this.postLikeRepo.delete({ postId, userId });
    return (res.affected ?? 0) > 0;
  }

  // Comment operations
  async addComment(comment: PostCommentEntity): Promise<PostCommentEntity> {
    return this.commentRepo.save(comment);
  }

  async getComments(postId: string): Promise<PostCommentEntity[]> {
    return this.commentRepo.find({
      where: { postId },
      order: { createdAt: 'DESC' },
    });
  }

  // User interest vectors
  async getInterests(userId: string): Promise<UserInterestEntity[]> {
    return this.interestRepo.find({ where: { userId } });
  }

  async findInterest(
    userId: string,
    category: string,
  ): Promise<UserInterestEntity | null> {
    return this.interestRepo.findOne({ where: { userId, category } });
  }

  async saveInterest(
    interest: UserInterestEntity,
  ): Promise<UserInterestEntity> {
    return this.interestRepo.save(interest);
  }

  // Author Affinity vectors
  async getAuthorAffinities(
    userId: string,
  ): Promise<UserAuthorAffinityEntity[]> {
    return this.authorAffinityRepo.find({ where: { userId } });
  }

  async findAuthorAffinity(
    userId: string,
    authorId: string,
  ): Promise<UserAuthorAffinityEntity | null> {
    return this.authorAffinityRepo.findOne({ where: { userId, authorId } });
  }

  async saveAuthorAffinity(
    affinity: UserAuthorAffinityEntity,
  ): Promise<UserAuthorAffinityEntity> {
    return this.authorAffinityRepo.save(affinity);
  }

  // Impression history
  async getImpressions(userId: string): Promise<FeedImpressionEntity[]> {
    return this.impressionRepo.find({ where: { userId } });
  }

  async addImpression(
    impression: FeedImpressionEntity,
  ): Promise<FeedImpressionEntity> {
    // Upsert logic for feed_impressions
    const existing = await this.impressionRepo.findOne({
      where: { userId: impression.userId, postId: impression.postId },
    });

    if (!existing) {
      return await this.impressionRepo.save(impression);
    } else {
      existing.impressionCount += 1;
      existing.totalVisibleDurationMs += impression.totalVisibleDurationMs || 0;
      existing.lastVisiblePercent = Math.max(
        existing.lastVisiblePercent,
        impression.lastVisiblePercent || 0,
      );
      if (impression.completedViews)
        existing.completedViews += impression.completedViews;
      existing.feedSessionId =
        impression.feedSessionId || existing.feedSessionId;
      existing.deviceType = impression.deviceType || existing.deviceType;
      existing.sourceFeed = impression.sourceFeed || existing.sourceFeed;
      existing.lastViewedAt = new Date();
      return await this.impressionRepo.save(existing);
    }
  }

  // New Unified Operational State Layer
  async upsertUserPostState(
    userId: string,
    postId: string,
    updates: Partial<UserPostStateEntity>,
  ): Promise<UserPostStateEntity> {
    let state = await this.userPostStateRepo.findOne({
      where: { userId, postId },
    });
    if (!state) {
      state = new UserPostStateEntity({
        id: randomUUID(),
        userId,
        postId,
        hasLiked: updates.hasLiked ?? false,
        hasSaved: updates.hasSaved ?? false,
        viewCount: updates.viewCount ?? 0,
        totalVisibleTime: updates.totalVisibleTime ?? 0,
      });
    } else {
      if (updates.hasLiked !== undefined) state.hasLiked = updates.hasLiked;
      if (updates.hasSaved !== undefined) state.hasSaved = updates.hasSaved;
      if (updates.viewCount !== undefined)
        state.viewCount = state.viewCount + updates.viewCount;
      if (updates.totalVisibleTime !== undefined)
        state.totalVisibleTime =
          state.totalVisibleTime + updates.totalVisibleTime;
    }
    return this.userPostStateRepo.save(state);
  }

  async getUserPostState(
    userId: string,
    postId: string,
  ): Promise<UserPostStateEntity | null> {
    return this.userPostStateRepo.findOne({ where: { userId, postId } });
  }

  async getUserPostStates(
    userId: string,
    postIds: string[],
  ): Promise<UserPostStateEntity[]> {
    if (!postIds || postIds.length === 0) return [];
    return this.userPostStateRepo.find({
      where: { userId, postId: In(postIds) },
    });
  }

  async getImpressionPostIds(userId: string): Promise<string[]> {
    const list = await this.impressionRepo.find({
      select: ['postId'],
      where: { userId },
    });
    return list.map((item) => item.postId);
  }

  async getViewCounts(userId: string): Promise<Map<string, number>> {
    const states = await this.userPostStateRepo.find({
      where: { userId },
      select: ['postId', 'viewCount'],
    });
    const map = new Map<string, number>();
    states.forEach((s) => {
      if (s.viewCount > 0) map.set(s.postId, s.viewCount);
    });
    return map;
  }
}
