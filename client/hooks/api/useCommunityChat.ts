import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatService, Message } from '@/lib/services/chat.service';

export const COMMUNITY_CHAT_QUERY_KEYS = {
  CHANNELS: (communityId: string) => ['community', communityId, 'channels'] as const,
  MESSAGES: (communityId: string, channelId: string) => ['community', communityId, 'chat', channelId] as const,
  PRESENCE: (communityId: string) => ['community', communityId, 'presence'] as const,
} as const;

export const useCommunityDefaultConversation = (communityId: string | null) => {
  return useQuery({
    queryKey: ['community', communityId, 'default-conversation'],
    queryFn: async () => {
      const res = await chatService.getCommunityDefaultConversation(communityId!);
      return res;
    },
    enabled: !!communityId,
  });
};

export const useCommunityMessages = (communityId: string, channelId: string | null) => {
  return useInfiniteQuery({
    queryKey: COMMUNITY_CHAT_QUERY_KEYS.MESSAGES(communityId, channelId ?? ''),
    queryFn: async ({ pageParam }) => {
      return chatService.getCommunityMessages(communityId, channelId!, 30, pageParam as string | undefined);
    },
    enabled: !!channelId && !!communityId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 0,
  });
};

export function useSendCommunityMessage(
  emit: (event: string, data: any) => Promise<any>,
  currentUserId: string | null,
) {
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (params: { communityId: string, channelId: string, text?: string, type?: string, metadata?: any }) => {
      if (!currentUserId) throw new Error('Not authenticated');

      const clientMessageId = uuidv4();
      const now = new Date().toISOString();

      const optimisticMessage: Message = {
        id: clientMessageId,
        clientMessageId,
        conversationId: params.channelId,
        senderId: currentUserId,
        text: params.text || '',
        status: 'SENDING',
        createdAt: now,
        updatedAt: now,
        isEdited: false,
        isDeleted: false,
        type: params.type as any || 'text',
        metadata: params.metadata,
      };

      const queryKey = COMMUNITY_CHAT_QUERY_KEYS.MESSAGES(params.communityId, params.channelId);

      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            items: [optimisticMessage, ...newPages[0].items],
          };
        }
        return { ...oldData, pages: newPages };
      });

      try {
        const response = await emit('community:send_message', {
          communityId: params.communityId,
          conversationId: params.channelId, // map channelId to conversationId for the backend DTO
          clientMessageId,
          text: params.text,
          type: params.type,
          metadata: params.metadata,
        });

        if (response && response.success === false) {
          console.error('Server rejected message:', response);
          throw new Error(response.message || 'Server returned an error');
        }

        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.clientMessageId === clientMessageId
                ? { ...msg, id: response.serverMessageId, status: 'DELIVERED' }
                : msg
            ),
          }));
          return { ...oldData, pages: newPages };
        });

        return response;
      } catch (error) {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          const newPages = oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((msg: Message) =>
              msg.clientMessageId === clientMessageId
                ? { ...msg, status: 'FAILED' }
                : msg
            ),
          }));
          return { ...oldData, pages: newPages };
        });
        throw error;
      }
    },
    [emit, currentUserId, queryClient]
  );

  return { sendMessage };
}
