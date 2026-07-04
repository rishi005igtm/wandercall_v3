import { Controller, Get, Post, Delete, Patch, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { FriendService } from '../services/friend.service';
import { FavoriteFriendService } from '../services/favorite-friend.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FollowerPreviewDto } from '../../user/dto/follower-preview.dto';
import { RelationshipResponseDto } from '../../user/dto/relationship-response.dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendController {
  constructor(
    private readonly friendService: FriendService,
    private readonly favoriteService: FavoriteFriendService,
  ) {}

  @Get()
  async getFriends(
    @Req() req: any,
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    return this.friendService.getFriendsList(req.user.userId, parseInt(limit, 10), cursor, search);
  }

  @Get('favorites')
  async getFavorites(@Req() req: any) {
    return this.favoriteService.getFavorites(req.user.userId);
  }

  @Post('favorites/:friendId')
  async addFavorite(@Req() req: any, @Param('friendId') friendId: string) {
    return this.favoriteService.addFavorite(req.user.userId, friendId);
  }

  @Delete('favorites/:friendId')
  @HttpCode(HttpStatus.OK)
  async removeFavorite(@Req() req: any, @Param('friendId') friendId: string) {
    return this.favoriteService.removeFavorite(req.user.userId, friendId);
  }

  @Patch('favorites/order')
  async reorderFavorites(@Req() req: any, @Body('orderedIds') orderedIds: string[]) {
    return this.favoriteService.reorderFavorites(req.user.userId, orderedIds);
  }

  @Get('pending/incoming')
  async getPendingIncoming(
    @Req() req: any,
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    return this.friendService.getPendingIncoming(req.user.userId, parseInt(limit, 10), cursor, search);
  }

  @Get('pending/outgoing')
  async getPendingOutgoing(
    @Req() req: any,
    @Query('limit') limit = '10',
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    return this.friendService.getPendingOutgoing(req.user.userId, parseInt(limit, 10), cursor, search);
  }

  @Post('follow-back/:username')
  @HttpCode(HttpStatus.OK)
  async followBack(
    @Req() req: any,
    @Param('username') username: string,
  ): Promise<RelationshipResponseDto> {
    return this.friendService.followBack(req.user.userId, username);
  }

  @Delete('request/:username')
  @HttpCode(HttpStatus.OK)
  async removeRequest(
    @Req() req: any,
    @Param('username') username: string,
  ): Promise<RelationshipResponseDto> {
    return this.friendService.removeRequest(req.user.userId, username);
  }
}
