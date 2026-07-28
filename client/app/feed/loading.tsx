import React from "react";
import { Loader2, Compass } from "lucide-react";

export default function FeedLoading() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-white flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="relative">
          <div className="h-20 w-20 bg-brand-cyan/10 border border-brand-cyan/30 rounded-3xl flex items-center justify-center backdrop-blur-md relative z-10">
            <Compass className="h-10 w-10 text-brand-cyan animate-spin-slow" />
          </div>
          <div className="absolute inset-0 bg-brand-cyan/20 blur-xl rounded-full animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black tracking-widest text-white drop-shadow-md">WANDERCALL</h2>
          <div className="flex items-center gap-2 text-brand-cyan">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Tuning Frequencies...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
