"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Volume2, Flame, Maximize2 } from "lucide-react";
import { useCampfireSessionManager } from "@/providers/CampfireSessionProvider";
import { useQuery } from "@tanstack/react-query";
import { campfireApi } from "@/lib/api/campfire";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store/store";
import { useCampfireVoice } from "@/providers/CampfireVoiceProvider";
import { useConnectionState, useIsSpeaking, useLocalParticipant } from "@livekit/components-react";

export function PersistentCampfireBar() {
  const { activeSessionId, leaveRoom } = useCampfireSessionManager();
  const { disconnectVoice } = useCampfireVoice();
  const authState = useSelector((state: RootState) => state.auth);
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch basic room info if available to show title
  const { data: activeRoom } = useQuery({
    queryKey: ['campfires', 'detail', activeSessionId],
    queryFn: () => activeSessionId ? campfireApi.getById(activeSessionId) : null,
    enabled: !!activeSessionId,
    staleTime: Infinity,
  });

  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const isSpeaking = useIsSpeaking(localParticipant);
  const isConnected = connectionState === 'connected';

  // Only show if we have an active session AND we're NOT on the campfire page itself
  const shouldShow = isMounted && activeSessionId && pathname && !pathname.startsWith(`/profile/campfires/${activeSessionId}`);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="persistent-campfire-bar"
        drag
        dragMomentum={false}
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-[100] cursor-grab active:cursor-grabbing flex items-center gap-2 md:gap-3 bg-zinc-900/90 border border-brand-purple/30 backdrop-blur-xl p-2 md:p-3 pr-3 md:pr-4 rounded-full md:rounded-[2rem] shadow-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-shadow"
      >
        <div className="relative h-9 w-9 md:h-12 md:w-12 rounded-full bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20 shrink-0">
          {isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-brand-purple/40"
            />
          )}
          <Flame className={`h-4 w-4 md:h-6 md:w-6 text-brand-purple z-10 ${isSpeaking ? 'animate-pulse' : ''}`} />
        </div>

        <div className="flex flex-col mr-1 md:mr-2 min-w-[90px] md:min-w-[120px] max-w-[140px] md:max-w-[200px]">
          <span className="text-[9px] md:text-[10px] text-brand-purple uppercase font-black tracking-widest flex items-center gap-1 md:gap-1.5">
            <Volume2 className="h-2.5 w-2.5 md:h-3 md:w-3" /> {isConnected ? 'Connected' : 'Connecting...'}
          </span>
          <span className="text-xs md:text-sm font-bold text-white truncate w-full mt-0 md:mt-0.5">
            {activeRoom?.title || "Active Campfire"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 border-l border-white/10 pl-2 md:pl-3">
          <button
            onClick={() => router.push(`/profile/campfires/${activeSessionId}`)}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-white/5 border border-white/10 hover:bg-brand-purple hover:border-brand-purple text-zinc-300 hover:text-white transition-all flex items-center justify-center group"
            title="Return to Campfire"
          >
            <Maximize2 className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:scale-110" />
          </button>
          
          <button
            onClick={() => {
              if (activeSessionId) {
                leaveRoom(activeSessionId, authState?.userId || "");
                disconnectVoice();
              }
            }}
            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-rose-400 transition-all flex items-center justify-center group"
            title="Leave Campfire"
          >
            <LogOut className="h-3 w-3 md:h-4 md:w-4 transition-transform group-hover:scale-110" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
