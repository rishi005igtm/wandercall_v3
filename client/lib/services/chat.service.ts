import { httpClient } from '../api/httpClient';

export interface ConversationItem {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'CAMPFIRE' | 'COMMUNITY';
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  senderUsername?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  type: string;
  text?: string;
  attachments?: any[];
  replyToId?: string;
  status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'EDITED' | 'DELETED' | 'FAILED';
  isEdited: boolean;
  isDeleted: boolean;
  reactions?: Record<string, string[]>;
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesPage {
  items: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export const chatService = {
  /**
   * Get all conversations for the authenticated user.
   */
  async getConversations(): Promise<ConversationItem[]> {
    const response = await httpClient.get('/chat/conversations');
    return response.data;
  },

  /**
   * Get or create a direct conversation with a target user.
   * Returns the conversationId for socket connection.
   */
  async getOrCreateDirect(targetUserId: string): Promise<{ conversationId: string }> {
    const response = await httpClient.post(`/chat/conversations/direct/${targetUserId}`);
    return response.data;
  },

  /**
   * Fetch paginated message history for a conversation.
   */
  async getMessages(
    conversationId: string,
    limit: number = 30,
    cursor?: string,
  ): Promise<MessagesPage> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const response = await httpClient.get(
      `/chat/conversations/${conversationId}/messages?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Edit a message via HTTP (for non-realtime edits).
   */
  async editMessage(messageId: string, text: string): Promise<Message> {
    const response = await httpClient.patch(`/chat/messages/${messageId}`, { text });
    return response.data;
  },

  /**
   * Delete a message via HTTP.
   */
  async deleteMessage(messageId: string): Promise<void> {
    await httpClient.delete(`/chat/messages/${messageId}`);
  },

  /**
   * Get presence status for a user.
   */
  async getPresence(userId: string): Promise<{ userId: string; isOnline: boolean; status: string; lastSeen?: string }> {
    const response = await httpClient.get(`/chat/presence/${userId}`);
    return response.data;
  },
};
