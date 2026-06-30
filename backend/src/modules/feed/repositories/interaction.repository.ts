import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostLikeEntity } from '../entities/post-like.entity';
import { PostSaveEntity } from '../entities/post-save.entity';
import { PostCommentEntity } from '../entities/post-comment.entity';
import { UserInterestEntity } from '../entities/user-interest.entity';
import { UserInteractionEntity } from '../entities/user-interaction.entity';
import { FeedImpressionEntity } from '../entities/feed-impression.entity';

@Injectable()
export class InteractionRepository {
  constructor(
    @InjectRepository(PostLikeEntity)
    private readonly likeRepo: Repository<PostLikeEntity>,
    @InjectRepository(PostSaveEntity)
    private readonly saveRepo: Repository<PostSaveEntity>,
    @InjectRepository(PostCommentEntity)
    private readonly commentRepo: Repository<PostCommentEntity>,
    @InjectRepository(UserInterestEntity)
    private readonly interestRepo: Repository<UserInterestEntity>,
    @InjectRepository(UserInteractionEntity)
    private readonly interactionRepo: Repository<UserInteractionEntity>,
    @InjectRepository(FeedImpressionEntity)
    private readonly impressionRepo: Repository<FeedImpressionEntity>,
  ) {}

  // Like operations
  async findLike(postId: string, userId: string): Promise<PostLikeEntity | null> {
    return this.likeRepo.findOne({ where: { postId, userId } });
  }

  async saveLike(like: PostLikeEntity): Promise<PostLikeEntity> {
    return this.likeRepo.save(like);
  }

  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const res = await this.likeRepo.delete({ postId, userId });
    return (res.affected ?? 0) > 0;
  }

  // Save operations
  async findSave(postId: string, userId: string): Promise<PostSaveEntity | null> {
    return this.saveRepo.findOne({ where: { postId, userId } });
  }

  async findSavesByUserId(userId: string): Promise<PostSaveEntity[]> {
    return this.saveRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async saveSave(save: PostSaveEntity): Promise<PostSaveEntity> {
    return this.saveRepo.save(save);
  }

  async deleteSave(postId: string, userId: string): Promise<boolean> {
    const res = await this.saveRepo.delete({ postId, userId });
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

  // Raw telemetry interaction logs
  async saveInteraction(interaction: UserInteractionEntity): Promise<UserInteractionEntity> {
    return this.interactionRepo.save(interaction);
  }

  async getRecentInteractions(userId: string, limit = 50): Promise<UserInteractionEntity[]> {
    return this.interactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // User interest vectors
  async getInterests(userId: string): Promise<UserInterestEntity[]> {
    return this.interestRepo.find({ where: { userId } });
  }

  async findInterest(userId: string, category: string): Promise<UserInterestEntity | null> {
    return this.interestRepo.findOne({ where: { userId, category } });
  }

  async saveInterest(interest: UserInterestEntity): Promise<UserInterestEntity> {
    return this.interestRepo.save(interest);
  }

  // Impression history
  async addImpression(impression: FeedImpressionEntity): Promise<FeedImpressionEntity> {
    // Save or ignore if already existing
    try {
      return await this.impressionRepo.save(impression);
    } catch {
      return impression; // already logged
    }
  }

  async getImpressions(userId: string): Promise<string[]> {
    const list = await this.impressionRepo.find({
      select: ['postId'],
      where: { userId },
    });
    return list.map(item => item.postId);
  }
}
