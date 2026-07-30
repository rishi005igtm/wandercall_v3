import { useMutation } from '@tanstack/react-query';
import { feedService } from '../../lib/services/feed.service';

export function useUploadMediaMutation() {
  return useMutation({
    mutationFn: ({ file, onUploadProgress }: { file: File, onUploadProgress?: (progressEvent: any) => void }) => 
      feedService.uploadMedia(file, onUploadProgress),
  });
}

export function useDeleteMediaMutation() {
  return useMutation({
    mutationFn: (publicId: string) => feedService.deleteMedia(publicId),
  });
}
