export interface ChatMessage {
  id: string;
  senderId: string;
  fullName: string;
  role: string;
  avatar?: string | null;
  message: string;
  createdAt: Date;
  isCurrentUser: boolean;
  isSystem?: boolean;
}
