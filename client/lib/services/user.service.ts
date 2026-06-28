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
  accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string;
  createdAt: string;
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
};
