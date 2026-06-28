import { httpClient } from '../api/httpClient';

export interface CompleteProfilePayload {
  userId: string;
  username: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  isPrivate: boolean;
  profileUrl?: string;
  coverImageUrl?: string;
  phoneCoordinate?: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  reputationScore: number;
  adventuresCompleted: number;
  communitiesJoined: number;
  campfiresHosted: number;
  dnaBadges?: any;
  accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string;
  createdAt: string;
}

export interface UserSettingsResponse {
  userId: string;
  is2faEnabled: boolean;
  privacyMatrix: Record<string, string>;
  notifications: Record<string, boolean>;
  travelRadius: number;
  budgetRange: number;
  difficulty: string;
  selectedTags: string[];
  connectedNetworks: Record<string, any>;
}

export interface UserPlanResponse {
  userId: string;
  selectedTier: string;
  billingCycle: string;
  price: number;
  status: string;
  nextBillDate?: string;
  paymentCard: { name: string; number: string; expiry: string; cvv: string } | null;
}

export const userService = {
  async completeProfile(payload: CompleteProfilePayload): Promise<UserProfileResponse> {
    const { data } = await httpClient.post<UserProfileResponse>('/users/profile/complete', payload);
    return data;
  },

  async checkUsername(username: string): Promise<{ available: boolean; username: string }> {
    const { data } = await httpClient.get<{ available: boolean; username: string }>(
      `/users/username/check`,
      { params: { username } }
    );
    return data;
  },

  async getUsernameSuggestions(name: string): Promise<{ suggestions: string[] }> {
    const { data } = await httpClient.get<{ suggestions: string[] }>(
      `/users/username/suggestions`,
      { params: { name } }
    );
    return data;
  },

  async getProfile(userId: string): Promise<UserProfileResponse> {
    const { data } = await httpClient.get<UserProfileResponse>(`/users/profile/${userId}`);
    return data;
  },

  async updateProfile(userId: string, payload: Partial<UserProfileResponse>): Promise<UserProfileResponse> {
    const { data } = await httpClient.patch<UserProfileResponse>(`/users/profile/${userId}`, payload);
    return data;
  },

  async getSettings(userId: string): Promise<UserSettingsResponse> {
    const { data } = await httpClient.get<UserSettingsResponse>(`/users/settings/${userId}`);
    return data;
  },

  async updateSettings(userId: string, payload: Partial<UserSettingsResponse>): Promise<UserSettingsResponse> {
    const { data } = await httpClient.patch<UserSettingsResponse>(`/users/settings/${userId}`, payload);
    return data;
  },

  async getPlan(userId: string): Promise<UserPlanResponse> {
    const { data } = await httpClient.get<UserPlanResponse>(`/users/plan/${userId}`);
    return data;
  },

  async updatePlan(userId: string, payload: Partial<UserPlanResponse>): Promise<UserPlanResponse> {
    const { data } = await httpClient.patch<UserPlanResponse>(`/users/plan/${userId}`, payload);
    return data;
  },
};
