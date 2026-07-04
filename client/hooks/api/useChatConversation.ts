'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from '@/lib/store/store';
import { useSocketContext } from '@/providers/SocketProvider';
import { useMessages, CHAT_QUERY_KEYS } from './useChat';
import { chatService, Message } from '@/lib/services/chat.service';

interface UseChatConversationOptions {
  targetUserId: string | null;
}

interface ChatMessage {
  id: string;
  clientMessageId: string;
  senderId: string;
  text?: string;
  type: string;
  status: string;
  isEdited: boolean;
  isDeleted: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export function useChatConversation({ targetUserId }: UseChatConversationOptions) {
  const { emit, joinConversation, isConnected } = useSocketContext();
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const isAuthReady = useAppSelector((state) => state.auth.isAuthReady);
  const queryClient = useQueryClient();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track whether we've successfully joined the socket room
  const joinedRoomRef = useRef<string | null>(null);

  // Step 1: Resolve conversation ID from server (HTTP, not socket)
  // Only runs when auth is ready and targetUserId is set
  useEffect(() => {
    if (!targetUserId || !currentUserId || !isAuthReady) return;

    let cancelled = false;
    setIsInitializing(true);

    chatService
      .getOrCreateDirect(targetUserId)
      .then(({ conversationId: convId }) => {
        if (!cancelled) {
          setConversationId(convId);
          setIsInitializing(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetUserId, currentUserId, isAuthReady]);

  // Step 2: Join the socket room once BOTH conditions are true:
  //   a) conversationId is resolved
  //   b) socket is connected (isConnected === true)
  // This effect re-runs whenever isConnected changes — so if the socket
  // connects after the conversation was already resolved, we join then.
  useEffect(() => {
    if (!conversationId || !isConnected) return;
    if (joinedRoomRef.current === conversationId) return; // already joined this room

    joinConversation(conversationId).then((result) => {
      if (result?.success !== false) {
        joinedRoomRef.current = conversationId;
      }
    });
  }, [conversationId, isConnected, joinConversation]);

  // Reset joined room tracking when target changes
  useEffect(() => {
    joinedRoomRef.current = null;
  }, [targetUserId]);

  // Fetch message history via TanStack Query
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingMessages,
  } = useMessages(conversationId);

  const messages: ChatMessage[] = messagesData?.pages
    ? messagesData.pages
        .flatMap((page) => page.items)
        .map((m) => ({
          id: m.id,
          clientMessageId: m.clientMessageId,
          senderId: m.senderId,
          text: m.text,
          type: m.type,
          status: m.status,
          isEdited: m.isEdited,
          isDeleted: m.isDeleted,
          metadata: m.metadata,
          createdAt: m.createdAt,
        }))
    : [];

  /**
   * Conversation Focus Manager.
   *
   * Called by the UI when the conversation panel is actively visible.
   * Emits mark-read for the last message NOT sent by the current user.
   * This is the correct enterprise flow:
   *   Conversation visible → messages rendered → mark-read
   * NOT:
   *   Socket connected → mark-read
   */
  const markConversationRead = useCallback(() => {
    if (!conversationId || !currentUserId || !isConnected) return;

    const allMessages = messagesData?.pages?.flatMap((p) => p.items) ?? [];
    // Find the last message from the other user that hasn't been read
    const lastUnreadFromOther = [...allMessages]
      .reverse()
      .find((m) => m.senderId !== currentUserId && m.status !== 'READ' && m.status !== 'DELETED');

    if (lastUnreadFromOther) {
      emit('mark-read', { conversationId, messageId: lastUnreadFromOther.id });
    } else {
      // No specific message but still clear unread count
      emit('mark-read', { conversationId, messageId: '' });
    }
  }, [conversationId, currentUserId, isConnected, messagesData, emit]);

  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !currentUserId || !text.trim()) return;
      if (!isConnected) {
        console.warn('[useChatConversation] Socket not connected — message dropped');
        return;
      }

      const clientMessageId = uuidv4();
      const now = new Date().toISOString();

      // Optimistic insert
      const optimistic: Message = {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        type: 'TEXT',
        text: text.trim(),
        status: 'SENDING',
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
        if (!old) {
          return {
            pages: [{ items: [optimistic], nextCursor: undefined, hasMore: false }],
            pageParams: [undefined],
          };
        }
        const lastPage = old.pages[old.pages.length - 1];
        return {
          ...old,
          pages: [
            ...old.pages.slice(0, -1),
            { ...lastPage, items: [...lastPage.items, optimistic] },
          ],
        };
      });

      const ack = await emit('send-message', {
        clientMessageId,
        conversationId,
        type: 'TEXT',
        text: text.trim(),
      });

      if (ack?.success) {
        // Replace optimistic entry with confirmed server entry
        queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, id: ack.serverMessageId, status: 'SENT' }
                  : msg,
              ),
            })),
          };
        });
        queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
      } else if (ack !== null) {
        // Server returned an error ACK
        queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, status: 'FAILED' }
                  : msg,
              ),
            })),
          };
        });
      }
      // ack === null means socket not connected — optimistic entry stays as SENDING
      // (shows the user a pending state; they can retry)
    },
    [conversationId, currentUserId, isConnected, emit, queryClient],
  );

  const sendSpecialMessage = useCallback(
    async (type: string, metadata: Record<string, any>) => {
      if (!conversationId || !currentUserId || !isConnected) return;

      const clientMessageId = uuidv4();
      const now = new Date().toISOString();

      const optimistic: Message = {
        id: clientMessageId,
        clientMessageId,
        conversationId,
        senderId: currentUserId,
        type,
        status: 'SENDING',
        isEdited: false,
        isDeleted: false,
        metadata,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
        if (!old) {
          return {
            pages: [{ items: [optimistic], nextCursor: undefined, hasMore: false }],
            pageParams: [undefined],
          };
        }
        const lastPage = old.pages[old.pages.length - 1];
        return {
          ...old,
          pages: [
            ...old.pages.slice(0, -1),
            { ...lastPage, items: [...lastPage.items, optimistic] },
          ],
        };
      });

      const ack = await emit('send-message', {
        clientMessageId,
        conversationId,
        type,
        metadata,
      });

      if (ack?.success) {
        queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, id: ack.serverMessageId, status: 'SENT' }
                  : msg,
              ),
            })),
          };
        });
      }
    },
    [conversationId, currentUserId, isConnected, emit, queryClient],
  );

  const emitTyping = useCallback(() => {
    if (!conversationId || !isConnected) return;
    emit('typing-start', { conversationId });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emit('typing-stop', { conversationId });
    }, 3000);
  }, [conversationId, isConnected, emit]);

  const emitStopTyping = useCallback(() => {
    if (!conversationId) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    emit('typing-stop', { conversationId });
  }, [conversationId, emit]);

  const markRead = useCallback(
    (messageId: string) => {
      if (!conversationId || !messageId || !isConnected) return;
      emit('mark-read', { conversationId, messageId });
    },
    [conversationId, isConnected, emit],
  );

  return {
    conversationId,
    isInitializing,
    isConnected,
    messages,
    isLoadingMessages,
    hasMoreMessages: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    fetchMoreMessages: fetchNextPage,
    sendTextMessage,
    sendSpecialMessage,
    emitTyping,
    emitStopTyping,
    markRead,
    markConversationRead,
  };
}
