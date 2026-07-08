'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Flame } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

export const VirtualizedMessageList = ({ messages }: { messages: any[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Group messages for WhatsApp-style UI
  const groupedMessages = messages.map((msg, index) => {
    const prevMsg = messages[index - 1];
    
    // Check if same sender and within 5 minutes
    const isConsecutive = prevMsg && 
      prevMsg.senderId === msg.senderId && 
      (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60 * 1000);
      
    // Check if day changed
    const showDateSeparator = !prevMsg || !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

    return {
      ...msg,
      isConsecutive,
      showDateSeparator,
    };
  });

  const virtualizer = useVirtualizer({
    count: groupedMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Default estimated height
    overscan: 10,
  });

  // Auto-scroll to bottom on new messages if already at bottom
  useEffect(() => {
    if (isScrolledToBottom && groupedMessages.length > 0) {
      virtualizer.scrollToIndex(groupedMessages.length - 1, { align: 'end' });
    }
  }, [groupedMessages.length, isScrolledToBottom, virtualizer]);

  // Handle scroll events to detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setIsScrolledToBottom(isAtBottom);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      <div
        ref={parentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const msg = groupedMessages[virtualItem.index];
            const isConsecutive = msg.isConsecutive;
            const showDateSeparator = msg.showDateSeparator;

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {/* Sticky Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-4 sticky top-0 z-10">
                    <span className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 text-zinc-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}

                <div className={`flex gap-2.5 md:gap-3 items-start max-w-[90%] md:max-w-[85%] text-left py-1 ${!isConsecutive ? 'mt-3' : ''}`}>
                  {/* Avatar - Hide if consecutive */}
                  {!isConsecutive ? (
                    <img src={msg.avatar} alt="" className="h-7 w-7 md:h-8 md:w-8 rounded-full object-cover border border-white/5 shrink-0" />
                  ) : (
                    <div className="h-7 w-7 md:h-8 md:w-8 shrink-0" /> // Spacer for alignment
                  )}
                  
                  <div className="flex flex-col min-w-0 w-full group">
                    {/* Header - Hide if consecutive */}
                    {!isConsecutive && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-zinc-200">{msg.sender}</span>
                        <span className={`text-[7px] font-mono font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          msg.role === "Owner" ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple" : "bg-white/5 border-white/10 text-zinc-500"
                        }`}>
                          {msg.role}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="flex items-center gap-2">
                      <div className={`group-hover:bg-white/[0.02] transition-colors rounded-lg ${!isConsecutive ? 'mt-1' : ''}`}>
                        {msg.type === "text" && (
                          <p className="text-xs text-zinc-300 leading-relaxed break-words">{msg.text}</p>
                        )}
                        
                        {/* Attachments rendering omitted for brevity, keeping original logic below */}
                        {msg.type === "experience_share" && msg.metadata && (
                          <div className="glass-panel border border-white/10 p-3 rounded-2xl shadow-lg w-64 text-left mt-2 flex flex-col gap-2 relative overflow-hidden">
                            <div className="h-24 w-full relative rounded-lg overflow-hidden">
                              <img src={msg.metadata.image} className="h-full w-full object-cover brightness-90" alt="" />
                              <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full">
                                Adventure Experience
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                              <p className="text-[9px] text-zinc-400">{msg.metadata.location} • {msg.metadata.duration}</p>
                              <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-black text-brand-cyan">{msg.metadata.price}</span>
                                <button className="px-3 py-1 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 font-black text-[9px] rounded-lg transition-all">
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {msg.type === "campfire_share" && msg.metadata && (
                          <div className="glass-panel border border-brand-cyan/20 p-3.5 rounded-2xl shadow-lg w-64 text-left mt-2 flex flex-col gap-2.5 relative overflow-hidden bg-zinc-950/80">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Flame className="h-2.5 w-2.5 fill-current animate-pulse text-zinc-950" /> Active Campfire
                              </span>
                              <span className="text-[8.5px] font-mono text-brand-cyan font-black">{msg.metadata.energy}</span>
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white leading-tight">{msg.metadata.title}</h4>
                              <p className="text-[8px] text-zinc-500 truncate">Members: {msg.metadata.participants}</p>
                            </div>
                            <button className="w-full py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-lg transition-all flex items-center justify-center gap-1 shadow-md">
                              Join Voice Channel
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Consecutive timestamp on hover (WhatsApp style) */}
                      {isConsecutive && (
                        <span className="text-[8px] font-mono text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pt-1">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating "New Messages" button when scrolled up */}
      {!isScrolledToBottom && (
        <button 
          onClick={() => {
            virtualizer.scrollToIndex(groupedMessages.length - 1, { align: 'end' });
            setIsScrolledToBottom(true);
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800 border border-white/10 shadow-xl px-4 py-1.5 rounded-full text-[10px] font-bold text-white z-30 transition-all hover:bg-zinc-700 flex items-center gap-1.5 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          View New Messages
        </button>
      )}
    </div>
  );
};
