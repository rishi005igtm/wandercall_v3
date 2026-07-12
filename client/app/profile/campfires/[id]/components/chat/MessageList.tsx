import React from 'react';
import { ChatMessage } from './types';
import { MessageItem } from './MessageItem';
import { useAutoScroll } from './useAutoScroll';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useAutoScroll(messages);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto min-h-0 py-4 px-2 space-y-4 custom-scrollbar"
    >
      <div className="flex flex-col gap-1 min-h-full justify-end">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
      {/* 
        A little bottom padding inside the scroll area to ensure the last message 
        isn't pressed hard against the composer 
      */}
      <div className="h-2 shrink-0" />
    </div>
  );
}
