"use client";

import React from "react";
import { CloudSun, Users, Compass, Clock, Sparkles, Languages, ShieldCheck } from "lucide-react";
import { Slot } from "@/types/booking";

interface DateDetailsPanelProps {
  selectedDate: string;
  selectedSlot: Slot | null;
  experienceDuration: string;
  onOpenSlotModal: () => void;
}

export default function DateDetailsPanel({
  selectedDate,
  selectedSlot,
  experienceDuration,
  onOpenSlotModal,
}: DateDetailsPanelProps) {
  if (!selectedDate) {
    return (
      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[320px] select-none">
        <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-brand-cyan">
          <Compass className="h-6 w-6 animate-spin-slow" />
        </div>
        <h4 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider">No Date Selected</h4>
        <p className="text-xs text-zinc-500 max-w-xs font-sans">
          Click on an available date in the calendar to view weather forecasts, guide info, and departure slots.
        </p>
      </div>
    );
  }

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col justify-between gap-6 text-left h-full shadow-xl">
      <div className="flex flex-col gap-4">
        {/* Date header badge */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-widest block">Selected Departure</span>
            <h3 className="text-base font-black text-white uppercase tracking-tight mt-1">{formattedDate}</h3>
          </div>
          <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
            High Demand
          </span>
        </div>

        {/* Dynamic highlights grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <CloudSun className="h-3.5 w-3.5 text-yellow-400" /> Weather
            </span>
            <span className="text-zinc-200 font-semibold text-[11px]">Clear & Sunny, 24°C</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-brand-purple" /> Crowd Level
            </span>
            <span className="text-zinc-200 font-semibold text-[11px]">Moderate Demand</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-cyan" /> Duration
            </span>
            <span className="text-zinc-200 font-semibold text-[11px]">{experienceDuration}</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[8px] font-bold text-zinc-500 uppercase flex items-center gap-1">
              <Languages className="h-3.5 w-3.5 text-emerald-400" /> Languages
            </span>
            <span className="text-zinc-200 font-semibold text-[11px]">English & Hindi</span>
          </div>
        </div>

        {/* Selected Slot info */}
        <div className="bg-brand-cyan/5 border border-brand-cyan/20 p-4 rounded-2xl flex flex-col gap-2.5 mt-1">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-pulse" /> Chosen Departure Time
            </span>
            <button
              type="button"
              onClick={onOpenSlotModal}
              className="text-[9px] font-mono font-black text-white hover:text-brand-cyan underline uppercase tracking-wider cursor-pointer"
            >
              {selectedSlot ? "Change Slot" : "Select Slot"}
            </button>
          </div>

          {selectedSlot ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-black text-white font-sans">{selectedSlot.time}</span>
                <span className="text-[10px] font-mono text-zinc-400 block">Guide: {selectedSlot.guideName}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {selectedSlot.remainingSeats} Seats Left
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenSlotModal}
              className="w-full h-10 rounded-xl bg-brand-cyan text-zinc-950 font-black text-xs uppercase tracking-widest hover:bg-brand-cyan/90 transition-all cursor-pointer shadow-lg shadow-brand-cyan/20 flex items-center justify-center gap-1.5 mt-1"
            >
              <span>Choose Time Slot</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 border-t border-white/5 pt-3">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>Instant booking verification & certified expedition guide assigned.</span>
      </div>
    </div>
  );
}
