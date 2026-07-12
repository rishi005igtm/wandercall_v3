import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { CompanionAvatar } from '../../../../../../components/shared/CompanionAvatar';

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  currentUserAvatar?: string | null;
}

export function MessageComposer({ onSendMessage, currentUserAvatar }: MessageComposerProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmed = text.trim();
    if (!trimmed) {
      setText('');
      return;
    }

    onSendMessage(trimmed);
    setText('');
    
    // Reset textarea height after send
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow natural newline insertion
        return;
      }
      
      // Prevent default newline and send message
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow textarea up to a max height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="pt-4 border-t border-white/5 flex gap-3 items-end shrink-0"
    >
      <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm mb-0.5">
        <CompanionAvatar
          avatar={currentUserAvatar}
          name="You"
          className="h-full w-full text-xs font-bold"
        />
      </div>
      
      <div className="flex-1 relative bg-zinc-950 border border-white/10 rounded-xl focus-within:border-brand-purple/50 focus-within:ring-1 focus-within:ring-brand-purple/20 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message campfire..."
          className="w-full bg-transparent px-3 py-2.5 text-[13px] text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none min-h-[42px] max-h-[120px] custom-scrollbar rounded-xl leading-relaxed block"
          rows={1}
        />
      </div>

      <button
        type="submit"
        disabled={!text.trim()}
        className="h-10 w-10 bg-brand-purple hover:bg-brand-purple/90 disabled:opacity-50 disabled:hover:bg-brand-purple rounded-xl flex items-center justify-center transition-colors cursor-pointer text-white shrink-0 shadow-sm mb-0.5 group"
      >
        <Send className="h-[18px] w-[18px] group-hover:scale-110 transition-transform" />
      </button>
    </form>
  );
}
