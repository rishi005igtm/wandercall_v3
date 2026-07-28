'use client';

import { useEffect, useRef } from 'react';
import { useSocketContext } from '@/providers/SocketProvider';

/**
 * Enterprise Presence Sync Hook
 * 
 * Dynamically subscribes to the presence of a specific list of users.
 * When the list changes, it calculates the difference and automatically
 * handles subscribing to new users and unsubscribing from removed ones.
 * 
 * Perfect for paginated lists, search results, or the inbox where
 * you only want to know the online status of the people on screen.
 */
export function usePresenceSync(userIds: string[]) {
  const { emit, isConnected } = useSocketContext();
  
  // Track currently subscribed user IDs to manage cleanup efficiently
  const subscribedIdsRef = useRef<Set<string>>(new Set());
  const wasConnectedRef = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      wasConnectedRef.current = false;
      return;
    }

    const currentIds = new Set(userIds.filter(Boolean));
    const previousIds = subscribedIdsRef.current;
    const justReconnected = !wasConnectedRef.current;

    // Find users we need to subscribe to (in current, not in previous, or ALL if just reconnected)
    const toSubscribe = justReconnected
      ? Array.from(currentIds)
      : Array.from(currentIds).filter(id => !previousIds.has(id));
    
    // Find users we need to unsubscribe from (in previous, not in current)
    // If just reconnected, the server already dropped our previous subscriptions, so no need to unsubscribe.
    const toUnsubscribe = justReconnected
      ? []
      : Array.from(previousIds).filter(id => !currentIds.has(id));

    if (justReconnected) {
      // Clear previous tracking since we are starting fresh on a new socket
      previousIds.clear();
    }

    if (toSubscribe.length > 0) {
      emit('subscribe-presence-bulk', { targetUserIds: toSubscribe });
      toSubscribe.forEach(id => previousIds.add(id));
    }

    if (toUnsubscribe.length > 0) {
      emit('unsubscribe-presence-bulk', { targetUserIds: toUnsubscribe });
      toUnsubscribe.forEach(id => previousIds.delete(id));
    }

    wasConnectedRef.current = true;
  }, [userIds, isConnected, emit]);

  // Global cleanup when the component using this hook unmounts
  useEffect(() => {
    return () => {
      const remainingIds = Array.from(subscribedIdsRef.current);
      if (remainingIds.length > 0 && isConnected) {
        emit('unsubscribe-presence-bulk', { targetUserIds: remainingIds });
      }
      subscribedIdsRef.current.clear();
    };
  }, [isConnected, emit]);
}
