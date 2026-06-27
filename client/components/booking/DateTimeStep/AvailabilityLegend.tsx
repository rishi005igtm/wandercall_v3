"use client";

import React from "react";

export default function AvailabilityLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/5 pt-4 text-[9px] font-mono font-bold text-zinc-500 select-none">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span>Available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        <span>Few Left</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span>Fully Booked</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-zinc-700" />
        <span>Closed / Blocked</span>
      </div>
    </div>
  );
}
