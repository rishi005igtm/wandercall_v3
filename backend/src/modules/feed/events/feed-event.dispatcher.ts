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
    this.emit('post.created', { post });
  }

  dispatchPostPublished(post: PostEntity) {
    this.emit('post.published', { post });
  }

  dispatchPostDeleted(postId: string, authorId: string) {
    this.emit('post.deleted', { postId, authorId });
  }

  dispatchPostUpdated(post: PostEntity) {
    this.emit('post.updated', { post });
  }

  dispatchLikeAdded(postId: string, userId: string, category: string) {
    this.emit('like.added', { postId, userId, category });
  }

  dispatchLikeRemoved(postId: string, userId: string, category: string) {
    this.emit('like.removed', { postId, userId, category });
  }

  dispatchSaveAdded(postId: string, userId: string, category: string) {
    this.emit('save.added', { postId, userId, category });
  }

  dispatchSaveRemoved(postId: string, userId: string, category: string) {
    this.emit('save.removed', { postId, userId, category });
  }

  dispatchCommentAdded(postId: string, userId: string, commentId: string, category: string) {
    this.emit('comment.added', { postId, userId, commentId, category });
  }

  dispatchShareAdded(postId: string, userId: string, category: string) {
    this.emit('share.added', { postId, userId, category });
  }
}
