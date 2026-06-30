import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { FollowRepository } from '../repositories/follow.repository';
import { UserRepository } from '../repositories/user.repository';
import { FollowEntity } from '../entities/follow.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { RelationshipResponseDto } from '../dto/relationship-response.dto';
import { FollowerPreviewDto } from '../dto/follower-preview.dto';

@Injectable()
export class FollowService {
  private readonly logger = new Logger(FollowService.name);

  constructor(
    private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private calculateCompatibility(usernameA: string, usernameB: string): number {
    const combined = (usernameA + usernameB).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 30) + 70; // Deterministic compatibility score between 70% and 99%
  }

  async followUser(currentUserId: string, targetUsername: string): Promise<RelationshipResponseDto> {
    const startTime = Date.now();
    const targetProfile = await this.userRepository.findByUsername(targetUsername);
    if (!targetProfile) {
      this.logger.warn(`Follow request failed: target username '${targetUsername}' does not exist.`);
      throw new NotFoundException(`User with username '${targetUsername}' not found.`);
    }

    if (targetProfile.userId === currentUserId) {
      throw new BadRequestException('You cannot follow yourself.');
    }

    const existingFollow = await this.followRepository.findOne(currentUserId, targetProfile.userId);
    if (existingFollow) {
      throw new BadRequestException('You are already following this user.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const follow = manager.create(FollowEntity, {
          id: randomUUID(),
          followerId: currentUserId,
          followingId: targetProfile.userId,
        });
        await manager.save(FollowEntity, follow);
        await manager.increment(UserProfileEntity, { userId: targetProfile.userId }, 'followerCount', 1);
        await manager.increment(UserProfileEntity, { userId: currentUserId }, 'followingCount', 1);
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `User ${currentUserId} followed target user @${targetUsername} (${targetProfile.userId}) successfully in ${duration}ms. Counters synchronized.`,
      );

      return { state: 'Following' };
    } catch (error) {
      this.logger.error(`Database exception during follow action from ${currentUserId} to ${targetProfile.userId}`, error);
      throw error;
    }
  }

  async unfollowUser(currentUserId: string, targetUsername: string): Promise<RelationshipResponseDto> {
    const startTime = Date.now();
    const targetProfile = await this.userRepository.findByUsername(targetUsername);
    if (!targetProfile) {
      this.logger.warn(`Unfollow request failed: target username '${targetUsername}' does not exist.`);
      throw new NotFoundException(`User with username '${targetUsername}' not found.`);
    }

    if (targetProfile.userId === currentUserId) {
      throw new BadRequestException('You cannot unfollow yourself.');
    }

    const existingFollow = await this.followRepository.findOne(currentUserId, targetProfile.userId);
    if (!existingFollow) {
      throw new BadRequestException('You are not following this user.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.delete(FollowEntity, { followerId: currentUserId, followingId: targetProfile.userId });
        await manager.decrement(UserProfileEntity, { userId: targetProfile.userId }, 'followerCount', 1);
        await manager.decrement(UserProfileEntity, { userId: currentUserId }, 'followingCount', 1);
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `User ${currentUserId} unfollowed target user @${targetUsername} (${targetProfile.userId}) successfully in ${duration}ms. Counters synchronized.`,
      );

      return { state: 'Not Following' };
    } catch (error) {
      this.logger.error(`Database exception during unfollow action from ${currentUserId} to ${targetProfile.userId}`, error);
      throw error;
    }
  }

  async getRelationshipState(currentUserId: string | null, targetUsername: string): Promise<RelationshipResponseDto> {
    const targetProfile = await this.userRepository.findByUsername(targetUsername);
    if (!targetProfile) {
      throw new NotFoundException(`User with username '${targetUsername}' not found.`);
    }

    if (!currentUserId) {
      return { state: 'Not Following' };
    }

    if (targetProfile.userId === currentUserId) {
      return { state: 'Self' };
    }

    const isFollowing = await this.followRepository.findOne(currentUserId, targetProfile.userId);
    return { state: isFollowing ? 'Following' : 'Not Following' };
  }

  async getFollowers(
    targetUsername: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const targetProfile = await this.userRepository.findByUsername(targetUsername);
    if (!targetProfile) {
      throw new NotFoundException(`User with username '${targetUsername}' not found.`);
    }

    const { items, nextCursor } = await this.followRepository.getFollowers(
      targetProfile.userId,
      limit,
      cursor,
      search,
    );

    const mappedItems: FollowerPreviewDto[] = items.map(({ profile }) => ({
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      compatibility: this.calculateCompatibility(targetProfile.username, profile.username),
    }));

    return { items: mappedItems, nextCursor };
  }

  async getFollowing(
    targetUsername: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: FollowerPreviewDto[]; nextCursor?: string }> {
    const targetProfile = await this.userRepository.findByUsername(targetUsername);
    if (!targetProfile) {
      throw new NotFoundException(`User with username '${targetUsername}' not found.`);
    }

    const { items, nextCursor } = await this.followRepository.getFollowing(
      targetProfile.userId,
      limit,
      cursor,
      search,
    );

    const mappedItems: FollowerPreviewDto[] = items.map(({ profile }) => ({
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      compatibility: this.calculateCompatibility(targetProfile.username, profile.username),
    }));

    return { items: mappedItems, nextCursor };
  }
}
