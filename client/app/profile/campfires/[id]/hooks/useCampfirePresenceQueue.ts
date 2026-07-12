import { useState, useCallback, useEffect, useRef } from 'react';

export interface CampfirePresenceToastItem {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  role: string;
  action: 'JOINED' | 'LEFT';
  timestamp: string;
}

export const useCampfirePresenceQueue = () => {
  const [activeToasts, setActiveToasts] = useState<CampfirePresenceToastItem[]>([]);
  const queueRef = useRef<CampfirePresenceToastItem[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const recentToastsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setActiveToasts((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (queueRef.current.length > 0 && filtered.length < 2) {
        const nextItem = queueRef.current.shift()!;
        if (timersRef.current.has(nextItem.id)) {
          clearTimeout(timersRef.current.get(nextItem.id));
        }
        const newTimer = setTimeout(() => {
          dismissToast(nextItem.id);
        }, 2800);
        timersRef.current.set(nextItem.id, newTimer);
        return [...filtered, nextItem];
      }
      return filtered;
    });
  }, []);

  const scheduleAutoDismiss = useCallback((id: string) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
    }
    const timer = setTimeout(() => {
      dismissToast(id);
    }, 2800);
    timersRef.current.set(id, timer);
  }, [dismissToast]);

  const enqueueToast = useCallback((payload: Omit<CampfirePresenceToastItem, 'id'>) => {
    if (!payload.userId) return;
    
    // Allow JOINED to override LEFT, but still debounce identical actions
    const dedupeKey = `${payload.userId}_${payload.action}`;
    const now = Date.now();
    const lastSeen = recentToastsRef.current.get(dedupeKey);
    if (lastSeen && now - lastSeen < 2500) {
      return;
    }
    recentToastsRef.current.set(dedupeKey, now);

    const id = `presence-toast-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newItem: CampfirePresenceToastItem = { ...payload, id };

    setActiveToasts((prev) => {
      // Remove any conflicting toasts for the same user immediately (e.g. LEFT followed by JOINED)
      const filteredPrev = prev.filter((t) => {
        if (t.userId === payload.userId) {
          if (timersRef.current.has(t.id)) {
            clearTimeout(timersRef.current.get(t.id));
            timersRef.current.delete(t.id);
          }
          return false;
        }
        return true;
      });

      queueRef.current = queueRef.current.filter((t) => t.userId !== payload.userId);

      if (filteredPrev.length < 2) {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, 2800);
        timersRef.current.set(id, timer);
        return [...filteredPrev, newItem];
      } else {
        queueRef.current.push(newItem);
        return filteredPrev;
      }
    });
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      // Cleanup all timers on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    activeToasts,
    enqueueToast,
    dismissToast,
  };
};
