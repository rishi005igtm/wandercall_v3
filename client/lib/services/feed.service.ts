import { httpClient } from '../api/httpClient';

export interface PostAuthor {
  id: string;
  type: 'INDIVIDUAL' | 'HOST' | 'OFFICIAL' | 'COMMUNITY';
  username: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  reputationScore?: number;
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface FeedPost {
  id: string;
  category: string;
  title: string;
  content?: string;
  images: string[];
  imagePublicIds: string[];
  audioUrl?: string;
  audioDuration?: number;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';
  status: 'DRAFT' | 'VALIDATING' | 'IMAGE_VERIFIED' | 'METADATA_GENERATED' | 'PUBLISHED' | 'FAILED';
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  aiQualityScore: number;
  isDeleted?: boolean;
  isArchived?: boolean;
  language?: string;
  countryCode?: string;
  cityId?: string;
  commentingEnabled?: boolean;
  allowRemix?: boolean;
  mediaAspectRatio?: string;
  primaryImage?: string;
  processingStatus?: string;
  rankingVersion?: string;
  publishedAt: string;
  createdAt: string;
  author: PostAuthor;
  recommendationScore: number;
  // Local interaction overrides
  hasLiked?: boolean;
  hasSaved?: boolean;
}

export interface FeedQueryFilters {
  feedType?: 'global' | 'following' | 'trending' | 'recent' | 'category' | 'saved' | 'host' | 'explore';
  category?: string;
  limit?: number;
  cursor?: string;
  feedSessionId?: string;
}

export interface FeedResponse {
  items: FeedPost[];
  nextCursor?: string;
}

export const feedService = {
  async getFeed(filters: FeedQueryFilters): Promise<FeedResponse> {
    const { data } = await httpClient.get<FeedResponse>('/feed', { params: filters });
    return data;
  },

  async getUserFeed(username: string, filters: FeedQueryFilters): Promise<FeedResponse> {
    const { data } = await httpClient.get<FeedResponse>(`/feed/user/${username}`, { params: filters });
    return data;
  },

  async createPost(formData: FormData): Promise<{ success: boolean; message: string; postId: string; post: FeedPost }> {
    const { data } = await httpClient.post<{ success: boolean; message: string; postId: string; post: FeedPost }> (
      '/feed/posts',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      }
    );
    return data;
  },

  async deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.delete<{ success: boolean; message: string }>(`/feed/posts/${postId}`);
    return data;
  },

  async likePost(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.post<{ success: boolean; message: string }>(`/feed/posts/${postId}/like`);
    return data;
  },

  async unlikePost(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.delete<{ success: boolean; message: string }>(`/feed/posts/${postId}/like`);
    return data;
  },

  async savePost(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.post<{ success: boolean; message: string }>(`/feed/posts/${postId}/save`);
    return data;
  },

  async unsavePost(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.delete<{ success: boolean; message: string }>(`/feed/posts/${postId}/save`);
    return data;
  },

  async addComment(postId: string, content: string): Promise<{ success: boolean; message: string; comment: PostComment }> {
    const { data } = await httpClient.post<{ success: boolean; message: string; comment: PostComment }>(
      `/feed/posts/${postId}/comments`,
      { content }
    );
    return data;
  },

  async getComments(postId: string): Promise<{ success: boolean; comments: PostComment[] }> {
    const { data } = await httpClient.get<{ success: boolean; comments: PostComment[] }>(`/feed/posts/${postId}/comments`);
    return data;
  },

  async trackShare(postId: string): Promise<{ success: boolean; message: string }> {
    const { data } = await httpClient.post<{ success: boolean; message: string }>(`/feed/posts/${postId}/share`);
    return data;
  },

  async trackView(postId: string, data?: { feedSessionId?: string, durationMs?: number, lastVisiblePercent?: number, sourceFeed?: string }): Promise<void> {
    await httpClient.post(`/feed/posts/${postId}/view`, data || {});
  },
};
