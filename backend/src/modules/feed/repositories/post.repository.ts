import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Any } from 'typeorm';
import { PostEntity, PostStatus, PostVisibility } from '../entities/post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repo: Repository<PostEntity>,
  ) {}

  async findById(id: string): Promise<PostEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(post: PostEntity): Promise<PostEntity> {
    return this.repo.save(post);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.repo.increment({ id }, 'likeCount', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    // Prevent negative counts
    const post = await this.findById(id);
    if (post && post.likeCount > 0) {
      await this.repo.decrement({ id }, 'likeCount', 1);
    }
  }

  async incrementSaves(id: string): Promise<void> {
    await this.repo.increment({ id }, 'saveCount', 1);
  }

  async decrementSaves(id: string): Promise<void> {
    const post = await this.findById(id);
    if (post && post.saveCount > 0) {
      await this.repo.decrement({ id }, 'saveCount', 1);
    }
  }

  async incrementComments(id: string): Promise<void> {
    await this.repo.increment({ id }, 'commentCount', 1);
  }

  async incrementShares(id: string): Promise<void> {
    await this.repo.increment({ id }, 'shareCount', 1);
  }

  /**
   * Fetch all candidate posts that are eligible for recommendation ranking.
   * Applying visibility filters at the database query level to prevent loading unauthorized content.
   */
  async getCandidates(viewerId?: string, followedCreatorIds: string[] = []): Promise<PostEntity[]> {
    const query = this.repo.createQueryBuilder('post')
      .where(
        viewerId 
          ? '(post.status = :publishedStatus OR (post.status IN (:...processingStatuses) AND post.authorId = :viewerId))'
          : 'post.status = :publishedStatus',
        { 
          publishedStatus: PostStatus.PUBLISHED,
          processingStatuses: [PostStatus.DRAFT, PostStatus.VALIDATING, PostStatus.IMAGE_VERIFIED, PostStatus.METADATA_GENERATED, PostStatus.FAILED],
          viewerId
        }
      );

    if (!viewerId) {
      // Guest sees only PUBLIC posts
      query.andWhere('post.visibility = :publicVisibility', { publicVisibility: PostVisibility.PUBLIC });
    } else {
      // Authenticated user sees:
      // 1. PUBLIC posts
      // 2. FOLLOWERS posts if they follow the author
      // 3. Any of their own posts (including PRIVATE/FOLLOWERS ones)
      if (followedCreatorIds.length > 0) {
        query.andWhere(
          `(post.visibility = :publicVisibility OR ` +
          `(post.visibility = :followersVisibility AND post.authorId IN (:...followedCreatorIds)) OR ` +
          `post.authorId = :viewerId)`,
          {
            publicVisibility: PostVisibility.PUBLIC,
            followersVisibility: PostVisibility.FOLLOWERS,
            followedCreatorIds,
            viewerId,
          }
        );
      } else {
        query.andWhere(
          `(post.visibility = :publicVisibility OR post.authorId = :viewerId)`,
          {
            publicVisibility: PostVisibility.PUBLIC,
            viewerId,
          }
        );
      }
    }

    // Keep candidate generator fast: order by freshness primarily to bound retrieval
    query.orderBy('post.publishedAt', 'DESC')
      .limit(500); // Generate a healthy pool of top 500 candidates for ranking pipeline

    return query.getMany();
  }

  async findByAuthor(authorId: string): Promise<PostEntity[]> {
    return this.repo.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPostsByAuthor(authorId: string, viewerId?: string | null, isFollowing = false): Promise<PostEntity[]> {
    const query = this.repo.createQueryBuilder('post')
      .where('post.authorId = :authorId', { authorId })
      .andWhere(
        viewerId === authorId
          ? '(post.status = :publishedStatus OR post.status IN (:...processingStatuses))'
          : 'post.status = :publishedStatus',
        { 
          publishedStatus: PostStatus.PUBLISHED,
          processingStatuses: [PostStatus.DRAFT, PostStatus.VALIDATING, PostStatus.IMAGE_VERIFIED, PostStatus.METADATA_GENERATED, PostStatus.FAILED]
        }
      );

    if (!viewerId) {
      // Guest sees only PUBLIC posts
      query.andWhere('post.visibility = :publicVisibility', { publicVisibility: PostVisibility.PUBLIC });
    } else if (viewerId === authorId) {
      // Owner sees all their published posts (PUBLIC, FOLLOWERS, PRIVATE)
    } else if (isFollowing) {
      // Follower sees PUBLIC and FOLLOWERS posts
      query.andWhere('post.visibility IN (:...allowedVisibilities)', {
        allowedVisibilities: [PostVisibility.PUBLIC, PostVisibility.FOLLOWERS]
      });
    } else {
      // Authenticated non-follower sees only PUBLIC posts
      query.andWhere('post.visibility = :publicVisibility', { publicVisibility: PostVisibility.PUBLIC });
    }

    query.orderBy('post.publishedAt', 'DESC');
    return query.getMany();
  }
}
