import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampfirePresenceToastItem } from '../../hooks/useCampfirePresenceQueue';
import { X } from 'lucide-react';
import { CompanionAvatar } from '../../../../../../components/shared/CompanionAvatar';

interface CampfirePresenceToastProps {
  activeToasts: CampfirePresenceToastItem[];
  onDismiss: (id: string) => void;
}

export const CampfirePresenceToast: React.FC<CampfirePresenceToastProps> = ({ activeToasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => {
          const isJoin = toast.action === 'JOINED';
          const roleUpper = (toast.role || 'LISTENER').toUpperCase();

          let roleBadgeStyle = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50';
          if (roleUpper === 'HOST') {
            roleBadgeStyle = 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold';
          } else if (roleUpper === 'SPEAKER') {
            roleBadgeStyle = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-medium';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="pointer-events-auto flex items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-3 shadow-2xl shadow-black/60 min-w-[300px] max-w-[380px]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="h-9 w-9 rounded-full overflow-hidden border border-white/20 shrink-0">
                    <CompanionAvatar
                      avatar={toast.avatar}
                      name={toast.displayName}
                      className="h-full w-full text-xs font-bold"
                    />
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 ${
                      isJoin ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'
                    }`}
                  />
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white truncate max-w-[150px]">
                      {toast.displayName}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border tracking-wide uppercase ${roleBadgeStyle}`}>
                      {toast.role || 'LISTENER'}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 flex items-center gap-1 font-medium ${isJoin ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isJoin ? '🟢 joined the campfire' : '🔴 left the campfire'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
