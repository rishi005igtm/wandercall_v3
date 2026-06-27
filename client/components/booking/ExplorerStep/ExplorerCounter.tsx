"use client";

import React from "react";
import { Users, Plus, Minus } from "lucide-react";

interface ExplorerCounterProps {
  adultsCount: number;
  setAdultsCount: React.Dispatch<React.SetStateAction<number>>;
  childrenCount: number;
  setChildrenCount: React.Dispatch<React.SetStateAction<number>>;
  isPrivateGroup: boolean;
  setIsPrivateGroup: React.Dispatch<React.SetStateAction<boolean>>;
  maxSlots?: number;
}

export default function ExplorerCounter({
  adultsCount,
  setAdultsCount,
  childrenCount,
  setChildrenCount,
  maxSlots = 10,
}: ExplorerCounterProps) {
  const total = adultsCount + childrenCount;

  const handleAdultsChange = (delta: number) => {
    const next = adultsCount + delta;
    if (next >= 1 && next + childrenCount <= maxSlots) {
      setAdultsCount(next);
    }
  };

  const handleChildrenChange = (delta: number) => {
    const next = childrenCount + delta;
    if (next >= 0 && adultsCount + next <= maxSlots) {
      setChildrenCount(next);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col gap-6 text-left shadow-xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-brand-purple" />
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Explorer Counter</h3>
        </div>
        <span className="text-[10px] font-mono font-black text-brand-purple bg-brand-purple/10 px-3 py-1 rounded-full uppercase tracking-wider border border-brand-purple/20">
          {total} {total === 1 ? "Traveler" : "Travelers"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Adults counter */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-white uppercase block">Adults</span>
            <span className="text-[10px] font-mono text-zinc-500">Age 12+ years</span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              disabled={adultsCount <= 1}
              onClick={() => handleAdultsChange(-1)}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-mono font-black text-white w-4 text-center">{adultsCount}</span>
            <button
              type="button"
              disabled={total >= maxSlots}
              onClick={() => handleAdultsChange(1)}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Children counter */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-sm font-black text-white uppercase block">Children</span>
            <span className="text-[10px] font-mono text-zinc-500">Age 5-11 years</span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950/60 p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              disabled={childrenCount <= 0}
              onClick={() => handleChildrenChange(-1)}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-sm font-mono font-black text-white w-4 text-center">{childrenCount}</span>
            <button
              type="button"
              disabled={total >= maxSlots}
              onClick={() => handleChildrenChange(1)}
              className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
