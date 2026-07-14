import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { FollowService } from '../../user/services/follow.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { FollowerPreviewDto } from '../../user/dto/follower-preview.dto';

@Injectable()
export class FriendService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly followService: FollowService,
    private readonly userRepository: UserRepository,
  ) {}

  private mapToPreviewDto(profile: any): FollowerPreviewDto {
    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      compatibility: 90, // Future: Use compatibility engine
    };
  }

  async getFriendsList(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const { items, nextCursor } = await this.followRepository.getMutualFollows(
      userId,
      limit,
      cursor,
      search,
    );
    return {
      items: items.map((item) => this.mapToPreviewDto(item.profile)),
      nextCursor,
    };
  }

  async getPendingIncoming(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const { items, nextCursor } =
      await this.followRepository.getIncomingRequests(
        userId,
        limit,
        cursor,
        search,
      );
    return {
      items: items.map((item) => this.mapToPreviewDto(item.profile)),
      nextCursor,
    };
  }

  async getPendingOutgoing(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const { items, nextCursor } =
      await this.followRepository.getOutgoingRequests(
        userId,
        limit,
        cursor,
        search,
      );
    return {
      items: items.map((item) => this.mapToPreviewDto(item.profile)),
      nextCursor,
    };
  }

  async followBack(userId: string, targetUsername: string) {
    // Uses the FollowService to create the mutual follow, which effectively creates the Friendship.
    return this.followService.followUser(userId, targetUsername);
  }

  async removeRequest(userId: string, targetUsername: string) {
    // Reject incoming or cancel outgoing
    return this.followService.unfollowUser(userId, targetUsername);
  }
}
