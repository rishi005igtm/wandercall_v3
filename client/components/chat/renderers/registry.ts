import React from 'react';
export interface MessageRendererProps {
  message: any;
  currentUserId?: string | null;
  onAction?: (action: string, payload: any) => void;
}

export type MessageRenderer = React.FC<MessageRendererProps>;

export const MESSAGE_RENDERER_REGISTRY: Record<string, MessageRenderer> = {};

export function getMessageRenderer(type?: string): MessageRenderer | undefined {
  if (!type) return undefined;
  return MESSAGE_RENDERER_REGISTRY[type] || MESSAGE_RENDERER_REGISTRY[type.toUpperCase()] || MESSAGE_RENDERER_REGISTRY[type.toLowerCase()];
}
