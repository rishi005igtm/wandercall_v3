import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class FeedEventDispatcher extends EventEmitter {
  private readonly logger = new Logger(FeedEventDispatcher.name);

  constructor() {
    super();
  }

  dispatchPostCreated(post: PostEntity) {
    this.logger.log(`Event [PostCreated]: Post ID ${post.id} by author ${post.authorId}`);
    this.emit('post.created', { post });
  }

  dispatchPostPublished(post: PostEntity) {
    this.logger.log(`Event [PostPublished]: Post ID ${post.id} is now published`);
    this.emit('post.published', { post });
  }

  dispatchPostDeleted(postId: string, authorId: string) {
    this.logger.log(`Event [PostDeleted]: Post ID ${postId} removed by author ${authorId}`);
    this.emit('post.deleted', { postId, authorId });
  }

  dispatchPostUpdated(post: PostEntity) {
    this.logger.log(`Event [PostUpdated]: Post ID ${post.id} updated`);
    this.emit('post.updated', { post });
  }

  dispatchLikeAdded(postId: string, userId: string, category: string) {
    this.logger.log(`Event [LikeAdded]: User ${userId} liked Post ${postId}`);
    this.emit('like.added', { postId, userId, category });
  }

  dispatchLikeRemoved(postId: string, userId: string, category: string) {
    this.logger.log(`Event [LikeRemoved]: User ${userId} unliked Post ${postId}`);
    this.emit('like.removed', { postId, userId, category });
  }

  dispatchSaveAdded(postId: string, userId: string, category: string) {
    this.logger.log(`Event [SaveAdded]: User ${userId} saved Post ${postId}`);
    this.emit('save.added', { postId, userId, category });
  }

  dispatchSaveRemoved(postId: string, userId: string, category: string) {
    this.logger.log(`Event [SaveRemoved]: User ${userId} unsaved Post ${postId}`);
    this.emit('save.removed', { postId, userId, category });
  }

  dispatchCommentAdded(postId: string, userId: string, commentId: string, category: string) {
    this.logger.log(`Event [CommentAdded]: User ${userId} commented on Post ${postId}`);
    this.emit('comment.added', { postId, userId, commentId, category });
  }

  dispatchShareAdded(postId: string, userId: string, category: string) {
    this.logger.log(`Event [ShareAdded]: User ${userId} shared Post ${postId}`);
    this.emit('share.added', { postId, userId, category });
  }
}
