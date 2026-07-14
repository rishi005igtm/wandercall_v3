import { Test, TestingModule } from '@nestjs/testing';
import { RankingEngine } from './ranking.engine';
import { RecommendationEngine } from './recommendation.engine';
import { InterestEngine } from './interest.engine';
import { PostRepository } from '../repositories/post.repository';
import { InteractionRepository } from '../repositories/interaction.repository';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import {
  PostEntity,
  PostStatus,
  PostVisibility,
  PostAuthorType,
} from '../entities/post.entity';

describe('Feed Recommendation & Ranking Suite', () => {
  let rankingEngine: RankingEngine;
  let recommendationEngine: RecommendationEngine;

  // Mock repositories
  const mockPostRepository = {
    getCandidates: jest.fn(),
  };

  const mockInteractionRepository = {
    getImpressions: jest.fn(),
  };

  const mockInterestEngine = {
    getUserInterestMap: jest.fn(),
  };

  const mockFollowRepository = {
    getFollowing: jest.fn(),
  };

  const mockUserRepository = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingEngine,
        RecommendationEngine,
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: InteractionRepository, useValue: mockInteractionRepository },
        { provide: InterestEngine, useValue: mockInterestEngine },
        { provide: FollowRepository, useValue: mockFollowRepository },
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    rankingEngine = module.get<RankingEngine>(RankingEngine);
    recommendationEngine =
      module.get<RecommendationEngine>(RecommendationEngine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('RankingEngine', () => {
    it('should correctly score a post incorporating freshness and engagement', () => {
      const now = new Date();
      const freshPost = new PostEntity({
        id: 'post-1',
        authorId: 'user-1',
        authorType: PostAuthorType.INDIVIDUAL,
        category: 'story',
        title: 'Triund Trek',
        likeCount: 10,
        commentCount: 2,
        saveCount: 1,
        shareCount: 0,
        aiQualityScore: 1.0,
        createdAt: now,
        publishedAt: now,
      });

      const score = rankingEngine.scorePost(freshPost, {
        viewerId: 'viewer-1',
        userInterests: { story: 5.0 },
        followedCreatorIds: new Set(['user-1']),
        impressionCounts: {},
      });

      expect(score).toBeGreaterThan(0);

      // Let's compare with an older post
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

      const oldPost = new PostEntity({
        id: 'post-2',
        authorId: 'user-1',
        authorType: PostAuthorType.INDIVIDUAL,
        category: 'story',
        title: 'Triund Trek Old',
        likeCount: 10,
        commentCount: 2,
        saveCount: 1,
        shareCount: 0,
        aiQualityScore: 1.0,
        createdAt: oldDate,
        publishedAt: oldDate,
      });

      const oldScore = rankingEngine.scorePost(oldPost, {
        viewerId: 'viewer-1',
        userInterests: { story: 5.0 },
        followedCreatorIds: new Set(['user-1']),
        impressionCounts: {},
      });

      expect(score).toBeGreaterThan(oldScore); // Fresh post should score higher
    });

    it('should apply Seen fatigue (Impression Penalty) to previously viewed posts', () => {
      const now = new Date();
      const post = new PostEntity({
        id: 'post-1',
        authorId: 'user-1',
        authorType: PostAuthorType.INDIVIDUAL,
        category: 'story',
        title: 'Triund Trek',
        likeCount: 5,
        commentCount: 0,
        saveCount: 0,
        shareCount: 0,
        aiQualityScore: 1.0,
        createdAt: now,
        publishedAt: now,
      });

      const unseenScore = rankingEngine.scorePost(post, {
        viewerId: 'viewer-1',
      });
      const seenScore = rankingEngine.scorePost(post, {
        viewerId: 'viewer-1',
        impressionCounts: { 'post-1': 1 },
      });

      expect(seenScore).toBeLessThan(unseenScore);
      expect(seenScore).toBeCloseTo(unseenScore * 0.2); // Penalty is 0.20
    });
  });

  describe('RecommendationEngine Feed Generation', () => {
    it('should query and return a ranked page of posts with cursor pagination', async () => {
      const now = new Date();
      const mockPosts = [
        new PostEntity({
          id: 'p-1',
          authorId: 'author-1',
          authorType: PostAuthorType.INDIVIDUAL,
          category: 'story',
          title: 'Title 1',
          likeCount: 100, // Very popular
          commentCount: 5,
          saveCount: 5,
          shareCount: 2,
          aiQualityScore: 1.2,
          publishedAt: now,
          createdAt: now,
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
        }),
        new PostEntity({
          id: 'p-2',
          authorId: 'author-2',
          authorType: PostAuthorType.HOST,
          category: 'food',
          title: 'Title 2',
          likeCount: 2, // Low popularity
          commentCount: 0,
          saveCount: 0,
          shareCount: 0,
          aiQualityScore: 1.0,
          publishedAt: now,
          createdAt: now,
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
        }),
      ];

      // Setup repository mock returns
      mockPostRepository.getCandidates.mockResolvedValue(mockPosts);
      mockInteractionRepository.getImpressions.mockResolvedValue([]);
      mockInterestEngine.getUserInterestMap.mockResolvedValue({ story: 5.0 });
      mockFollowRepository.getFollowing.mockResolvedValue({ items: [] });
      mockUserRepository.findByUserId.mockImplementation((id) => {
        return Promise.resolve({
          userId: id,
          username: `user_${id}`,
          displayName: `Display Name ${id}`,
          avatarUrl: `http://avatar/${id}`,
          level: 10,
        });
      });

      const result = await recommendationEngine.getPersonalizedFeed(
        'viewer-1',
        {
          feedType: 'global',
          limit: 1,
        },
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('p-1'); // The high popularity, high interest one must be first
      expect(result.nextCursor).toBeDefined();

      // Check cursor contains stable data
      const decodedCursor = JSON.parse(
        Buffer.from(result.nextCursor!, 'base64').toString('ascii'),
      );
      expect(decodedCursor.offset).toBe(1);
      expect(decodedCursor.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should inject diversity and demote consecutive identical creators', async () => {
      const now = new Date();
      // Generate 4 posts: 3 from same author-1, 1 from author-2
      const mockPosts = [
        new PostEntity({
          id: 'p-1',
          authorId: 'author-1',
          category: 'story',
          title: 'Author 1 post 1',
          likeCount: 50,
          publishedAt: now,
          createdAt: now,
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
        }),
        new PostEntity({
          id: 'p-2',
          authorId: 'author-1',
          category: 'story',
          title: 'Author 1 post 2',
          likeCount: 45, // Almost as popular
          publishedAt: now,
          createdAt: now,
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
        }),
        new PostEntity({
          id: 'p-3',
          authorId: 'author-2',
          category: 'food',
          title: 'Author 2 post 1',
          likeCount: 30, // Less popular than both
          publishedAt: now,
          createdAt: now,
          status: PostStatus.PUBLISHED,
          visibility: PostVisibility.PUBLIC,
        }),
      ];

      mockPostRepository.getCandidates.mockResolvedValue(mockPosts);
      mockInteractionRepository.getImpressions.mockResolvedValue([]);
      mockInterestEngine.getUserInterestMap.mockResolvedValue({});
      mockFollowRepository.getFollowing.mockResolvedValue({ items: [] });
      mockUserRepository.findByUserId.mockImplementation((id) =>
        Promise.resolve({ userId: id }),
      );

      const result = await recommendationEngine.getPersonalizedFeed(
        'viewer-1',
        {
          feedType: 'global',
          limit: 3,
        },
      );

      // Verification of diversity:
      // Index 0: p-1 (author-1, score = high)
      // Index 1 should be p-3 (author-2) instead of p-2 (author-1) because p-2 should be demoted since author-1 was shown immediately beforehand
      expect(result.items[0].id).toBe('p-1');
      expect(result.items[1].id).toBe('p-3'); // Diversity re-ranking injected creator diversity!
      expect(result.items[2].id).toBe('p-2');
    });
  });
});
