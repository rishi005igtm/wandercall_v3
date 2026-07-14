import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../feed/entities/post.entity';
import { CommunityPermissionService } from './community-permission.service';
import { CommunityAuditService } from './community-audit.service';
import { CommunityAuditAction } from '../entities/community-audit-log.entity';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';

@Injectable()
export class CommunityStoryService {
  private readonly logger = new Logger(CommunityStoryService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly permissionService: CommunityPermissionService,
    private readonly auditService: CommunityAuditService,
    private readonly eventDispatcher: CommunityEventDispatcher,
  ) {}

  /**
   * Pin or unpin a story to the top of the community feed.
   */
  async pinStory(
    communityId: string,
    actorId: string,
    storyId: string,
    isPinned = true,
  ): Promise<PostEntity> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    await this.permissionService.requirePermission(id, actorId, 'story.pin');

    const post = await this.postRepo.findOne({ where: { id: storyId } });
    if (!post || post.isDeleted) {
      throw new NotFoundException('Story not found');
    }

    post.aiMetadata = {
      ...post.aiMetadata,
      isPinned,
      pinnedAt: isPinned ? new Date().toISOString() : null,
      pinnedBy: isPinned ? actorId : null,
    };
    const updated = await this.postRepo.save(post);

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId: post.authorId,
      action: isPinned
        ? CommunityAuditAction.STORY_PIN
        : CommunityAuditAction.STORY_UNPIN,
      reason: isPinned
        ? 'Pinned story to community hero/feed'
        : 'Unpinned story',
      metadata: { storyId, title: post.title },
    });

    this.eventDispatcher.dispatch({
      type: 'COMMUNITY_STORY_PINNED',
      payload: { communityId: id, storyId, actorId, isPinned },
    });

    return updated;
  }

  /**
   * Feature a story in the community gallery or highlight section.
   */
  async featureStory(
    communityId: string,
    actorId: string,
    storyId: string,
    isFeatured = true,
  ): Promise<PostEntity> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    await this.permissionService.requirePermission(id, actorId, 'story.pin');

    const post = await this.postRepo.findOne({ where: { id: storyId } });
    if (!post || post.isDeleted) {
      throw new NotFoundException('Story not found');
    }

    post.aiMetadata = {
      ...post.aiMetadata,
      isFeatured,
      featuredAt: isFeatured ? new Date().toISOString() : null,
      featuredBy: isFeatured ? actorId : null,
    };
    const updated = await this.postRepo.save(post);

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId: post.authorId,
      action: CommunityAuditAction.STORY_FEATURE,
      reason: isFeatured ? 'Featured story' : 'Unfeatured story',
      metadata: { storyId, title: post.title, isFeatured },
    });

    return updated;
  }

  /**
   * Soft-delete a story or post within the community.
   */
  async deleteStory(
    communityId: string,
    actorId: string,
    storyId: string,
    reason?: string,
  ): Promise<void> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    await this.permissionService.requirePermission(id, actorId, 'story.delete');

    const post = await this.postRepo.findOne({ where: { id: storyId } });
    if (!post) {
      throw new NotFoundException('Story not found');
    }

    post.isDeleted = true;
    await this.postRepo.save(post);

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId: post.authorId,
      action: CommunityAuditAction.STORY_DELETE,
      reason: reason || 'Removed by community moderator',
      metadata: { storyId, title: post.title },
    });

    this.eventDispatcher.dispatch({
      type: 'COMMUNITY_STORY_DELETED',
      payload: { communityId: id, storyId, actorId },
    });
  }

  /**
   * Get active stories for a community, sorted with pinned items first.
   */
  async getCommunityStories(
    communityId: string,
    filter: { category?: string; limit?: number; offset?: number } = {},
  ): Promise<PostEntity[]> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const limit = Math.min(filter.limit || 20, 50);
    const offset = filter.offset || 0;

    const query = this.postRepo
      .createQueryBuilder('post')
      .where('post.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(
        "(post.authorId = :communityId OR post.aiMetadata->>'communityId' = :communityId OR post.searchMetadata->>'communityId' = :communityId)",
        { communityId: id },
      );

    if (filter.category) {
      query.andWhere('post.category = :category', {
        category: filter.category,
      });
    }

    query
      .orderBy(
        "COALESCE((post.aiMetadata->>'isPinned')::boolean, false)",
        'DESC',
      )
      .addOrderBy('post.publishedAt', 'DESC', 'NULLS LAST')
      .addOrderBy('post.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    return query.getMany();
  }
}
