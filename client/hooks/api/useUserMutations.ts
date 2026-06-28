import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { QUERY_KEYS } from '../../lib/api/queryKeys';
import { userService, CompleteProfilePayload } from '../../lib/services/user.service';
import { updateAccountStatus } from '../../lib/store/slices/authSlice';
import { useAppDispatch } from '../../lib/store/store';

export function useCompleteProfileMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CompleteProfilePayload) => userService.completeProfile(payload),
    onSuccess: (data) => {
      dispatch(updateAccountStatus(data.accountStatus));
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.CURRENT });
      router.push('/');
    },
  });
}

export function useUsernameAvailability(username: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.USERNAME_CHECK(username),
    queryFn: () => userService.checkUsername(username),
    enabled: enabled && username.trim().length >= 3,
    staleTime: 60000, // 1 minute cache
    gcTime: 300000, // 5 minutes
  });
}

export function useUsernameSuggestions(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.USERNAME_SUGGESTIONS(name),
    queryFn: () => userService.getUsernameSuggestions(name),
    enabled: enabled && Boolean(name),
    staleTime: 300000,
  });
}
