import { RelationshipResponseDto } from './relationship-response.dto';

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
  relationship: RelationshipResponseDto;
  dnaBadges?: any;
  createdAt: Date;
}
