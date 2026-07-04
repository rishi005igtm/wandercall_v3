import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';

export interface RelationshipState {
  viewerFollowsTarget: boolean;
  targetFollowsViewer: boolean;
  state: 'NOT_CONNECTED' | 'FOLLOWING' | 'FOLLOWED_BY' | 'MUTUAL_FOLLOW' | 'SELF' | 'BLOCKED' | 'BLOCKED_BY' | 'MUTED' | 'RESTRICTED' | 'PRIVATE_PENDING' | 'PRIVATE_ACCEPTED';
  canFollow: boolean;
  canFollowBack: boolean;
  canMessage: boolean;
  canInvite: boolean;
  isFriend: boolean;
}

export const useRelationship = (username: string) => {
  return useQuery({
    queryKey: ['relationship', username],
    queryFn: async (): Promise<RelationshipState> => {
      const response = await httpClient.get(`/users/relationship/${username}`);
      return response.data;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
};
