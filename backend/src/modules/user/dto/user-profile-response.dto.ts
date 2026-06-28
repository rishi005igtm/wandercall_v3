export class UserProfileResponseDto {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  isPrivate: boolean;
  accountStatus: string;
  createdAt: Date;
}
