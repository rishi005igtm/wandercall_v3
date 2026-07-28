import React from "react";
import { Loader2, User } from "lucide-react";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex items-center justify-center pt-24">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="relative">
          <div className="h-20 w-20 bg-brand-purple/10 border border-brand-purple/30 rounded-3xl flex items-center justify-center backdrop-blur-md relative z-10">
            <User className="h-10 w-10 text-brand-purple animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-brand-purple/20 blur-xl rounded-full animate-pulse" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black tracking-widest text-white drop-shadow-md">LOADING PROFILE</h2>
          <div className="flex items-center gap-2 text-brand-purple">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Fetching identity...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
