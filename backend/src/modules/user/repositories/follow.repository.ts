import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { randomUUID } from 'crypto';
import { FollowEntity } from '../entities/follow.entity';
import { UserProfileEntity } from '../entities/user-profile.entity';

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(FollowEntity)
    private readonly followRepo: Repository<FollowEntity>,
  ) {}

  async findOne(followerId: string, followingId: string): Promise<FollowEntity | null> {
    return this.followRepo.findOne({
      where: { followerId, followingId },
    });
  }

  async createFollow(followerId: string, followingId: string): Promise<FollowEntity> {
    const follow = this.followRepo.create({
      id: randomUUID(),
      followerId,
      followingId,
    });
    return this.followRepo.save(follow);
  }

  async deleteFollow(followerId: string, followingId: string): Promise<void> {
    await this.followRepo.delete({ followerId, followingId });
  }

  async getFollowers(
    followingId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: { follow: FollowEntity; profile: UserProfileEntity }[]; nextCursor?: string }> {
    const query = this.followRepo
      .createQueryBuilder('follow')
      .innerJoinAndMapOne('follow.profile', UserProfileEntity, 'profile', 'follow.followerId = profile.userId')
      .where('follow.followingId = :followingId', { followingId });

    if (search && search.trim() !== '') {
      const searchClean = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.username) LIKE :searchClean OR LOWER(profile.displayName) LIKE :searchClean)',
        { searchClean },
      );
    }

    if (cursor) {
      query.andWhere('follow.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    query.orderBy('follow.createdAt', 'DESC').limit(limit + 1);

    const follows = await query.getMany();
    let nextCursor: string | undefined;

    if (follows.length > limit) {
      const lastItem = follows[limit - 1];
      nextCursor = lastItem.createdAt.toISOString();
      follows.pop();
    }

    const items = follows.map((f) => ({
      follow: f,
      profile: (f as any).profile as UserProfileEntity,
    }));

    return { items, nextCursor };
  }

  async getFollowing(
    followerId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: { follow: FollowEntity; profile: UserProfileEntity }[]; nextCursor?: string }> {
    const query = this.followRepo
      .createQueryBuilder('follow')
      .innerJoinAndMapOne('follow.profile', UserProfileEntity, 'profile', 'follow.followingId = profile.userId')
      .where('follow.followerId = :followerId', { followerId });

    if (search && search.trim() !== '') {
      const searchClean = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.username) LIKE :searchClean OR LOWER(profile.displayName) LIKE :searchClean)',
        { searchClean },
      );
    }

    if (cursor) {
      query.andWhere('follow.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    query.orderBy('follow.createdAt', 'DESC').limit(limit + 1);

    const follows = await query.getMany();
    let nextCursor: string | undefined;

    if (follows.length > limit) {
      const lastItem = follows[limit - 1];
      nextCursor = lastItem.createdAt.toISOString();
      follows.pop();
    }

    const items = follows.map((f) => ({
      follow: f,
      profile: (f as any).profile as UserProfileEntity,
    }));

    return { items, nextCursor };
  }

  async getMutualFollows(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: { follow: FollowEntity; profile: UserProfileEntity }[]; nextCursor?: string }> {
    const query = this.followRepo
      .createQueryBuilder('f1')
      .innerJoin(FollowEntity, 'f2', 'f1.followingId = f2.followerId AND f1.followerId = f2.followingId')
      .innerJoinAndMapOne('f1.profile', UserProfileEntity, 'profile', 'f1.followingId = profile.userId')
      .leftJoin('user_privacy_relations', 'privacy', '((privacy.userId = :userId AND privacy.targetUserId = f1.followingId) OR (privacy.userId = f1.followingId AND privacy.targetUserId = :userId)) AND privacy.isBlocked = :isBlocked', { userId, isBlocked: true })
      .where('f1.followerId = :userId', { userId })
      .andWhere('privacy.id IS NULL');

    if (search && search.trim() !== '') {
      const searchClean = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.username) LIKE :searchClean OR LOWER(profile.displayName) LIKE :searchClean)',
        { searchClean },
      );
    }

    if (cursor) {
      query.andWhere('f1.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    query.orderBy('f1.createdAt', 'DESC').limit(limit + 1);

    const follows = await query.getMany();
    let nextCursor: string | undefined;

    if (follows.length > limit) {
      const lastItem = follows[limit - 1];
      nextCursor = lastItem.createdAt.toISOString();
      follows.pop();
    }

    const items = follows.map((f) => ({
      follow: f,
      profile: (f as any).profile as UserProfileEntity,
    }));

    return { items, nextCursor };
  }

  async getIncomingRequests(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: { follow: FollowEntity; profile: UserProfileEntity }[]; nextCursor?: string }> {
    const query = this.followRepo
      .createQueryBuilder('f1')
      .leftJoin(FollowEntity, 'f2', 'f1.followerId = f2.followingId AND f1.followingId = f2.followerId')
      .innerJoinAndMapOne('f1.profile', UserProfileEntity, 'profile', 'f1.followerId = profile.userId')
      .leftJoin('user_privacy_relations', 'privacy', '((privacy.userId = :userId AND privacy.targetUserId = f1.followerId) OR (privacy.userId = f1.followerId AND privacy.targetUserId = :userId)) AND privacy.isBlocked = :isBlocked', { userId, isBlocked: true })
      .where('f1.followingId = :userId', { userId })
      .andWhere('f2.id IS NULL')
      .andWhere('privacy.id IS NULL');

    if (search && search.trim() !== '') {
      const searchClean = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.username) LIKE :searchClean OR LOWER(profile.displayName) LIKE :searchClean)',
        { searchClean },
      );
    }

    if (cursor) {
      query.andWhere('f1.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    query.orderBy('f1.createdAt', 'DESC').limit(limit + 1);

    const follows = await query.getMany();
    let nextCursor: string | undefined;

    if (follows.length > limit) {
      const lastItem = follows[limit - 1];
      nextCursor = lastItem.createdAt.toISOString();
      follows.pop();
    }

    const items = follows.map((f) => ({
      follow: f,
      profile: (f as any).profile as UserProfileEntity,
    }));

    return { items, nextCursor };
  }

  async getOutgoingRequests(
    userId: string,
    limit: number,
    cursor?: string,
    search?: string,
  ): Promise<{ items: { follow: FollowEntity; profile: UserProfileEntity }[]; nextCursor?: string }> {
    const query = this.followRepo
      .createQueryBuilder('f1')
      .leftJoin(FollowEntity, 'f2', 'f1.followingId = f2.followerId AND f1.followerId = f2.followingId')
      .innerJoinAndMapOne('f1.profile', UserProfileEntity, 'profile', 'f1.followingId = profile.userId')
      .leftJoin('user_privacy_relations', 'privacy', '((privacy.userId = :userId AND privacy.targetUserId = f1.followingId) OR (privacy.userId = f1.followingId AND privacy.targetUserId = :userId)) AND privacy.isBlocked = :isBlocked', { userId, isBlocked: true })
      .where('f1.followerId = :userId', { userId })
      .andWhere('f2.id IS NULL')
      .andWhere('privacy.id IS NULL');

    if (search && search.trim() !== '') {
      const searchClean = `%${search.trim().toLowerCase()}%`;
      query.andWhere(
        '(LOWER(profile.username) LIKE :searchClean OR LOWER(profile.displayName) LIKE :searchClean)',
        { searchClean },
      );
    }

    if (cursor) {
      query.andWhere('f1.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    query.orderBy('f1.createdAt', 'DESC').limit(limit + 1);

    const follows = await query.getMany();
    let nextCursor: string | undefined;

    if (follows.length > limit) {
      const lastItem = follows[limit - 1];
      nextCursor = lastItem.createdAt.toISOString();
      follows.pop();
    }

    const items = follows.map((f) => ({
      follow: f,
      profile: (f as any).profile as UserProfileEntity,
    }));

    return { items, nextCursor };
  }
}
