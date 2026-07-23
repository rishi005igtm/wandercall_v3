'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
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
import { CHAT_QUERY_KEYS } from '@/hooks/api/useDirectChat';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { Message } from '@/lib/services/chat.service';
import { getResolvedSocketUrl } from '@/lib/socket';

interface SocketContextValue {
  socket: Socket | null;
  emit: <T = any>(event: string, data: any) => Promise<T | null>;
  joinConversation: (conversationId: string) => Promise<any>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  emit: async () => null,
  joinConversation: async () => null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Read ALL three auth state fields — we only connect when auth is fully ready
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isAuthReady = useAppSelector((state) => state.auth.isAuthReady);
  const isConnected = useAppSelector((state) => state.chat.isSocketConnected);
  const currentUserId = useAppSelector((state) => state.auth.userId);

  const socketRef = useRef<Socket | null>(null);
  // Track which token the current socket was created with
  const connectedTokenRef = useRef<string | null>(null);

  // Stable mutable refs — event handlers always read latest values without re-registering
  const dispatchRef = useRef(dispatch);
  const queryClientRef = useRef(queryClient);
  dispatchRef.current = dispatch;
  queryClientRef.current = queryClient;

  useEffect(() => {
    // GUARD 1: Auth bootstrap hasn't finished yet — wait, do nothing
    // This is the critical fix: without isAuthReady, the socket is created with
    // accessToken=null (initial Redux state) causing hundreds of JWT rejections
    if (!isAuthReady) return;

    // GUARD 2: User is not authenticated — disconnect and clean up
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedTokenRef.current = null;
        dispatchRef.current(setSocketConnected(false));
      }
      return;
    }

    // GUARD 3: Socket already exists for this exact token — nothing to do
    if (socketRef.current && connectedTokenRef.current === accessToken) {
      return;
    }

    // GUARD 4: Token rotated (silent refresh) — replace old socket
    if (socketRef.current) {
      socketRef.current.off();
      socketRef.current.disconnect();
      socketRef.current = null;
      connectedTokenRef.current = null;
    }

    // Create ONE socket connection for this authenticated session
    const targetUrl = getResolvedSocketUrl();
    const socket = io(targetUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      // Reconnection is allowed for network blips, but NOT for auth failures
      // Auth failures are handled in 'chat:auth-error' — we stop reconnecting there
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.3,
      path: '/socket.io/',
    });

    socketRef.current = socket;
    connectedTokenRef.current = accessToken;

    // ── Connection lifecycle ───────────────────────────────────────────────
    socket.on('connect', () => {
      dispatchRef.current(setSocketConnected(true));
    });

    socket.on('chat:connected', () => {
      dispatchRef.current(setSocketConnected(true));
    });

    socket.on('disconnect', (reason) => {
      dispatchRef.current(setSocketConnected(false));
      // 'io server disconnect' means server deliberately closed it (e.g. auth expired)
      // Do NOT auto-reconnect — the token needs to be refreshed first
    });

    socket.on('connect_error', (err: Error) => {
      dispatchRef.current(setSocketError(err.message));
      // Stop reconnection attempts if JWT is invalid — prevents the storm of rejections
      // The user needs to re-auth; we do NOT keep hammering the server
      if (err.message.includes('jwt') || err.message.includes('JWT') || err.message.includes('unauthorized')) {
        socket.disconnect();
      }
    });

    socket.on('chat:auth-error', ({ message }: { message: string }) => {
      dispatchRef.current(setSocketError(message));
      // Stop all reconnection attempts immediately — auth error is not a network error
      socket.io.reconnection(false);
      socket.disconnect();
    });

    // ── Community message events ─────────────────────────────────────────────

    socket.on('message:new', ({ message, conversationId, communityId }: { message: Message; conversationId: string; communityId?: string }) => {
      const updater = (old: any) => {
        if (!old) {
          // Receiver: no cache exists yet — create fresh
          return {
            pages: [{ items: [message], nextCursor: undefined, hasMore: false }],
            pageParams: [undefined],
          };
        }

        const allItems: Message[] = old.pages.flatMap((p: any) => p.items);
        const existingIndex = allItems.findIndex(
          (m) => m.id === message.id || m.clientMessageId === message.clientMessageId,
        );

        if (existingIndex !== -1) {
          // Sender: optimistic entry exists — replace with confirmed server message
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((m: Message) =>
                m.id === message.id || m.clientMessageId === message.clientMessageId
                  ? { ...message }
                  : m,
              ),
            })),
          };
        }

        // Receiver: new message — append to last page
        const lastPage = old.pages[old.pages.length - 1];
        return {
          ...old,
          pages: [
            ...old.pages.slice(0, -1),
            { ...lastPage, items: [...lastPage.items, message] },
          ],
        };
      };
        queryClientRef.current.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), updater);
        queryClientRef.current.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
    });


    socket.on('message:delivered', ({ messageId, conversationId, deliveredAt, communityId }: any) => {
      const updater = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.id === messageId ? { ...msg, status: 'DELIVERED', deliveredAt } : msg,
            ),
          })),
        };
      };
      queryClientRef.current.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), updater);
    });

    socket.on('message:read', ({ messageId, conversationId, readAt, communityId }: any) => {
      const updater = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.id === messageId ? { ...msg, status: 'READ', readAt } : msg,
            ),
          })),
        };
      };
      queryClientRef.current.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), updater);
    });

    socket.on('message:edited', ({ messageId, conversationId, newText, communityId }: any) => {
      const updater = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.id === messageId ? { ...msg, text: newText, isEdited: true, status: 'EDITED' } : msg,
            ),
          })),
        };
      };
      queryClientRef.current.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), updater);
    });

    socket.on('message:deleted', ({ messageId, conversationId, communityId }: any) => {
      const updater = (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.id === messageId
                ? { ...msg, isDeleted: true, text: undefined, status: 'DELETED' }
                : msg,
            ),
          })),
        };
      };
      queryClientRef.current.setQueryData(CHAT_QUERY_KEYS.MESSAGES(conversationId), updater);
    });

    socket.on('typing:start', ({ userId, conversationId }: any) => {
      dispatchRef.current(setTypingStart({ userId, conversationId }));
    });

    socket.on('typing:stop', ({ userId, conversationId }: any) => {
      dispatchRef.current(setTypingStop({ userId, conversationId }));
    });

    socket.on('presence:change', ({ userId, status, lastSeen }: any) => {
      dispatchRef.current(updatePresence({ userId, status, lastSeen }));
    });

    socket.on('conversation:updated', () => {
      queryClientRef.current.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
    });



    return () => {
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
        connectedTokenRef.current = null;
        dispatchRef.current(setSocketConnected(false));
      }
    };
  }, [isAuthReady, isAuthenticated, accessToken]); // NOTE: isAuthReady added as critical guard

  const emit = useCallback(async <T = any>(event: string, data: any): Promise<T | null> => {
    try {
      const socket = socketRef.current;
      if (!socket?.connected) {
        return null;
      }
      
      // Enterprise 15,000ms timeout for Socket.IO ACK responses in production
      const ack = await socket.timeout(15000).emitWithAck(event, data);
      return ack as T;
    } catch (err) {
      console.warn(`Socket emission timed out or errored for ${event} (15s limit reached):`, err);
      return null;
    }
  }, []);

  const joinConversation = useCallback(async (conversationId: string) => {
    return emit('open-conversation', { conversationId });
  }, [emit]);

  const value: SocketContextValue = {
    socket: socketRef.current,
    emit,
    joinConversation,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
