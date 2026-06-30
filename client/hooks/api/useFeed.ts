import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../lib/api/queryKeys';
import { feedService, FeedQueryFilters, FeedPost } from '../../lib/services/feed.service';

export function useFeedInfiniteQuery(filters: FeedQueryFilters, enabled = true) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.FEED.INFINITE(filters),
    queryFn: ({ pageParam }) => feedService.getFeed({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    staleTime: 30 * 1000, // Stale while revalidate behavior
  });
}

export function useUserFeedQuery(username: string, category?: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.FEED.USER_FEED(username, category),
    queryFn: () => feedService.getUserFeed(username, { category }),
    enabled: Boolean(username) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useCommentsQuery(postId: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.FEED.COMMENTS(postId),
    queryFn: () => feedService.getComments(postId),
    enabled: Boolean(postId) && enabled,
    staleTime: 5 * 1000,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => feedService.createPost(formData),
    onSuccess: (data) => {
      // Invalidate all feeds to fetch new posts
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      // Invalidate current user profile stats
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => feedService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
}

export function useLikePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, alreadyLiked }: { postId: string; alreadyLiked: boolean }) => {
      if (alreadyLiked) {
        return feedService.unlikePost(postId);
      } else {
        return feedService.likePost(postId);
      }
    },
    // Optimistic Update
    onMutate: async ({ postId, alreadyLiked }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      // Snapshot the previous state of all feeds
      const snapShots: [any, any][] = [];

      // Helper to optimistically update post
      const updater = (post: FeedPost): FeedPost => {
        const change = alreadyLiked ? -1 : 1;
        return {
          ...post,
          hasLiked: !alreadyLiked,
          likeCount: Math.max(0, post.likeCount + change),
        };
      };

      // Set query data for all keys starting with ['feed']
      queryClient.setQueriesData({ queryKey: ['feed'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.map((p: FeedPost) => (p.id === postId ? updater(p) : p)),
            })),
          };
        }
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((p: FeedPost) => (p.id === postId ? updater(p) : p)),
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((p: FeedPost) => (p.id === postId ? updater(p) : p));
        }
        return oldData;
      });

      return { snapShots };
    },
    onError: (err, variables, context) => {
      // Rollback on failure: refetch feeds
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: () => {
      // Invalidate in background to ensure correct sync
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useSavePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, alreadySaved }: { postId: string; alreadySaved: boolean }) => {
      if (alreadySaved) {
        return feedService.unsavePost(postId);
      } else {
        return feedService.savePost(postId);
      }
    },
    // Optimistic Update
    onMutate: async ({ postId, alreadySaved }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });

      const updater = (post: FeedPost): FeedPost => {
        const change = alreadySaved ? -1 : 1;
        return {
          ...post,
          hasSaved: !alreadySaved,
          saveCount: Math.max(0, post.saveCount + change),
        };
      };

      queryClient.setQueriesData({ queryKey: ['feed'] }, (oldData: any) => {
        if (!oldData) return oldData;
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              items: page.items.map((p: FeedPost) => (p.id === postId ? updater(p) : p)),
            })),
          };
        }
        if (oldData.items) {
          return {
            ...oldData,
            items: oldData.items.map((p: FeedPost) => (p.id === postId ? updater(p) : p)),
          };
        }
        if (Array.isArray(oldData)) {
          return oldData.map((p: FeedPost) => (p.id === postId ? updater(p) : p));
        }
        return oldData;
      });

      return {};
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      feedService.addComment(postId, content),
    onSuccess: (data, variables) => {
      // Invalidate comments of this post
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FEED.COMMENTS(variables.postId) });
      // Invalidate feed list to update commentCount
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
