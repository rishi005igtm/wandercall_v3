'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, StartAudio, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

function CampfireAuditLogger() {
  const room = useRoomContext();
  useEffect(() => {
    if (!room) return;

    const onLocalTrackPublished = (pub: any) => console.log(`[AUDIT - LiveKit] LocalTrackPublished`, pub.trackSid, pub.kind);
    const onLocalTrackUnpublished = (pub: any) => console.log(`[AUDIT - LiveKit] LocalTrackUnpublished`, pub.trackSid, pub.kind);
    const onTrackPublished = (pub: any, participant: any) => console.log(`[AUDIT - LiveKit] TrackPublished`, participant?.identity, pub.trackSid, pub.kind);
    const onTrackUnpublished = (pub: any, participant: any) => console.log(`[AUDIT - LiveKit] TrackUnpublished`, participant?.identity, pub.trackSid, pub.kind);
    const onTrackSubscribed = (track: any, pub: any, participant: any) => {
      console.log(`[AUDIT - LiveKit] TrackSubscribed`, participant?.identity, pub.trackSid, track.kind);
      
      // Verification pipeline for audio attachment
      if (track.kind === 'audio') {
        let attempts = 0;
        const verifyInterval = setInterval(() => {
          if (track.attachedElements && track.attachedElements.length > 0) {
            const el = track.attachedElements[0] as HTMLAudioElement;
            console.log(`[AUDIT - Audio Pipeline] SUCCESS: HTMLAudioElement exists for ${participant?.identity}`);
            console.log(`[AUDIT - Audio Pipeline] audio.srcObject:`, el.srcObject ? 'Present' : 'Null');
            console.log(`[AUDIT - Audio Pipeline] audio.paused:`, el.paused);
            console.log(`[AUDIT - Audio Pipeline] audio.readyState:`, el.readyState);
            console.log(`[AUDIT - Audio Pipeline] audio.networkState:`, el.networkState);
            clearInterval(verifyInterval);
          } else {
            if (++attempts > 10) {
               console.warn(`[AUDIT - Audio Pipeline] FAILED: Remote audio track was NEVER attached to an HTMLAudioElement after 5 seconds.`);
               clearInterval(verifyInterval);
            }
          }
        }, 500);
      }
    };
    const onTrackUnsubscribed = (track: any, pub: any, participant: any) => console.log(`[AUDIT - LiveKit] TrackUnsubscribed`, participant?.identity, pub.trackSid, track.kind);
    const onParticipantConnected = (participant: any) => console.log(`[AUDIT - LiveKit] ParticipantConnected`, participant?.identity);
    const onParticipantDisconnected = (participant: any) => console.log(`[AUDIT - LiveKit] ParticipantDisconnected`, participant?.identity);
    const onAudioPlaybackStatusChanged = (isPlaying: boolean) => console.log(`[AUDIT - LiveKit] AudioPlaybackStatusChanged`, isPlaying);

    const statsInterval = setInterval(() => {
      if (room && room.state === 'connected') {
        const localAudioCount = Array.from(room.localParticipant.trackPublications.values()).filter(p => p.kind === 'audio').length;
        if (localAudioCount > 1) {
          console.warn(`[AUDIT - WebRTC] WARNING: Duplicate Local Audio Tracks detected! Count: ${localAudioCount}`);
        } else {
          console.log(`[AUDIT - WebRTC] Local Audio Track Count: ${localAudioCount}`);
        }
      }
    }, 5000);

    room.on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
    room.on(RoomEvent.TrackPublished, onTrackPublished);
    room.on(RoomEvent.TrackUnpublished, onTrackUnpublished);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.AudioPlaybackStatusChanged, onAudioPlaybackStatusChanged);

    return () => {
      room.off(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
      room.off(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
      room.off(RoomEvent.TrackPublished, onTrackPublished);
      room.off(RoomEvent.TrackUnpublished, onTrackUnpublished);
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.AudioPlaybackStatusChanged, onAudioPlaybackStatusChanged);
      clearInterval(statsInterval);
    };
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
      {/* --- TEMPORARY AUDIT LOG (Phase 1 & 3) --- */}
      {!!(livekitToken && livekitUrl) && (
        <div style={{ display: 'none' }}>
          {(() => {
            console.log(`[AUDIT - Phase 3] before connect(): Attempting to connect to ${livekitUrl} with token ${livekitToken.substring(0, 15)}...`);
            return null;
          })()}
        </div>
      )}
      {/* ----------------------------------------- */}
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
          }
        }}
        onConnected={() => {
          console.log(`[AUDIT - Phase 3] after connect(): Connection SUCCESS to LiveKit Room at ${livekitUrl}`);
          console.log(`[AUDIT - Phase 3] onConnected() fired! Signal WebSocket is established.`);
        }}
        onDisconnected={() => {
          console.log(`[AUDIT - Phase 3] onDisconnected() fired! Lost connection or left room.`);
        }}
        onMediaDeviceFailure={(error) => {
          console.log(`[AUDIT - Phase 4] onMediaDeviceFailure() fired! Error:`, error);
        }}
      >
        <RoomAudioRenderer />
        <StartAudio 
          label="Click here to allow Campfire audio" 
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-indigo-700 transition-all font-semibold animate-bounce" 
        />
        <CampfireAuditLogger />
        {children}
      </LiveKitRoom>
    </VoiceContext.Provider>
  );
}
