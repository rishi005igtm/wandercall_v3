'use client';

import { useMemo } from 'react';
import { useConversations } from './useChat';
import { useAppSelector } from '@/lib/store/store';

export interface FriendInboxState {
  conversationId: string | null;
  /** Unread messages for the current user in this conversation */
  unreadCount: number;
  /** Preview text of the last message */
  lastMessageText: string | null;
  /** ISO timestamp of last message */
  lastMessageAt: string | null;
  /** userId of who sent the last message */
  lastMessageSenderId: string | null;
  /** Whether the friend is currently online (from presence) */
  isOnline: boolean;
  /** Whether the friend is currently typing in this conversation */
  isTyping: boolean;
  /** Raw presence status string */
  presenceStatus: string;
}

const EMPTY_STATE: FriendInboxState = {
  conversationId: null,
  unreadCount: 0,
  lastMessageText: null,
  lastMessageAt: null,
  lastMessageSenderId: null,
  isOnline: false,
  isTyping: false,
  presenceStatus: 'OFFLINE',
};

/**
 * useChatInbox
 *
 * Derives per-friend inbox state from the global conversation list (TanStack Query)
 * and presence/typing maps (Redux). Zero additional API calls.
 *
 * Returns:
 *   getInboxState(friendUserId) → FriendInboxState
 *   totalUnread → number
 *   sortedByRecent → friendUserId[] ordered by lastMessageAt DESC
 */
export function useChatInbox(currentUserId: string | null) {
  const { data: conversations } = useConversations();
  const presenceMap = useAppSelector((state) => state.chat.presenceMap);
  const typingMap = useAppSelector((state) => state.chat.typingMap);

  /**
   * Build a map: friendUserId → FriendInboxState
   *
   * The server returns conversations with:
   *   unreadCounts: { userId1: 0, userId2: 3 }
   *
   * For a DIRECT conversation, the other user's ID is the key in unreadCounts
   * that is NOT the current user's ID.
   */
  const inboxMap = useMemo<Record<string, FriendInboxState>>(() => {
    if (!conversations || !currentUserId) return {};

    const result: Record<string, FriendInboxState> = {};

    for (const conv of conversations) {
      // Derive the other participant from the unreadCounts map keys
      const allParticipantIds = Object.keys(conv.unreadCounts ?? {});
      const friendIds = allParticipantIds.filter((id) => id !== currentUserId);

      for (const friendId of friendIds) {
        const presence = presenceMap[friendId];
        // isTyping: check if any users are typing in this conversation room
        const typingUsers = typingMap[conv.id] ?? [];
        const isTyping = typingUsers.some((uid) => uid !== currentUserId);

        result[friendId] = {
          conversationId: conv.id,
          unreadCount: conv.unreadCounts?.[currentUserId] ?? conv.unreadCount ?? 0,
          lastMessageText: conv.lastMessageText ?? null,
          lastMessageAt: conv.lastMessageAt ?? null,
          lastMessageSenderId: conv.lastMessageSenderId ?? null,
          isOnline: presence
            ? presence.status === 'ONLINE' || presence.status === 'TYPING'
            : false,
          isTyping,
          presenceStatus: presence?.status ?? 'OFFLINE',
        };
      }
    }

    return result;
  }, [conversations, currentUserId, presenceMap, typingMap]);

  /** Look up inbox state for a specific friend */
  const getInboxState = (friendUserId: string): FriendInboxState =>
    inboxMap[friendUserId] ?? EMPTY_STATE;

  /** Total unread across all conversations */
  const totalUnread = useMemo(() => {
    if (!conversations || !currentUserId) return 0;
    return conversations.reduce(
      (sum, conv) => sum + (conv.unreadCounts?.[currentUserId] ?? conv.unreadCount ?? 0),
      0,
    );
  }, [conversations, currentUserId]);

  /**
   * Friend user IDs sorted by last message time, most recent first.
   * This powers the real-time reordering of the companion list.
   */
  const sortedByRecent = useMemo(() => {
    return Object.entries(inboxMap)
      .sort(([, a], [, b]) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      })
      .map(([friendId]) => friendId);
  }, [inboxMap]);

  return { getInboxState, totalUnread, sortedByRecent, inboxMap };
}

// ─────────────────────────────────────────────────────────
// Utility: intelligent message preview
// ─────────────────────────────────────────────────────────

/**
 * Returns a human-readable preview of the last message.
 * Uses type-specific icons for non-text messages.
 */
export function formatMessagePreview(
  text: string | null | undefined,
  type?: string | null,
  isFromMe?: boolean,
): string {
  const prefix = isFromMe ? 'You: ' : '';

  if (!type || type === 'TEXT') {
    return prefix + (text ?? '');
  }

  const typeMap: Record<string, string> = {
    IMAGE: '📷 Photo',
    VIDEO: '🎬 Video',
    AUDIO: '🎤 Voice message',
    DOCUMENT: '📄 Document',
    EXPERIENCE_CARD: '🧭 Experience',
    PLAN_CARD: '📅 Adventure Plan',
    CAMPFIRE_INVITE: '🔥 Campfire Invite',
    SYSTEM: text ?? '',
  };

  return prefix + (typeMap[type] ?? text ?? '');
}

// ─────────────────────────────────────────────────────────
// Utility: short relative time
// ─────────────────────────────────────────────────────────

export function formatInboxTime(isoString: string | null | undefined): string {
  if (!isoString) return '';

  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
