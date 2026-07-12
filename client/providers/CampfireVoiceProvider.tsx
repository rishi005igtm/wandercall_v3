'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, StartAudio, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

/**
 * DuplicateTrackGuard — silently watches for duplicate local audio track
 * publications (an edge-case LiveKit bug) without logging on every tick.
 */
function DuplicateTrackGuard() {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const statsInterval = setInterval(() => {
      if (room.state !== 'connected') return;
      const localAudioCount = Array.from(room.localParticipant.trackPublications.values())
        .filter((p) => p.kind === 'audio').length;
      if (localAudioCount > 1) {
        console.warn(`[CampfireVoice] Duplicate local audio tracks detected (count: ${localAudioCount}). This may cause echo.`);
      }
    }, 5000);

    return () => clearInterval(statsInterval);
  }, [room]);

  return null;
}

interface VoiceContextValue {
  livekitToken: string | null;
  livekitUrl: string | null;
  connectVoice: (url: string, token: string) => void;
  disconnectVoice: () => void;
}

const VoiceContext = createContext<VoiceContextValue>({
  livekitToken: null,
  livekitUrl: null,
  connectVoice: () => {},
  disconnectVoice: () => {},
});

export const useCampfireVoice = () => useContext(VoiceContext);

export function CampfireVoiceProvider({ children }: { children: React.ReactNode }) {
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  const connectVoice = useCallback((url: string, token: string) => {
    setLivekitUrl(url);
    setLivekitToken(token);
  }, []);

  const disconnectVoice = useCallback(() => {
    setLivekitToken(null);
    setLivekitUrl(null);
  }, []);

  return (
    <VoiceContext.Provider value={{ livekitToken, livekitUrl, connectVoice, disconnectVoice }}>
      <LiveKitRoom
        token={livekitToken || undefined}
        serverUrl={livekitUrl || undefined}
        connect={!!(livekitToken && livekitUrl)}
        audio={false}
        video={false}
        options={{
          audioCaptureDefaults: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        }}
      >
        <RoomAudioRenderer />
        <StartAudio
          label="Click here to allow Campfire audio"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-indigo-700 transition-all font-semibold animate-bounce"
        />
        <DuplicateTrackGuard />
        {children}
      </LiveKitRoom>
    </VoiceContext.Provider>
  );
}
