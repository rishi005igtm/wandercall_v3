import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { CreatePostRequestDto } from '../dto/create-post-request.dto';
import { UpdatePostRequestDto } from '../dto/update-post-request.dto';
import { FeedQueryDto } from '../dto/feed-query.dto';
import { CommentRequestDto } from '../dto/comment-request.dto';
import { PostService } from '../services/post.service';
import { RecommendationEngine } from '../services/recommendation.engine';

@Controller('feed')
export class FeedController {
  constructor(
    private readonly postService: PostService,
    private readonly recommendationEngine: RecommendationEngine,
  ) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Wandercall Recommendation Feed Engine',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieve personalized feed with cursor pagination
   */
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getFeed(@Query() query: FeedQueryDto, @Req() req: any) {
    const userId = req.user?.userId || null;
    return this.recommendationEngine.getPersonalizedFeed(userId, query);
  }

  /**
   * Retrieve specific user feed with cursor pagination
   */
  @Get('user/:username')
  @UseGuards(OptionalJwtAuthGuard)
  async getUserFeed(
    @Param('username') username: string,
    @Query() query: FeedQueryDto,
    @Req() req: any,
  ) {
    const viewerId = req.user?.userId || null;
    return this.recommendationEngine.getUserFeed(viewerId, username, query);
  }

  /**
   * Create a post (form-data multipart to support up to 4 images and 1 voice snap)
   */
  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 4 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createPost(
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    },
    @Body() dto: CreatePostRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Stitch audio file correctly (extract first element from the files list array)
    const audioFile = files?.audio?.[0] || undefined;
    const imagesFiles = files?.images || [];

    const post = await this.postService.createPost(
      userId,
      userRole,
      dto,
      { images: imagesFiles, audio: audioFile },
    );

    return {
      success: true,
      message: 'Adventure post published successfully.',
      postId: post.id,
      post,
    };
  }

  /**
   * Edit post metadata
   */
  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  async editPost(
    @Param('id') id: string,
    @Body() dto: UpdatePostRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const post = await this.postService.editPost(userId, userRole, id, dto);
    return {
      success: true,
      message: 'Post updated successfully.',
      post,
    };
  }

  /**
   * Delete post
   */
  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    await this.postService.deletePost(userId, userRole, id);
    return {
      success: true,
      message: 'Post deleted successfully.',
    };
  }

  /**
   * Like post
   */
  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async likePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    await this.postService.likePost(userId, id);
    return { success: true, message: 'Post liked.' };
  }

  /**
   * Unlike post
   */
  @Delete('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unlikePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    await this.postService.unlikePost(userId, id);
    return { success: true, message: 'Post unliked.' };
  }

  /**
   * Save post
   */
  @Post('posts/:id/save')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async savePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    await this.postService.savePost(userId, id);
    return { success: true, message: 'Post saved to bookmarks.' };
  }

  /**
   * Unsave post
   */
  @Delete('posts/:id/save')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unsavePost(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    await this.postService.unsavePost(userId, id);
    return { success: true, message: 'Post removed from bookmarks.' };
  }

  /**
   * Add comment to post
   */
  @Post('posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('id') id: string,
    @Body() dto: CommentRequestDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const comment = await this.postService.addComment(userId, id, dto.content);
    return {
      success: true,
      message: 'Comment added.',
      comment,
    };
  }

  /**
   * Retrieve comments of a post
   */
  @Get('posts/:id/comments')
  async getComments(@Param('id') id: string) {
    const comments = await this.postService.getComments(id);
    return { success: true, comments };
  }

  /**
   * Track share event
   */
  @Post('posts/:id/share')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async trackShare(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || null;
    await this.postService.trackShare(userId, id);
    return { success: true, message: 'Share interaction recorded.' };
  }

  /**
   * Track viewed impression
   */
  @Post('posts/:id/view')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async trackView(
    @Param('id') id: string, 
    @Req() req: any,
    @Body() body: { feedSessionId?: string, durationMs?: number, lastVisiblePercent?: number, sourceFeed?: string }
  ) {
    const userId = req.user?.userId || null;
    await this.postService.trackView(userId, id, body);
    return { success: true, message: 'View impression recorded.' };
  }
}
