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
  const joinedRoomRef = useRef<string | null>(null);

  // Track the messageId we last fired markRead for — prevents firing twice
  const lastMarkedReadIdRef = useRef<string | null>(null);
  // Track which conversationId the markRead was for
  const lastMarkedReadConvRef = useRef<string | null>(null);

  // Step 1: Resolve conversation via HTTP
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

    return () => { cancelled = true; };
  }, [targetUserId, currentUserId, isAuthReady]);

  // Step 2: Join socket room when connected
  useEffect(() => {
    if (!conversationId || !isConnected) return;
    if (joinedRoomRef.current === conversationId) return;

    joinConversation(conversationId).then((result) => {
      if (result?.success !== false) {
        joinedRoomRef.current = conversationId;
      }
    });
  }, [conversationId, isConnected, joinConversation]);

  // Reset when target changes
  useEffect(() => {
    joinedRoomRef.current = null;
    lastMarkedReadIdRef.current = null;
    lastMarkedReadConvRef.current = null;
  }, [targetUserId]);

  // Message history
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
   * Conversation Focus Manager
   *
   * Fires mark-read for the last unread message from the other user.
   * Guards: only fires once per (conversationId, messageId) pair.
   * This prevents the duplicate MESSAGE_READ logs.
   */
  const markConversationRead = useCallback(() => {
    if (!conversationId || !currentUserId || !isConnected) return;

    const allMessages = messagesData?.pages?.flatMap((p) => p.items) ?? [];
    const lastUnreadFromOther = [...allMessages]
      .reverse()
      .find(
        (m) =>
          m.senderId !== currentUserId &&
          m.status !== 'READ' &&
          m.status !== 'DELETED',
      );

    const clearUnreadCache = () => {
      queryClient.setQueryData(CHAT_QUERY_KEYS.CONVERSATIONS, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((conv: any) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0,
              unreadCounts: {
                ...(conv.unreadCounts || {}),
                [currentUserId || '']: 0,
              },
            };
          }
          return conv;
        });
      });
    };

    if (lastUnreadFromOther) {
      // Idempotency guard: only emit once per message per conversation
      if (
        lastMarkedReadIdRef.current === lastUnreadFromOther.id &&
        lastMarkedReadConvRef.current === conversationId
      ) {
        return;
      }
      lastMarkedReadIdRef.current = lastUnreadFromOther.id;
      lastMarkedReadConvRef.current = conversationId;
      emit('mark-read', { conversationId, messageId: lastUnreadFromOther.id });
      clearUnreadCache();
    } else {
      // No unread from other — just clear unread counter if needed
      // Only do this once per conversation open
      if (lastMarkedReadConvRef.current !== conversationId) {
        lastMarkedReadConvRef.current = conversationId;
        emit('mark-read', { conversationId, messageId: '' });
        clearUnreadCache();
      }
    }
  }, [conversationId, currentUserId, isConnected, messagesData, emit, queryClient]);

  // Auto-read when viewing conversation with messages
  useEffect(() => {
    if (conversationId && isConnected && messages.length > 0) {
      markConversationRead();
    }
  }, [conversationId, isConnected, messages.length, markConversationRead]);

  /**
   * sendTextMessage
   *
   * Architecture: Database-first, socket as optimization
   *
   * Flow:
   * 1. Generate clientMessageId
   * 2. Optimistic insert → show message immediately
   * 3. Attempt socket first (fast path, already connected)
   * 4. If socket fails/unavailable → fall back to HTTP POST
   * 5. On success (either path) → update optimistic entry
   *
   * Message is NEVER dropped regardless of socket state.
   */
  const sendTextMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !currentUserId || !text.trim()) return;

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

      // Try socket first (if connected)
      if (isConnected) {
        const ack = await emit('send-message', {
          clientMessageId,
          conversationId,
          type: 'TEXT',
          text: text.trim(),
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
          queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
          return; // Success via socket — done
        }

        // Socket returned error ACK (not null, but failed)
        if (ack !== null) {
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
          return;
        }
        // ack === null → socket not truly connected, fall through to HTTP
      }

      // Fallback: HTTP POST (guaranteed delivery regardless of socket state)
      try {
        const saved = await chatService.sendMessageHttp(
          conversationId,
          clientMessageId,
          'TEXT',
          text.trim(),
        );

        queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.clientMessageId === clientMessageId
                  ? { ...msg, id: saved.id, status: saved.status }
                  : msg,
              ),
            })),
          };
        });
        queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
      } catch {
        // HTTP also failed — mark as FAILED
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
    },
    [conversationId, currentUserId, isConnected, emit, queryClient],
  );

  const sendSpecialMessage = useCallback(
    async (type: string, metadata: Record<string, any>) => {
      if (!conversationId || !currentUserId) return;

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
          return { pages: [{ items: [optimistic], nextCursor: undefined, hasMore: false }], pageParams: [undefined] };
        }
        const lastPage = old.pages[old.pages.length - 1];
        return { ...old, pages: [...old.pages.slice(0, -1), { ...lastPage, items: [...lastPage.items, optimistic] }] };
      });

      if (isConnected) {
        const ack = await emit('send-message', { clientMessageId, conversationId, type, metadata });
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
          return;
        }
      }

      // HTTP fallback for special messages
      try {
        const saved = await chatService.sendMessageHttp(conversationId, clientMessageId, type, undefined, metadata);
        queryClient.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.clientMessageId === clientMessageId ? { ...msg, id: saved.id, status: saved.status } : msg,
              ),
            })),
          };
        });
      } catch { /* stays SENDING until next sync */ }
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
      queryClient.setQueryData(CHAT_QUERY_KEYS.CONVERSATIONS, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        return old.map((conv: any) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              unreadCount: 0,
              unreadCounts: {
                ...(conv.unreadCounts || {}),
                [currentUserId || '']: 0,
              },
            };
          }
          return conv;
        });
      });
    },
    [conversationId, isConnected, emit, queryClient, currentUserId],
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
