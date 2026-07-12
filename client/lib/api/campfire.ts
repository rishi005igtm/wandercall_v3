import { httpClient } from './httpClient';

export enum CampfireVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum CampfireStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  WAITING = 'WAITING',
  LIVE = 'LIVE',
  ACTIVE = 'ACTIVE',
  ENDING = 'ENDING',
  ENDED = 'ENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampfireMood {
  STORYTELLING = 'STORYTELLING',
  DEEP_DISCUSSION = 'DEEP_DISCUSSION',
  LEARNING = 'LEARNING',
  CHILL = 'CHILL',
  DEBATE = 'DEBATE',
  NETWORKING = 'NETWORKING',
  SUPPORT = 'SUPPORT',
}

export enum CampfireCategory {
  TRAVEL = 'TRAVEL',
  TECH = 'TECH',
  MUSIC = 'MUSIC',
  GAMING = 'GAMING',
  CULTURE = 'CULTURE',
  WELLNESS = 'WELLNESS',
  ART = 'ART',
  FOOD = 'FOOD',
  SPORTS = 'SPORTS',
  BUSINESS = 'BUSINESS',
  GENERAL = 'GENERAL',
}

export interface Campfire {
  id: string;
  communityId: string;
  hostId: string;
  title: string;
  description: string;
  category: CampfireCategory;
  mood: CampfireMood;
  visibility: CampfireVisibility;
  status: CampfireStatus;
  capacity: number;
  speakerLimit: number;
  listenerLimit: number;
  currentSpeakers: number;
  currentListeners: number;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  livekitRoom?: string;
  startedAt?: string;
  endedAt?: string;
  scheduledStartAt?: string;
  remindedUserIds?: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  hostName?: string;
  hostAvatar?: string;
  hostUsername?: string;
  currentParticipants?: number;
  participantsCount?: number;
  isHostOnline?: boolean;
  onlineUserIds?: string[];
}


export interface CampfireDiscoveryResponse {
  items: Campfire[];
  nextCursor?: string;
  hasNext: boolean;
}

export interface CreateCampfireDto {
  communityId: string;
  title: string;
  description: string;
  category: CampfireCategory;
  mood: CampfireMood;
  visibility: CampfireVisibility;
  status?: CampfireStatus;
  scheduledStartAt?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}


export const campfireApi = {
  create: async (data: CreateCampfireDto): Promise<Campfire> => {
    const response = await httpClient.post('/campfires', data);
    return response.data;
  },

  search: async (params: Record<string, any>): Promise<CampfireDiscoveryResponse> => {
    const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>);
    const searchParams = new URLSearchParams(cleaned);
    const response = await httpClient.get(`/campfires/search?${searchParams.toString()}`);
    return response.data;
  },

  getTrending: async (params: Record<string, any>): Promise<CampfireDiscoveryResponse> => {
    const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>);
    const searchParams = new URLSearchParams(cleaned);
    const response = await httpClient.get(`/campfires/trending?${searchParams.toString()}`);
    return response.data;
  },

  getLive: async (params: Record<string, any>): Promise<CampfireDiscoveryResponse> => {
    const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>);
    const searchParams = new URLSearchParams(cleaned);
    const response = await httpClient.get(`/campfires/live?${searchParams.toString()}`);
    return response.data;
  },

  getRecommended: async (params: Record<string, any>): Promise<CampfireDiscoveryResponse> => {
    const cleaned = Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
      return acc;
    }, {} as Record<string, string>);
    const searchParams = new URLSearchParams(cleaned);
    const response = await httpClient.get(`/campfires/recommended?${searchParams.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Campfire> => {
    const response = await httpClient.get(`/campfires/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCampfireDto>): Promise<Campfire> => {
    const response = await httpClient.patch(`/campfires/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/campfires/${id}`);
  },

  start: async (id: string): Promise<Campfire> => {
    const response = await httpClient.post(`/campfires/${id}/start`);
    return response.data;
  },

  end: async (id: string): Promise<Campfire> => {
    const response = await httpClient.post(`/campfires/${id}/end`);
    return response.data;
  },

  remind: async (id: string): Promise<{ campfire: Campfire; reminded: boolean }> => {
    const response = await httpClient.post(`/campfires/${id}/remind`);
    return response.data;
  },

  restart: async (id: string): Promise<Campfire> => {
    const response = await httpClient.post(`/campfires/${id}/restart`);
    return response.data;
  },

  transitionLifecycle: async (id: string, targetStatus: CampfireStatus): Promise<Campfire> => {
    const response = await httpClient.post(`/campfires/${id}/lifecycle`, { targetStatus });
    return response.data;
  },

  joinSession: async (id: string): Promise<{ token: string; wsUrl: string; role: string; campfireId: string; roomName: string }> => {
    const response = await httpClient.post(`/campfires/${id}/join-session`);
    return response.data;
  },

  getWorkspace: async (tab: 'hosted' | 'joined' | 'saved'): Promise<Campfire[]> => {
    const response = await httpClient.get(`/campfires/workspace/${tab}`);
    return response.data;
  },
};

