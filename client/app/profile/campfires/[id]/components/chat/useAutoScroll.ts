import { useEffect, useRef } from 'react';
import { ChatMessage } from './types';

export function useAutoScroll(messages: ChatMessage[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollRef.current;
      // Optional: Only auto-scroll if the user is already near the bottom (within ~100px)
      // For this implementation, we will always scroll to bottom on new message to match standard requirements.
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [messages.length]);

  return scrollRef;
}
