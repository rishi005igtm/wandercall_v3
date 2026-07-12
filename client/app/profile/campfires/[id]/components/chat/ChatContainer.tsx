import React, { useState } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { ChatMessage } from './types';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';

import { useEffect } from 'react';

interface ChatContainerProps {
  roomId: string;
  socket: any;
  campfireTitle: string;
  participantCount?: number;
  currentUser: {
    id: string;
    fullName: string;
    role: string;
    avatar?: string | null;
  };
}

export function ChatContainer({ roomId, socket, campfireTitle, participantCount = 1, currentUser }: ChatContainerProps) {
  // Initialize with the System Log as the first message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system-1',
      senderId: 'system',
      fullName: 'Campfire Keeper',
      role: 'System',
      avatar: '',
      message: `Welcome to "${campfireTitle}"! Gather round the fire and respect the circle.`,
      createdAt: new Date(),
      isCurrentUser: false,
      isSystem: true,
    }
  ]);

  useEffect(() => {
    if (!socket) return;

    const onChatHistory = (history: any[]) => {
      const historyMessages: ChatMessage[] = history.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        fullName: msg.senderName,
        role: msg.senderRole || 'Listener',
        avatar: msg.senderAvatar,
        message: msg.text,
        createdAt: new Date(msg.createdAt),
        isCurrentUser: msg.senderId === currentUser.id,
      }));

      // Keep system message + history
      setMessages(prev => {
        const sys = prev.find(p => p.isSystem);
        return sys ? [sys, ...historyMessages] : historyMessages;
      });
    };

    const onNewMessage = (msg: any) => {
      const newMsg: ChatMessage = {
        id: msg.id,
        senderId: msg.userId,
        fullName: msg.userProfile?.name || 'Explorer',
        role: msg.userProfile?.role || 'Listener',
        avatar: msg.userProfile?.avatar,
        message: msg.text,
        createdAt: new Date(msg.time || Date.now()),
        isCurrentUser: msg.userId === currentUser.id,
      };

      setMessages(prev => {
        const updated = [...prev, newMsg];
        // Enforce 100 message limit locally
        if (updated.length > 100) {
          // If the first is system, keep it, otherwise just slice
          if (updated[0].isSystem) {
            return [updated[0], ...updated.slice(updated.length - 99)];
          }
          return updated.slice(updated.length - 100);
        }
        return updated;
      });
    };

    socket.on('chat_history', onChatHistory);
    socket.on('campfire:new_message', onNewMessage);

    return () => {
      socket.off('chat_history', onChatHistory);
      socket.off('campfire:new_message', onNewMessage);
    };
  }, [socket, currentUser.id, currentUser.role]);

  const handleSendMessage = (text: string) => {
    if (socket && text.trim()) {
      socket.emit('campfire:send_message', {
        roomId,
        userId: currentUser.id,
        userProfile: {
          name: currentUser.fullName,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        text: text.trim()
      });
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between overflow-hidden flex-1 md:h-full border border-white/5 min-h-0 bg-zinc-950/40">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-cyan/10 p-1.5 rounded-lg border border-brand-cyan/20">
            <MessageSquare className="h-4 w-4 text-brand-cyan" />
          </div>
          <span className="text-sm font-bold text-zinc-100 tracking-wide">Campfire Chat</span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 px-3 py-1 rounded-full font-bold text-[11px] tracking-wider shadow-sm">
          <Users className="h-3.5 w-3.5" />
          <span>{participantCount} {participantCount === 1 ? 'Explorer' : 'Explorers'}</span>
        </div>
      </div>

      {/* Messages Timeline */}
      <MessageList messages={messages} />

      {/* Input Area */}
      <MessageComposer 
        onSendMessage={handleSendMessage} 
        currentUserAvatar={currentUser.avatar}
      />
      
    </div>
  );
}
