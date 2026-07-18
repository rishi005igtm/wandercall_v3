"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Radio, Users, Volume2, VolumeX, Mic, Play, Headphones, MessageCircle } from "lucide-react";

interface VoiceRoom {
  id: string;
  topic: string;
  category: string;
  hostName: string;
  listenersCount: number;
  activeSpeakers: string[]; // List of initial letters
  isActive: boolean;
}

export default function Campfires() {
  const [rooms, setRooms] = useState<VoiceRoom[]>([
    { id: "v1", topic: "Startup Stories: Bootstrap or VC funding?", category: "Startup", hostName: "Rohan D.", listenersCount: 142, activeSpeakers: ["R", "V", "A", "K"], isActive: true },
    { id: "v2", topic: "Solo Backpacking across North-East India", category: "Travel", hostName: "Meera K.", listenersCount: 89, activeSpeakers: ["M", "S", "D"], isActive: true },
    { id: "v3", topic: "Night Owls: Ghost Tales & Local Legends", category: "Horror", hostName: "Arjun P.", listenersCount: 204, activeSpeakers: ["A", "J", "L", "T", "M"], isActive: true },
    { id: "v4", topic: "AI & The Future of Wilderness Survival Gear", category: "Technology", hostName: "Kabir S.", listenersCount: 57, activeSpeakers: ["K", "N"], isActive: false }
  ]);

  const [activeRoomId, setActiveRoomId] = useState<string | null>("v3");
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);

  const handleToggleSpeaker = (roomId: string) => {
    setActiveRoomId((prev) => (prev === roomId ? null : roomId));
  };

  const handleJoinRoom = (roomId: string) => {
    setJoinedRoomId((prev) => (prev === roomId ? null : roomId));
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Startup": return "border-brand-purple text-brand-purple bg-brand-purple/10";
      case "Travel": return "border-brand-cyan text-brand-cyan bg-brand-cyan/10";
      case "Horror": return "border-orange-500 text-orange-500 bg-orange-500/10";
      default: return "border-zinc-500 text-zinc-500 bg-white/5";
    }
  };

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="campfires">
      <div className="absolute top-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-brand-indigo/5 blur-[150px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 mb-4">
            <Radio className="h-4 w-4 text-brand-purple animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Live Voice Campfires
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Audio Communities
          </h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed text-left">
          Join temporary voice rooms. Meet explore hosts, sync co-travel dates, share startup discussions, or listen to campfire horror stories. Powered by LiveKit WebRTC.
        </p>
      </div>

      {/* Grid of rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const isSpeakerOn = activeRoomId === room.id;
          const isJoined = joinedRoomId === room.id;
          return (
            <motion.div
              key={room.id}
              className={`p-4 sm:p-6 rounded-3xl glass-panel border-white/5 flex flex-col justify-between h-auto min-h-[220px] sm:h-[230px] transition-all relative overflow-hidden ${
                isSpeakerOn 
                  ? "border-brand-purple/30 bg-gradient-to-tr from-brand-purple/5 to-transparent glass-glow-purple" 
                  : "hover:bg-white/[0.02]"
              }`}
              whileHover={{ y: -4 }}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(room.category)}`}>
                    {room.category}
                  </span>
                  
                  {/* Status lights */}
                  <div className="flex items-center gap-2">
                    {room.isActive ? (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-zinc-600" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      {room.isActive ? "Live" : "Ended"}
                    </span>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white text-left mb-1.5 sm:mb-2 line-clamp-2 leading-snug">
                  {room.topic}
                </h3>

                <p className="text-xs text-zinc-500 text-left">
                  Host: <span className="font-semibold text-zinc-300">{room.hostName}</span>
                </p>
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/5 gap-2">
                {/* Active speaker avatars */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex -space-x-1.5 shrink-0">
                    {room.activeSpeakers.map((initial, i) => (
                      <div
                        key={i}
                        className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-brand-bg bg-zinc-800 text-[9px] sm:text-[10px] font-bold text-white flex items-center justify-center shrink-0 ${
                          i >= 3 ? "hidden sm:flex" : "flex"
                        }`}
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-zinc-400 truncate">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{room.listenersCount} listening</span>
                  </span>
                </div>

                {/* Speaker Toggle and Join Row */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Visual equalizer */}
                  {isSpeakerOn && room.isActive && (
                    <div className="flex gap-0.5 items-end h-5 sm:h-6 shrink-0 mr-1 sm:mr-1.5">
                      <span className="w-0.5 sm:w-0.75 h-3 sm:h-4 bg-brand-purple rounded-full animate-voice-wave" style={{ animationDelay: "0s" }} />
                      <span className="w-0.5 sm:w-0.75 h-4 sm:h-5 bg-brand-purple rounded-full animate-voice-wave" style={{ animationDelay: "0.2s" }} />
                      <span className="w-0.5 sm:w-0.75 h-2.5 sm:h-3 bg-brand-purple rounded-full animate-voice-wave" style={{ animationDelay: "0.4s" }} />
                      <span className="w-0.5 sm:w-0.75 h-4.5 sm:h-6 bg-brand-purple rounded-full animate-voice-wave" style={{ animationDelay: "0.1s" }} />
                    </div>
                  )}

                  {/* Speaker Icon Only Toggle Button */}
                  <button
                    disabled={!room.isActive}
                    onClick={() => handleToggleSpeaker(room.id)}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center border transition-all ${
                      isSpeakerOn
                        ? "bg-brand-purple/20 border-brand-purple/35 text-brand-purple animate-pulse"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white hover:text-black active:scale-95"
                    }`}
                    title={isSpeakerOn ? "Mute Speaker" : "Unmute Speaker"}
                  >
                    {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>

                  {/* Join Button */}
                  <button
                    disabled={!room.isActive}
                    onClick={() => handleJoinRoom(room.id)}
                    className={`h-8 sm:h-10 px-3 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 sm:gap-1.5 ${
                      isJoined
                        ? "bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald"
                        : room.isActive 
                          ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white hover:brightness-110 active:scale-95" 
                          : "bg-white/5 border border-white/5 text-zinc-600 cursor-not-allowed"
                    }`}
                  >
                    <Headphones className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{isJoined ? "Joined" : "Join"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-12">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]">
          <Radio className="h-4 w-4 text-brand-purple animate-pulse" />
          Explore More Campfires
        </button>
      </div>
    </section>
  );
}
