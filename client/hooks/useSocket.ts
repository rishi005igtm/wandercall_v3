'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/lib/store/store';
import {
  setSocketConnected,
  setSocketError,
  setTypingStart,
  setTypingStop,
  updatePresence,
} from '@/lib/store/slices/chatSlice';
import { useQueryClient } from '@tanstack/react-query';
import { CHAT_QUERY_KEYS } from './api/useDirectChat';
import { COMMUNITY_CHAT_QUERY_KEYS } from './api/useCommunityChat';
import { QUERY_KEYS } from '../lib/api/queryKeys';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/**
 * useSocket — Manages the Socket.IO connection lifecycle.
 *
 * Responsibilities:
 * - Creates a single socket connection per authenticated session
 * - Authenticates via JWT token from Redux auth state
 * - Handles connect/disconnect lifecycle
 * - Routes incoming socket events to Redux (typing, presence) or TanStack Query (messages)
 * - Provides a stable emit function for outgoing events
 *
 * Multi-device: The server assigns the user to `user:{userId}` room,
 * so all tabs/devices receive the same events automatically.
 *
 * This hook is mounted ONCE in AppProviders and provides the socket ref
 * via a shared context if needed — for now it subscribes to Redux auth state.
 */
export function useSocket() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      // Clean up if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        dispatch(setSocketConnected(false));
      }
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      path: '/socket.io/',
    });

    socketRef.current = socket;

    // ── Connection events ──────────────────────────────────
    socket.on('chat:connected', () => {
      dispatch(setSocketConnected(true));
    });

    socket.on('connect', () => {
      dispatch(setSocketConnected(true));
    });

    socket.on('disconnect', () => {
      dispatch(setSocketConnected(false));
    });

    socket.on('connect_error', (err) => {
      dispatch(setSocketError(err.message));
    });

    socket.on('chat:auth-error', ({ message }: { message: string }) => {
      dispatch(setSocketError(message));
      socket.disconnect();
    });

    // ── New message ────────────────────────────────────────
    socket.on('message:new', ({ message, conversationId }: any) => {
      // Prepend the new message to the TanStack Query cache
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => {
          if (!old) return old;
          // Infinite query shape: { pages: [{ items: [], ... }], pageParams: [] }
          const firstPage = old.pages?.[0];
          if (!firstPage) return old;
          return {
            ...old,
            pages: [
              { ...firstPage, items: [...firstPage.items, message] },
              ...old.pages.slice(1),
            ],
          };
        },
      );

      // Invalidate conversation list to update lastMessage + unread count
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
    });

    socket.on('community:message:new', ({ message, communityId, conversationId }: any) => {
      queryClient.setQueryData(
        COMMUNITY_CHAT_QUERY_KEYS.MESSAGES(communityId, conversationId),
        (old: any) => {
          if (!old) return old;
          const firstPage = old.pages?.[0];
          if (!firstPage) return old;
          
          // STRICT DEDUPLICATION
          const alreadyExists = firstPage.items.some((m: any) => m.id === message.id || (m.clientMessageId && m.clientMessageId === message.clientMessageId));
          if (alreadyExists) return old;

          return {
            ...old,
            pages: [
              { ...firstPage, items: [message, ...firstPage.items] },
              ...old.pages.slice(1),
            ],
          };
        }
      );
    });

    // ── Delivery receipt ───────────────────────────────────
    socket.on('message:delivered', ({ messageId, conversationId, deliveredAt }: any) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => updateMessageStatus(old, messageId, 'DELIVERED', { deliveredAt }),
      );
    });

    // ── Read receipt ───────────────────────────────────────
    socket.on('message:read', ({ messageId, conversationId, readAt }: any) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => updateMessageStatus(old, messageId, 'READ', { readAt }),
      );
    });

    // ── Message edited ─────────────────────────────────────
    socket.on('message:edited', ({ messageId, conversationId, newText }: any) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => updateMessageText(old, messageId, newText),
      );
    });

    // ── Message deleted ────────────────────────────────────
    socket.on('message:deleted', ({ messageId, conversationId }: any) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => markMessageDeleted(old, messageId),
      );
    });

    // ── Typing indicators ──────────────────────────────────
    socket.on('typing:start', ({ userId, conversationId }: any) => {
      dispatch(setTypingStart({ userId, conversationId }));
    });

    socket.on('typing:stop', ({ userId, conversationId }: any) => {
      dispatch(setTypingStop({ userId, conversationId }));
    });

    // ── Presence ───────────────────────────────────────────
    socket.on('presence:change', ({ userId, status, lastSeen }: any) => {
      dispatch(updatePresence({ userId, status, lastSeen }));
    });

    // ── Community ──────────────────────────────────────────
    socket.on('COMMUNITY_LIVE_STATE_CHANGED', ({ communityId, isLive, onlineMemberCount }: any) => {
      // Invalidate all community queries to refetch live stats
      // Or we can manually optimistically update them here
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
    });

    return () => {
      socket.off();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, dispatch, queryClient]);

  /**
   * Stable emit function — wraps socket.emit with promise-based ACK support.
   * Returns the server ACK or null if not connected.
   */
  const emit = useCallback(
    <T = any>(event: string, data: any): Promise<T | null> => {
      return new Promise((resolve) => {
        if (!socketRef.current?.connected) {
          resolve(null);
          return;
        }
        socketRef.current.emit(event, data, (ack: T) => resolve(ack));
      });
    },
    [],
  );

  /**
   * Join a conversation room — call this when the user opens a conversation.
   */
  const joinConversation = useCallback(
    async (conversationId: string) => {
      return emit('open-conversation', { conversationId });
    },
    [emit],
  );

  return {
    socket: socketRef.current,
    emit,
    joinConversation,
  };
}

// ─────────────────────────────────────────────────────────
// Cache updater helpers — pure functions for immutable query cache updates
// ─────────────────────────────────────────────────────────

function updateMessageStatus(
  old: any,
  messageId: string,
  status: string,
  extra: Record<string, any>,
): any {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      items: page.items.map((msg: any) =>
        msg.id === messageId ? { ...msg, status, ...extra } : msg,
      ),
    })),
  };
}

function updateMessageText(old: any, messageId: string, newText: string): any {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      items: page.items.map((msg: any) =>
        msg.id === messageId ? { ...msg, text: newText, isEdited: true, status: 'EDITED' } : msg,
      ),
    })),
  };
}

function markMessageDeleted(old: any, messageId: string): any {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      items: page.items.map((msg: any) =>
        msg.id === messageId
          ? { ...msg, isDeleted: true, text: undefined, status: 'DELETED' }
          : msg,
      ),
    })),
  };
}
