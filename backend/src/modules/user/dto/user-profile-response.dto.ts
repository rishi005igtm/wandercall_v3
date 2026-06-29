export class UserProfileResponseDto {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  avatarPublicId?: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  isPrivate: boolean;
  profileUrl?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  phoneCoordinate?: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  reputationScore: number;
  adventuresCompleted: number;
  communitiesJoined: number;
  campfiresHosted: number;
  dnaBadges?: any;
  accountStatus: string;
  createdAt: Date;
}
