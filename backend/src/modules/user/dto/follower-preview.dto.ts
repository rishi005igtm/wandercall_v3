export class FollowerPreviewDto {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  compatibility: number;
  lastMessageText?: string;
  lastMessageAt?: Date;
}
