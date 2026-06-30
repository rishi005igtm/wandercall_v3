export class PublicProfileResponseDto {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  locationFormatted?: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  reputationScore: number;
  adventuresCompleted: number;
  communitiesJoined: number;
  campfiresHosted: number;
  followerCount: number;
  followingCount: number;
  relationshipState?: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self';
  dnaBadges?: any;
  createdAt: Date;
}
