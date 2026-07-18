"use client";

import React from "react";
import { Award, Sparkles } from "lucide-react";

export default function QuestsPage() {
  return (
    <div className="w-full px-3 md:px-12 py-12 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center relative overflow-hidden text-white">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg mx-auto bg-zinc-950/40 border border-white/5 p-12 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center mb-2 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <Award className="h-10 w-10 text-white animate-pulse" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-md">
            Quests Module
          </h1>
          <span className="text-sm font-black uppercase tracking-widest text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-4 py-1.5 rounded-full inline-block mx-auto">
            Coming Soon
          </span>
        </div>
        
        <p className="text-zinc-400 font-medium leading-relaxed text-sm mt-2">
          The central hub for tracking your adventure milestones, community challenges, and earning exclusive rewards is currently being forged. 
        </p>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
          <span>Unlocking in Phase 2</span>
        </div>
      </div>
    </div>
  );
}
