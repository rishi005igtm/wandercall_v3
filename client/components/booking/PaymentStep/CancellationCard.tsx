"use client";

import React from "react";
import { ShieldCheck, RefreshCw, PhoneCall, HeartPulse, Lock } from "lucide-react";

export default function CancellationCard() {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col gap-5 text-left shadow-xl select-none">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
        <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Trust, Safety & Refund Warranties</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono">
            <RefreshCw className="h-4 w-4" /> 100% Refund Policy
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            Cancel up to 72 hours before departure for a full 100% money-back refund directly to your original bank account.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-brand-cyan font-bold text-xs uppercase font-mono">
            <PhoneCall className="h-4 w-4" /> 24/7 SOS Expedition Dispatch
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            Direct satellite emergency link and ground team dispatch standby assigned exclusively to your flight.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-brand-purple font-bold text-xs uppercase font-mono">
            <HeartPulse className="h-4 w-4" /> Certified Pilot & Equipment
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            DGCA certified instructors with over 1000+ flight hours and daily reserve parachute safety checks.
          </p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase font-mono">
            <Lock className="h-4 w-4" /> Encrypted Cashfree Portal
          </div>
          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
            PCI-DSS Level 1 compliant 256-bit bank level SSL connection protecting all transactions.
          </p>
        </div>
      </div>
    </div>
  );
}
