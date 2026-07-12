import { BadRequestException, Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostRepository } from '../repositories/post.repository';
import { InteractionRepository } from '../repositories/interaction.repository';
import { InterestEngine } from './interest.engine';
import { StorageService } from '../../storage/services/storage.service';
import { UploadIntent } from '../../storage/enums/upload-intent.enum';
import { FeedEventDispatcher } from '../events/feed-event.dispatcher';
import { PostEntity, PostStatus, PostAuthorType, PostVisibility } from '../entities/post.entity';
import { PostSaveEntity } from '../entities/post-save.entity';
import { PostCommentEntity } from '../entities/post-comment.entity';
import { PostLikeEntity } from '../entities/post-like.entity';
import { FeedImpressionEntity } from '../entities/feed-impression.entity';
import { InteractionType } from '../enums/interaction-type.enum';
import { UserRole } from '../../auth/enums/user-role.enum';
import { UserRepository } from '../../user/repositories/user.repository';

export interface CreatePostParams {
  title: string;
  content: string;
  category: string;
  visibility?: PostVisibility;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
}

export interface UpdatePostParams {
  title?: string;
  content?: string;
  category?: string;
  visibility?: PostVisibility;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
}

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly interactionRepository: InteractionRepository,
    private readonly interestEngine: InterestEngine,
    private readonly storageService: StorageService,
    private readonly eventDispatcher: FeedEventDispatcher,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Main publishing flow. Drives posts through modular lifecycle transitions.
   */
  async createPost(
    userId: string,
    userRole: UserRole,
    params: CreatePostParams,
    files?: { images?: Express.Multer.File[]; audio?: Express.Multer.File },
  ): Promise<PostEntity> {

    const postId = randomUUID();

    // Mapping authorization roles to publisher types
    let authorType = PostAuthorType.INDIVIDUAL;
    if (userRole === UserRole.HOST) authorType = PostAuthorType.HOST;
    if (userRole === UserRole.ADMIN) authorType = PostAuthorType.OFFICIAL;

    // --- PHASE 1: DRAFT ---
    const post = new PostEntity({
      id: postId,
      authorId: userId,
      authorType,
      category: params.category || 'story',
      title: params.title,
      content: params.content,
      visibility: params.visibility || PostVisibility.PUBLIC,
      locationName: params.locationName,
      locationLat: params.locationLat,
      locationLon: params.locationLon,
      status: PostStatus.DRAFT,
      images: [],
      imagePublicIds: [],
      audioDuration: 0,
      aiQualityScore: 1.0,
    });

    // --- PHASE 2: VALIDATION ---
    post.status = PostStatus.VALIDATING;
    if (!post.title || post.title.trim() === '') {
      throw new BadRequestException('Adventure title is required.');
    }
    if (!post.content || post.content.trim().length < 50) {
      throw new BadRequestException('Adventure story details must be at least 50 characters long.');
    }
    if (!post.category || post.category.trim() === '') {
      throw new BadRequestException('Adventure category is required.');
    }

    // --- PHASE 3: METADATA GENERATION ---
    post.status = PostStatus.METADATA_GENERATED;
    post.aiQualityScore = 1.0; 
    post.searchMetadata = {
      tags: [post.category, 'wandercall', 'explore'],
      indexedAt: new Date().toISOString(),
    };

    // --- PHASE 4: INITIAL SAVE & ASYNC DELEGATION ---
    post.status = PostStatus.VALIDATING; // Setting to validating to show skeleton in feed initially
    post.publishedAt = new Date();
    const savedPost = await this.postRepository.save(post);

    
    try {
      const imageUrls: string[] = [];
      const imagePublicIds: string[] = [];

      if (files?.images && files.images.length > 0) {
        const uploadPromises = files.images.map(file => 
          this.storageService.uploadFile(file, UploadIntent.FEED_IMAGE, postId)
        );
        const metadatas = await Promise.all(uploadPromises);
        metadatas.forEach(metadata => {
          imageUrls.push(metadata.secureUrl);
          imagePublicIds.push(metadata.publicId);
        });
        savedPost.images = imageUrls;
        savedPost.imagePublicIds = imagePublicIds;
      }

      if (files?.audio) {
        const audioMetadata = await this.storageService.uploadFile(
          files.audio,
          UploadIntent.FEED_AUDIO,
          postId,
        );
        savedPost.audioUrl = audioMetadata.secureUrl;
        savedPost.audioPublicId = audioMetadata.publicId;
        savedPost.audioDuration = 35;
      }

      savedPost.status = PostStatus.PUBLISHED;
      await this.postRepository.save(savedPost);
      this.eventDispatcher.dispatchPostCreated(savedPost);
      this.eventDispatcher.dispatchPostPublished(savedPost);
    } catch (err) {
      this.logger.error(`[Lifecycle - Step 5: Processing] Failed processing for post ${postId}: ${err}`);
      savedPost.status = PostStatus.FAILED;
      await this.postRepository.save(savedPost);
    }

    return savedPost;
  }

  /**
   * Edit post contents. Enforces strict ownership.
   */
  async editPost(
    userId: string,
    userRole: UserRole,
    postId: string,
    params: UpdatePostParams,
  ): Promise<PostEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    // Ensure editor is author or admin
    if (post.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to edit this coordinates log.');
    }

    if (params.title !== undefined) post.title = params.title;
    if (params.content !== undefined) post.content = params.content;
    if (params.category !== undefined) post.category = params.category;
    if (params.visibility !== undefined) post.visibility = params.visibility;
    if (params.locationName !== undefined) post.locationName = params.locationName;
    if (params.locationLat !== undefined) post.locationLat = params.locationLat;
    if (params.locationLon !== undefined) post.locationLon = params.locationLon;

    const updated = await this.postRepository.save(post);
    this.eventDispatcher.dispatchPostUpdated(updated);
    return updated;
  }

  /**
   * Delete post and clean up uploaded media files to prevent storage leak.
   */
  async deletePost(userId: string, userRole: UserRole, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    // Ensure permissions
    if (post.authorId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this coordinates log.');
    }

    // Clean up images from Cloudinary
    if (post.imagePublicIds && post.imagePublicIds.length > 0) {
      for (const publicId of post.imagePublicIds) {
        try {
          await this.storageService.deleteFile(publicId);
        } catch (err: any) {
          this.logger.warn(`Failed to delete Cloudinary image asset ${publicId} on post delete: ${err.message}`);
        }
      }
    }

    // Clean up voice notes from Cloudinary
    if (post.audioPublicId) {
      try {
        await this.storageService.deleteFile(post.audioPublicId);
      } catch (err: any) {
        this.logger.warn(`Failed to delete Cloudinary audio asset ${post.audioPublicId} on post delete: ${err.message}`);
      }
    }

    await this.postRepository.delete(postId);
    this.eventDispatcher.dispatchPostDeleted(postId, post.authorId);
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const state = await this.interactionRepository.getUserPostState(userId, postId);
    if (state?.hasLiked) {
      return; // Already liked
    }

    await this.interactionRepository.addLike(new PostLikeEntity({
      id: randomUUID(),
      userId,
      postId,
    }));
    await this.interactionRepository.upsertUserPostState(userId, postId, { hasLiked: true });
    await this.postRepository.incrementLikes(postId);

    // Track interaction for personalization
    await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.LIKE);
    this.eventDispatcher.dispatchLikeAdded(postId, userId, post.category);
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const state = await this.interactionRepository.getUserPostState(userId, postId);
    if (!state || !state.hasLiked) return; // Not liked

    await this.interactionRepository.removeLike(postId, userId);
    await this.interactionRepository.upsertUserPostState(userId, postId, { hasLiked: false });
    await this.postRepository.decrementLikes(postId);
    
    // Offset interest score by applying a negative view weight multiplier
    await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.LIKE, -1.0);
    this.eventDispatcher.dispatchLikeRemoved(postId, userId, post.category);
  }

  async savePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const state = await this.interactionRepository.getUserPostState(userId, postId);
    if (state?.hasSaved) {
      return; // Already saved
    }

    await this.interactionRepository.saveSave(new PostSaveEntity({
      id: randomUUID(),
      userId,
      postId,
    }));
    await this.interactionRepository.upsertUserPostState(userId, postId, { hasSaved: true });
    await this.postRepository.incrementSaves(postId);

    await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.SAVE);
    this.eventDispatcher.dispatchSaveAdded(postId, userId, post.category);
  }

  async unsavePost(userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const state = await this.interactionRepository.getUserPostState(userId, postId);
    if (!state || !state.hasSaved) return; // Not saved

    await this.interactionRepository.deleteSave(postId, userId);
    await this.interactionRepository.upsertUserPostState(userId, postId, { hasSaved: false });
    await this.postRepository.decrementSaves(postId);
    await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.SAVE, -1.0);
    this.eventDispatcher.dispatchSaveRemoved(postId, userId, post.category);
  }

  /**
   * Add a comment to a post.
   */
  async addComment(userId: string, postId: string, content: string): Promise<PostCommentEntity> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    const comment = new PostCommentEntity({
      id: randomUUID(),
      postId,
      userId,
      content,
    });
    const saved = await this.interactionRepository.addComment(comment);
    await this.postRepository.incrementComments(postId);

    await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.COMMENT);
    this.eventDispatcher.dispatchCommentAdded(postId, userId, saved.id, post.category);

    return saved;
  }

  /**
   * Get comments with stitched user profile details.
   */
  async getComments(postId: string): Promise<any[]> {
    const comments = await this.interactionRepository.getComments(postId);
    const authorIds = [...new Set(comments.map((c) => c.userId))];

    const profilesMap = new Map<string, any>();
    for (const id of authorIds) {
      const profile = await this.userRepository.findByUserId(id);
      if (profile) {
        profilesMap.set(id, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        });
      }
    }

    return comments.map((c) => {
      const profile = profilesMap.get(c.userId) || {
        username: 'unknown',
        displayName: 'Wanderer',
        avatarUrl: null,
      };
      return {
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.userId,
          ...profile,
        },
      };
    });
  }

  /**
   * Track sharing event.
   */
  async trackShare(userId: string | null, postId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    await this.postRepository.incrementShares(postId);

    if (userId) {
      await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.SHARE);
      this.eventDispatcher.dispatchShareAdded(postId, userId, post.category);
    }
  }

  async trackView(
    userId: string | null, 
    postId: string, 
    data: { feedSessionId?: string, durationMs?: number, lastVisiblePercent?: number, sourceFeed?: string } = {}
  ): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    if (userId) {
      const duration = (data.durationMs || 1500) / 1000;
      await this.interactionRepository.addImpression(new FeedImpressionEntity({
        id: randomUUID(),
        userId,
        postId,
        feedSessionId: data.feedSessionId,
        sourceFeed: data.sourceFeed || 'global',
        lastVisiblePercent: data.lastVisiblePercent || 100,
        totalVisibleDurationMs: data.durationMs || 1500,
        completedViews: data.durationMs && data.durationMs > 3000 ? 1 : 0
      }));
      await this.interactionRepository.upsertUserPostState(userId, postId, { viewCount: 1, totalVisibleTime: duration });
      await this.interestEngine.recordInteraction(userId, postId, post.authorId, post.category, InteractionType.VIEW);
    }
  }
}
