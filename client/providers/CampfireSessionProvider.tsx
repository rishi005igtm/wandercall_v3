'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSocketContext } from '@/providers/SocketProvider';
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

  // Use the centralized socket from SocketProvider — no separate connection needed
  const { socket, isConnected: socketConnected } = useSocketContext();
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionTerminated, setIsSessionTerminated] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const activeUserRef = useRef<string | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

  // Mirror the centralized socket connected state
  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  // Subscribe to campfire lifecycle events on the shared socket
  useEffect(() => {
    if (!socket) return;

    // If we reconnected and have an active room, send a heartbeat to re-confirm presence
    if (socketConnected && activeSessionRef.current) {
      socket.emit('campfire:heartbeat', { roomId: activeSessionRef.current });
    }

    const onDisconnect = (_reason: string) => {
      setIsConnected(false);
    };

    const onDiscoveryUpdated = (data: any) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const isCampfireQuery = query.queryKey[0] === 'campfires';
          const isDetailQuery = query.queryKey[1] === 'detail';
          const isCurrentSession =
            activeSessionRef.current && query.queryKey[2] === activeSessionRef.current;
          return isCampfireQuery && !(isDetailQuery && isCurrentSession);
        },
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    };

    const onLifecycleSync = () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    };

    const onSessionTerminated = (data: any) => {
      const targetRoomId = data?.id || data?.roomId;
      if (targetRoomId) {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(targetRoomId) });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(data.id) });
        if (activeSessionRef.current === data.id) {
          setIsSessionTerminated(true);
        }
      }
    };

    socket.on('disconnect', onDisconnect);
    socket.on('CAMPFIRE_CREATED', onLifecycleSync);
    socket.on('CAMPFIRE_STARTED', onLifecycleSync);
    socket.on('CAMPFIRE_RESTARTED', onLifecycleSync);
    socket.on('CAMPFIRE_DELETED', onSessionTerminated);
    socket.on('CAMPFIRE_ENDED', onSessionTerminated);
    socket.on('DISCOVERY_FEED_UPDATED', onDiscoveryUpdated);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('CAMPFIRE_CREATED', onLifecycleSync);
      socket.off('CAMPFIRE_STARTED', onLifecycleSync);
      socket.off('CAMPFIRE_RESTARTED', onLifecycleSync);
      socket.off('CAMPFIRE_DELETED', onSessionTerminated);
      socket.off('CAMPFIRE_ENDED', onSessionTerminated);
      socket.off('DISCOVERY_FEED_UPDATED', onDiscoveryUpdated);
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [socket, socketConnected, queryClient]);

  const joinRoom = useCallback(
    (roomId: string, userId: string, userProfile: any) => {
      if (!socket) return;

      if (activeSessionRef.current === roomId && activeUserRef.current === userId) {
        socket.emit('campfire:update_profile', { roomId, userId, userProfile });
        return;
      }

      setIsSessionTerminated(false);
      setActiveSessionId(roomId);
      activeSessionRef.current = roomId;
      activeUserRef.current = userId;

      socket.emit('campfire:join_room', { roomId, userId, userProfile });
      socket.emit('campfire:update_profile', { roomId, userId, userProfile });

      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      heartbeatInterval.current = setInterval(() => {
        if (socket.connected && activeSessionRef.current === roomId) {
          socket.emit('campfire:heartbeat', { roomId, userId });
        }
      }, 10000);
    },
    [socket],
  );

  const leaveRoom = useCallback(
    (roomId: string, userId: string) => {
      if (!socket) return;
      socket.emit('campfire:leave_room', { roomId, userId });

      if (activeSessionRef.current === roomId) {
        setActiveSessionId(null);
        activeSessionRef.current = null;
        activeUserRef.current = null;
      }

      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
    },
    [socket],
  );

  return (
    <CampfireSessionContext.Provider
      value={{ socket, isConnected, joinRoom, leaveRoom, isSessionTerminated, activeSessionId }}
    >
      {children}
      <PersistentCampfireBar />
    </CampfireSessionContext.Provider>
  );
}
