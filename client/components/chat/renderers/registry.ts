import React from 'react';
import { CommunityInviteRenderer } from './CommunityInviteRenderer';

export interface MessageRendererProps {
  message: any;
  currentUserId?: string | null;
  onAction?: (action: string, payload: any) => void;
}

export type MessageRenderer = React.FC<MessageRendererProps>;

export const MESSAGE_RENDERER_REGISTRY: Record<string, MessageRenderer> = {
  COMMUNITY_INVITE: CommunityInviteRenderer,
  community_invite: CommunityInviteRenderer,
  CAMPFIRE_INVITE: CommunityInviteRenderer, // Map legacy or campfire invite styles to same rich card
  campfire_invite: CommunityInviteRenderer,
};

export function getMessageRenderer(type?: string): MessageRenderer | undefined {
  if (!type) return undefined;
  return MESSAGE_RENDERER_REGISTRY[type] || MESSAGE_RENDERER_REGISTRY[type.toUpperCase()] || MESSAGE_RENDERER_REGISTRY[type.toLowerCase()];
}
