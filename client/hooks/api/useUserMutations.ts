import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { QUERY_KEYS } from '../../lib/api/queryKeys';
import { userService, CompleteProfilePayload, UserProfileResponse, UserSettingsResponse, UserPlanResponse } from '../../lib/services/user.service';
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE(data.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.SETTINGS(data.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PLAN(data.userId) });
    },
  });
}

export function useUpdateProfileMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UserProfileResponse>) => userService.updateProfile(userId!, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.USER.PROFILE(data.userId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PROFILE(data.userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.CURRENT });
    },
  });
}

export function useUpdateSettingsMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UserSettingsResponse>) => userService.updateSettings(userId!, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.USER.SETTINGS(data.userId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.SETTINGS(data.userId) });
    },
  });
}

export function useUpdatePlanMutation(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<UserPlanResponse>) => userService.updatePlan(userId!, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.USER.PLAN(data.userId), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.PLAN(data.userId) });
    },
  });
}

export function useUsernameAvailability(username: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.USERNAME_CHECK(username),
    queryFn: () => userService.checkUsername(username),
    enabled: enabled && username.trim().length >= 3,
    staleTime: 60000,
    gcTime: 300000,
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
