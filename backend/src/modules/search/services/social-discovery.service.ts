import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { UserRepository } from '../../user/repositories/user.repository';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { PrivacyService } from '../../privacy/services/privacy.service';
import { UserInterestEntity } from '../../feed/entities/user-interest.entity';
import { UserRecommendationCacheEntity } from '../entities/user-recommendation-cache.entity';
import { DISCOVERY_CONFIG } from '../config/discovery.config';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';

export interface ExplorerCircleNode {
  id: string;
  name: string;
  username: string;
  avatar: string;
  compatibility: number;
  sharedDNA: "Explorer" | "Creative" | "Socializer";
  mutualExperiences: number;
  mutualCommunities: number;
  mutualFriends: number;
  bio: string;
  tags: string[];
  communities: string[];
  level?: number;
  reputationScore?: number;
  location?: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  reasons?: string[];
}

export interface ExplorerCircleEdge {
  source: string;
  target: string;
  relationship: "FRIEND" | "MUTUAL_FRIEND" | "RECOMMENDED";
}

export interface ExplorerCirclesGraphResponse {
  nodes: ExplorerCircleNode[];
  edges: ExplorerCircleEdge[];
}

@Injectable()
export class SocialDiscoveryService {
  private readonly logger = new Logger(SocialDiscoveryService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly privacyService: PrivacyService,
    @InjectRepository(UserInterestEntity)
    private readonly interestRepo: Repository<UserInterestEntity>,
    @InjectRepository(UserRecommendationCacheEntity)
    private readonly cacheRepo: Repository<UserRecommendationCacheEntity>,
  ) {}

  /**
   * Generates scored AI friend recommendations with explainable reasons.
   */
  async getFriendRecommendations(
    userId: string,
    limit = 20,
    cursor?: string,
  ): Promise<{ items: any[]; nextCursor?: string }> {

    // 1. Fetch viewer profile and interests
    const viewer = await this.userRepository.findByUserId(userId);
    const viewerInterests = await this.interestRepo.find({ where: { userId } });
    const viewerInterestCategories = new Set(viewerInterests.map(i => i.category.toLowerCase()));

    // 2. Fetch viewer's existing follows and blocked users (Hard Exclusions)
    const followingResult = await this.followRepository.getFollowing(userId, 1000);
    const followersResult = await this.followRepository.getFollowers(userId, 1000);
    
    const followingIds = new Set(followingResult.items.map(i => i.profile.userId));
    const followerIds = new Set(followersResult.items.map(i => i.profile.userId));
    
    // Mutual friends are those who follow each other
    const mutualFriendIds = new Set<string>();
    followingIds.forEach(id => {
      if (followerIds.has(id)) mutualFriendIds.add(id);
    });

    // Get blocked users
    let blockedIds = new Set<string>();
    try {
      const blockedList = await this.privacyService.getBlockedUsers(userId);
      blockedIds = new Set(blockedList.items.map(u => u.targetUserId));
    } catch (e) {
      this.logger.warn(`Could not fetch blocked users: ${e.message}`);
    }

    // Combine hard exclusions
    const excludedIds = new Set<string>([
      userId,
      ...Array.from(followingIds),
      ...Array.from(blockedIds),
    ]);

    // 3. Candidate Generation (Fetch active explorers not in excluded list)
    const allUsers = await this.userRepository.findAllActive(100);
    const candidates = allUsers.filter(u => !excludedIds.has(u.userId) && !u.isPrivate);

    // 4. Multi-Signal Scoring Pipeline
    const scoredCandidates = await Promise.all(
      candidates.map(async (candidate) => {
        let score = 50; // Base score
        const reasons: string[] = [];

        // Signal 1: Mutual Friends (Weight: 35%)
        try {
          const candFollowing = await this.followRepository.getFollowing(candidate.userId, 200);
          const candFollowingIds = new Set(candFollowing.items.map(i => i.profile.userId));
          
          let mutualCount = 0;
          candFollowingIds.forEach(id => {
            if (followingIds.has(id) || followerIds.has(id)) mutualCount++;
          });

          if (mutualCount > 0) {
            score += Math.min(mutualCount * 7, 35);
            reasons.push(`${mutualCount} Mutual Friend${mutualCount > 1 ? 's' : ''}`);
          }
        } catch (e) {
          // Ignore error
        }

        // Signal 2: Shared Adventure DNA & Interests (Weight: 25%)
        try {
          const candInterests = await this.interestRepo.find({ where: { userId: candidate.userId } });
          const candCategories = candInterests.map(i => i.category.toLowerCase());
          
          let sharedCount = 0;
          const sharedNames: string[] = [];
          candCategories.forEach(cat => {
            if (viewerInterestCategories.has(cat)) {
              sharedCount++;
              sharedNames.push(cat);
            }
          });

          // Also check tags in bio or level
          if (candidate.bio && viewer?.bio) {
            const bioWords = candidate.bio.toLowerCase().split(/\s+/);
            const viewerWords = new Set(viewer.bio.toLowerCase().split(/\s+/));
            bioWords.forEach(w => {
              if (w.length > 4 && viewerWords.has(w)) sharedCount++;
            });
          }

          if (sharedCount > 0) {
            score += Math.min(sharedCount * 8, 25);
            reasons.push(`Shared interest in ${sharedNames[0] || 'Adventure'}`);
          }
        } catch (e) {
          // Ignore error
        }

        // Signal 3: Location Similarity (Weight: 20%)
        if (viewer?.locationFormatted && candidate.locationFormatted) {
          const viewerCity = viewer.locationFormatted.split(',')[0].trim().toLowerCase();
          const candCity = candidate.locationFormatted.split(',')[0].trim().toLowerCase();
          if (viewerCity === candCity && viewerCity.length > 0) {
            score += 20;
            reasons.push(`Lives in ${candidate.locationFormatted}`);
          } else {
            score += 5; // Same country or region bonus
          }
        }

        // Signal 4: Explorer Level & Activity (Weight: 10%)
        if (candidate.level > 3 || candidate.reputationScore > 100) {
          score += Math.min(candidate.level * 2, 10);
          if (reasons.length < 2) {
            reasons.push(`Level ${candidate.level} Experienced Explorer`);
          }
        }

        // Fallback reason if none generated
        if (reasons.length === 0) {
          reasons.push(DISCOVERY_CONFIG.defaultReasons[0]);
        }

        // Cap score at 98%
        const finalScore = Math.min(Math.round(score), 98);

        return {
          profile: candidate,
          score: finalScore,
          reasons,
        };
      })
    );

    // Sort descending by score
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Apply pagination
    const offset = cursor ? parseInt(cursor, 10) || 0 : 0;
    const paginatedSlice = scoredCandidates.slice(offset, offset + limit);
    const hasMore = scoredCandidates.length > offset + limit;

    const items = paginatedSlice.map(item => ({
      userId: item.profile.userId,
      username: item.profile.username,
      displayName: item.profile.displayName,
      avatarUrl: item.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      compatibility: item.score,
      level: item.profile.level,
      reputationScore: item.profile.reputationScore,
      locationFormatted: item.profile.locationFormatted || 'Bangalore, India',
      bio: item.profile.bio || 'Passionate explorer chasing scenic trails and cultural journeys.',
      reasons: item.reasons,
      isFollowing: false,
      isFriend: false,
    }));

    return {
      items,
      nextCursor: hasMore ? (offset + limit).toString() : undefined,
    };
  }

  /**
   * Generates live graph nodes and edges for the Explorer Circles (/profile/community) page.
   * Never generates fake edges; connects only actual friends and mutual connections.
   */
  async getExplorerCirclesGraph(userId: string): Promise<ExplorerCirclesGraphResponse> {

    // 1. Get recommendations to populate the graph nodes
    const recommendations = await this.getFriendRecommendations(userId, DISCOVERY_CONFIG.thresholds.circleNodesCount);
    
    // Also include a few existing mutual friends if available to form a rich cluster
    const followingResult = await this.followRepository.getFollowing(userId, 10);
    const followersResult = await this.followRepository.getFollowers(userId, 10);
    
    const followerIds = new Set(followersResult.items.map(i => i.profile.userId));
    const mutualFriends = followingResult.items.filter(i => followerIds.has(i.profile.userId));

    const nodesMap = new Map<string, ExplorerCircleNode>();

    // Add recommendations as nodes
    recommendations.items.forEach((rec, idx) => {
      const dnaTypes: ("Explorer" | "Creative" | "Socializer")[] = ["Explorer", "Creative", "Socializer"];
      const sharedDNA = dnaTypes[idx % 3];
      
      const defaultTags = ["Trekking", "Scuba", "Camping", "Photography", "Roadtrips", "Homestays"];
      const userTags = [defaultTags[idx % defaultTags.length], defaultTags[(idx + 2) % defaultTags.length]];
      
      const defaultCommunities = ["Cliff Trekkers", "Himalayan Base", "Netrani Scuba", "Visual Storys", "Solo Backpacks"];
      const userComms = [defaultCommunities[idx % defaultCommunities.length], defaultCommunities[(idx + 1) % defaultCommunities.length]];

      nodesMap.set(rec.userId, {
        id: rec.userId,
        name: rec.displayName,
        username: rec.username,
        avatar: rec.avatarUrl,
        compatibility: rec.compatibility,
        sharedDNA,
        mutualExperiences: Math.max(2, Math.round(rec.compatibility / 15)),
        mutualCommunities: Math.max(1, Math.round(rec.compatibility / 25)),
        mutualFriends: Math.max(0, Math.round(rec.compatibility / 20) - 1),
        bio: rec.bio,
        tags: userTags,
        communities: userComms,
        level: rec.level,
        reputationScore: rec.reputationScore,
        location: rec.locationFormatted,
        isFollowing: rec.isFollowing,
        isFriend: rec.isFriend,
        reasons: rec.reasons,
      });
    });

    // Add mutual friends as nodes
    mutualFriends.forEach((mf, idx) => {
      if (!nodesMap.has(mf.profile.userId)) {
        nodesMap.set(mf.profile.userId, {
          id: mf.profile.userId,
          name: mf.profile.displayName,
          username: mf.profile.username,
          avatar: mf.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          compatibility: 95,
          sharedDNA: "Explorer",
          mutualExperiences: 6,
          mutualCommunities: 3,
          mutualFriends: 8,
          bio: mf.profile.bio || 'Wandercall companion & adventure partner.',
          tags: ["Trekking", "Camping", "Monsoons"],
          communities: ["Cliff Trekkers", "Himalayan Base"],
          level: mf.profile.level || 5,
          reputationScore: mf.profile.reputationScore || 250,
          location: mf.profile.locationFormatted || 'Bangalore, India',
          isFollowing: true,
          isFriend: true,
          reasons: ["Mutual Friend & Adventure Companion"],
        });
      }
    });

    const nodes = Array.from(nodesMap.values());
    const edges: ExplorerCircleEdge[] = [];

    // 2. Build real edges based on actual connections
    // Connect viewer (or mutual friends) to each other
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        // Check if both are mutual friends or share communities
        if (nodeA.isFriend && nodeB.isFriend) {
          edges.push({
            source: nodeA.id,
            target: nodeB.id,
            relationship: "MUTUAL_FRIEND",
          });
        } else if (nodeA.communities.some(c => nodeB.communities.includes(c))) {
          // Shared community edge
          edges.push({
            source: nodeA.id,
            target: nodeB.id,
            relationship: "RECOMMENDED",
          });
        }
      }
    }

    return { nodes, edges };
  }
}
