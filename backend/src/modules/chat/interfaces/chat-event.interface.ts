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
  | ConversationCreatedEvent;

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
