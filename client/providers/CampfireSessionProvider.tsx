'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { PersistentCampfireBar } from '@/components/PersistentCampfireBar';

interface CampfireSessionContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string, userId: string, userProfile: any) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  isSessionTerminated: boolean;
  activeSessionId: string | null;
}

const CampfireSessionContext = createContext<CampfireSessionContextValue>({
  socket: null,
  isConnected: false,
  joinRoom: () => {},
  leaveRoom: () => {},
  isSessionTerminated: false,
  activeSessionId: null,
});

export const useCampfireSessionManager = () => useContext(CampfireSessionContext);

export function CampfireSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionTerminated, setIsSessionTerminated] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const activeUserRef = useRef<string | null>(null);

  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (!s.connected) {
      s.connect();
    } else {
      setIsConnected(true);
    }

    let hasRunConnect = false;

    const onConnect = () => {
      if (hasRunConnect) return;
      hasRunConnect = true;
      console.log("[CampfireSessionManager] Connected to Live Socket");
      // If we reconnected and have an active room, re-join seamlessly
      if (activeSessionRef.current) {
        console.log(`[CampfireSessionManager] Re-joining active room ${activeSessionRef.current} after connect`);
        s.emit('heartbeat', { roomId: activeSessionRef.current });
      }
      setIsConnected(true);
    };
    const onDisconnect = (reason: string) => {
      console.log("[CampfireSessionManager] Socket disconnected!", reason);
      setIsConnected(false);
    };

    const onDiscoveryUpdated = (data: any) => {
      console.log("[CampfireSessionManager] DISCOVERY_FEED_UPDATED received, invalidating queries...");
      queryClient.invalidateQueries({
        predicate: (query) => {
          const isCampfireQuery = query.queryKey[0] === 'campfires';
          const isDetailQuery = query.queryKey[1] === 'detail';
          const isCurrentSession = activeSessionRef.current && query.queryKey[2] === activeSessionRef.current;
          return isCampfireQuery && !(isDetailQuery && isCurrentSession);
        }
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    };

    const onLifecycleSync = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    };

    // Terminal Lifecycle Event - Centralized Cleanup Pipeline
    const onSessionTerminated = (data: any) => {
      console.log("[CampfireSessionManager] SESSION_TERMINATED received globally", data);
      
      const targetRoomId = data?.id || data?.roomId;
      
      if (targetRoomId) {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(targetRoomId) });
      }
      
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
      if (data && data.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(data.id) });
        if (activeSessionRef.current === data.id) {
          setIsSessionTerminated(true);
        }
      }
    };

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('CAMPFIRE_CREATED', onLifecycleSync);
    s.on('CAMPFIRE_STARTED', onLifecycleSync);
    s.on('CAMPFIRE_RESTARTED', onLifecycleSync);
    s.on('CAMPFIRE_DELETED', onSessionTerminated);
    s.on('CAMPFIRE_ENDED', onSessionTerminated);
    s.on('DISCOVERY_FEED_UPDATED', onDiscoveryUpdated);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('CAMPFIRE_CREATED', onLifecycleSync);
      s.off('CAMPFIRE_STARTED', onLifecycleSync);
      s.off('CAMPFIRE_RESTARTED', onLifecycleSync);
      s.off('CAMPFIRE_DELETED', onSessionTerminated);
      s.off('CAMPFIRE_ENDED', onSessionTerminated);
      s.off('DISCOVERY_FEED_UPDATED', onDiscoveryUpdated);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [queryClient, router]);

  // The persistent session no longer forcefully terminates on route change.
  // The user remains in the voice room (and the global PersistentCampfireBar displays)
  // until they explicitly click "Leave Campfire".
  const joinRoom = useCallback((roomId: string, userId: string, userProfile: any) => {
    if (!socket) return;
    if (activeSessionRef.current === roomId && activeUserRef.current === userId) {
      console.log(`[CampfireSessionManager] Already joined ${roomId}. Emitting update_profile.`);
      socket.emit('update_profile', { roomId, userId, userProfile });
      return;
    }
    setIsSessionTerminated(false);
    setActiveSessionId(roomId);
    activeSessionRef.current = roomId;
    activeUserRef.current = userId;
    
    console.log(`[CampfireSessionManager] Emitting join_room for ${roomId}`);
    socket.emit('join_room', { roomId, userId, userProfile });
    socket.emit('update_profile', { roomId, userId, userProfile });
    
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    heartbeatInterval.current = setInterval(() => {
      if (socket.connected && activeSessionRef.current === roomId) {
        socket.emit('heartbeat', { roomId, userId });
      }
    }, 10000);
  }, [socket]);

  const leaveRoom = useCallback((roomId: string, userId: string) => {
    if (!socket) return;
    console.log(`[CampfireSessionManager] Emitting leave_room for ${roomId}`);
    console.trace(`[AUDIT - Phase 4] leaveRoom stack trace`);
    socket.emit('leave_room', { roomId, userId });
    
    if (activeSessionRef.current === roomId) {
      setActiveSessionId(null);
      activeSessionRef.current = null;
      activeUserRef.current = null;
    }
    
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, [socket]);

  return (
    <CampfireSessionContext.Provider value={{ socket, isConnected, joinRoom, leaveRoom, isSessionTerminated, activeSessionId }}>
      {children}
      <PersistentCampfireBar />
    </CampfireSessionContext.Provider>
  );
}
