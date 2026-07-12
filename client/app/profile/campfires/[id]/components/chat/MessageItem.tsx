import React from 'react';
import { ChatMessage } from './types';
import { Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: ChatMessage;
}

export function MessageItem({ message }: MessageItemProps) {
  // System Log Rendering
  if (message.isSystem) {
    return (
      <div className="bg-brand-purple/10 border border-brand-purple/20 p-3 rounded-2xl w-full text-zinc-300 shadow-sm mt-2 mb-4">
        <div className="flex items-center gap-1.5 mb-1 text-brand-purple font-semibold text-xs tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          <span>System Log</span>
        </div>
        <p className="text-xs leading-relaxed">{message.message}</p>
      </div>
    );
  }

  // Standard User Message Rendering (Enterprise Layout)
  return (
    <div className={`flex gap-3 text-xs w-full group ${message.isCurrentUser ? 'bg-white/[0.02] p-2 -mx-2 rounded-xl' : 'py-1'}`}>
      
      {/* Avatar Column */}
      <div className="shrink-0 pt-1">
        <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 shadow-sm bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
          {message.avatar ? (
            <img src={message.avatar} alt={message.fullName} className="h-full w-full object-cover" />
          ) : (
            message.fullName.charAt(0).toUpperCase()
          )}
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-bold text-zinc-100 text-[13px]">{message.fullName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-zinc-400 font-medium tracking-wide">
            {message.role}
          </span>
          <span className="text-[10px] text-zinc-500 ml-auto md:ml-2">
            {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(message.createdAt)}
          </span>
        </div>
        
        <p className="text-zinc-300 text-[12px] leading-relaxed break-words whitespace-pre-wrap">
          {message.message}
        </p>
      </div>
      
    </div>
  );
}
