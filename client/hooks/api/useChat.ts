import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatService, Message } from '@/lib/services/chat.service';

// ─────────────────────────────────────────────────────────
// Query Keys — single source of truth for cache management
// ─────────────────────────────────────────────────────────
export const CHAT_QUERY_KEYS = {
  CONVERSATIONS: ['chat', 'conversations'] as const,
  MESSAGES: (conversationId: string) => ['chat', 'messages', conversationId] as const,
  PRESENCE: (userId: string) => ['chat', 'presence', userId] as const,
} as const;

// ─────────────────────────────────────────────────────────
// Conversation List
// ─────────────────────────────────────────────────────────

export const useConversations = () => {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.CONVERSATIONS,
    queryFn: () => chatService.getConversations(),
    staleTime: 30_000,
  });
};

// ─────────────────────────────────────────────────────────
// Message History — cursor-based infinite query
// ─────────────────────────────────────────────────────────

export const useMessages = (conversationId: string | null) => {
  return useInfiniteQuery({
    queryKey: CHAT_QUERY_KEYS.MESSAGES(conversationId ?? ''),
    queryFn: async ({ pageParam }) => {
      return chatService.getMessages(conversationId!, 30, pageParam as string | undefined);
    },
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0, // Always fresh — real-time updates via socket
  });
};

// ─────────────────────────────────────────────────────────
// Get or Create Direct Conversation
// ─────────────────────────────────────────────────────────

export const useGetOrCreateDirect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => chatService.getOrCreateDirect(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
    },
  });
};

// ─────────────────────────────────────────────────────────
// Send Message — optimistic update + socket emit
// ─────────────────────────────────────────────────────────

interface SendMessageParams {
  conversationId: string;
  text?: string;
  type?: string;
  attachments?: any[];
  replyToId?: string;
  metadata?: Record<string, any>;
}

/**
 * useSendMessage
 *
 * Implements the complete send workflow:
 * 1. Generate clientMessageId (UUID) on client
 * 2. Optimistically insert the message into TanStack Query cache
 * 3. Emit 'send-message' via socket
 * 4. On ACK: update the optimistic entry with the real serverMessageId + status
 * 5. On failure: mark the optimistic entry as FAILED
 *
 * The socket reference is passed in from the component to avoid hook order issues.
 */
export function useSendMessage(
  emit: (event: string, data: any) => Promise<any>,
  currentUserId: string | null,
) {
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (params: SendMessageParams) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const clientMessageId = uuidv4();
      const now = new Date().toISOString();

      // Optimistic message for immediate UI feedback
      const optimisticMessage: Message = {
        id: clientMessageId, // Temporary ID — replaced with serverMessageId on ACK
        clientMessageId,
        conversationId: params.conversationId,
        senderId: currentUserId,
        type: params.type ?? 'TEXT',
        text: params.text,
        attachments: params.attachments,
        replyToId: params.replyToId,
        metadata: params.metadata,
        status: 'SENDING',
        isEdited: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
      };

      // Insert optimistic message into cache
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(params.conversationId),
        (old: any) => {
          if (!old) {
            return {
              pages: [{ items: [optimisticMessage], nextCursor: undefined, hasMore: false }],
              pageParams: [undefined],
            };
          }
          const lastPage = old.pages[old.pages.length - 1];
          return {
            ...old,
            pages: [
              ...old.pages.slice(0, -1),
              { ...lastPage, items: [...lastPage.items, optimisticMessage] },
            ],
          };
        },
      );

      // Emit via socket
      const ack = await emit('send-message', {
        clientMessageId,
        conversationId: params.conversationId,
        type: params.type ?? 'TEXT',
        text: params.text,
        attachments: params.attachments,
        replyToId: params.replyToId,
        metadata: params.metadata,
      });

      if (ack?.success) {
        // Update optimistic entry with server ID and SENT status
        queryClient.setQueryData(
          CHAT_QUERY_KEYS.MESSAGES(params.conversationId),
          (old: any) => {
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
          },
        );
        // Update conversation list for lastMessage
        queryClient.invalidateQueries({ queryKey: CHAT_QUERY_KEYS.CONVERSATIONS });
      } else {
        // Mark as FAILED — UI can show a retry button
        queryClient.setQueryData(
          CHAT_QUERY_KEYS.MESSAGES(params.conversationId),
          (old: any) => {
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
          },
        );
      }

      return ack;
    },
    [emit, currentUserId, queryClient],
  );

  return { sendMessage };
}

// ─────────────────────────────────────────────────────────
// Edit Message
// ─────────────────────────────────────────────────────────

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, text }: { messageId: string; text: string }) =>
      chatService.editMessage(messageId, text),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(updated.conversationId),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((msg: Message) =>
                msg.id === updated.id ? updated : msg,
              ),
            })),
          };
        },
      );
    },
  });
};

// ─────────────────────────────────────────────────────────
// Delete Message
// ─────────────────────────────────────────────────────────

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => chatService.deleteMessage(messageId),
    onSuccess: (_, { messageId, conversationId }) => {
      queryClient.setQueryData(
        CHAT_QUERY_KEYS.MESSAGES(conversationId),
        (old: any) => {
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
        },
      );
    },
  });
};

// ─────────────────────────────────────────────────────────
// Presence
// ─────────────────────────────────────────────────────────

export const usePresence = (userId: string | null) => {
  return useQuery({
    queryKey: CHAT_QUERY_KEYS.PRESENCE(userId ?? ''),
    queryFn: () => chatService.getPresence(userId!),
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
};
