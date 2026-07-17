import { MessageEntity } from '../entities/message.entity';
import { ConversationEntity } from '../entities/conversation.entity';

/**
 * All events the ChatEventDispatcher can emit.
 * Typed so that Kafka/Redis Pub-Sub adapters can implement the same interface.
 */
export interface IChatEventDispatcher {
  dispatch<T extends ChatEvent>(event: T): void;
}

export type ChatEvent =
  | MessageCreatedEvent
  | MessageDeliveredEvent
  | MessageReadEvent
  | MessageEditedEvent
  | MessageDeletedEvent
  | ConversationCreatedEvent
  | UserConnectedEvent
  | UserDisconnectedEvent
  | CommunityJoinLobbyEvent
  | CommunityLeaveLobbyEvent
  | CommunityMessageCreatedEvent;

export interface MessageCreatedEvent {
  type: 'MESSAGE_CREATED';
  payload: {
    message: MessageEntity;
    conversation: ConversationEntity;
    recipientIds: string[];
  };
}

export interface MessageDeliveredEvent {
  type: 'MESSAGE_DELIVERED';
  payload: {
    messageId: string;
    conversationId: string;
    senderId: string;
    deliveredAt: Date;
  };
}

export interface MessageReadEvent {
  type: 'MESSAGE_READ';
  payload: {
    messageId: string;
    conversationId: string;
    senderId: string;
    readerId: string;
    readAt: Date;
  };
}

export interface MessageEditedEvent {
  type: 'MESSAGE_EDITED';
  payload: {
    messageId: string;
    conversationId: string;
    newText: string;
    editedAt: Date;
  };
}

export interface MessageDeletedEvent {
  type: 'MESSAGE_DELETED';
  payload: {
    messageId: string;
    conversationId: string;
    deletedBy: string;
    deletedAt: Date;
  };
}

export interface ConversationCreatedEvent {
  type: 'CONVERSATION_CREATED';
  payload: {
    conversation: ConversationEntity;
    participantIds: string[];
  };
}

export interface UserConnectedEvent {
  type: 'USER_CONNECTED';
  payload: {
    userId: string;
    socketId: string;
  };
}

export interface UserDisconnectedEvent {
  type: 'USER_DISCONNECTED';
  payload: {
    userId: string;
    socketId: string;
    isStillOnline: boolean;
  };
}

export interface CommunityJoinLobbyEvent {
  type: 'COMMUNITY_JOIN_LOBBY';
  payload: {
    communityId: string;
    userId: string;
    user: Record<string, unknown>;
    socketId: string;
  };
}

export interface CommunityLeaveLobbyEvent {
  type: 'COMMUNITY_LEAVE_LOBBY';
  payload: {
    communityId: string;
    userId: string;
    socketId: string;
  };
}

export interface CommunityMessageCreatedEvent {
  type: 'COMMUNITY_MESSAGE_CREATED';
  payload: {
    communityId: string;
    message: Record<string, unknown>;
  };
}
