"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Sparkles, X, Check, CloudSun, ShieldCheck } from "lucide-react";
import { Slot } from "@/types/booking";

interface TimeSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
}

export default function TimeSlotModal({
  isOpen,
  onClose,
  selectedDate,
  selectedSlot,
  onSelectSlot,
}: TimeSlotModalProps) {
  if (!isOpen) return null;

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Selected Date";

  // Mock available time slots data for the selected date
  const availableSlots: Slot[] = [
    {
      id: "slot-1",
      time: "06:30 AM",
      remainingSeats: 4,
      guideName: "Captain Vikram Singh",
      language: "English, Hindi",
      popularity: "High Demand",
      recommendedReason: "Best Weather & Sunrise Views 🔥",
      isBestWeather: true,
    },
    {
      id: "slot-2",
      time: "09:30 AM",
      remainingSeats: 8,
      guideName: "Ananya Sharma",
      language: "English, Hindi, Kannada",
      popularity: "Least Crowded",
      recommendedReason: "Smooth thermal currents ✨",
    },
    {
      id: "slot-3",
      time: "02:00 PM",
      remainingSeats: 2,
      guideName: "Rohan Verma",
      language: "English, Hindi",
      popularity: "Selling Fast",
      recommendedReason: "Warm sunny afternoon flight",
    },
    {
      id: "slot-4",
      time: "04:30 PM",
      remainingSeats: 6,
      guideName: "Captain Vikram Singh",
      language: "English, Hindi",
      popularity: "Golden Hour Glow",
      recommendedReason: "Stunning Sunset panorama 🌅",
    },
  ];

  const handleChoose = (slot: Slot) => {
    onSelectSlot(slot);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal / Bottom Sheet Box */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg glass-panel bg-zinc-950/95 border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-widest block">Select Departure Slot</span>
              <h3 className="text-base font-black text-white uppercase tracking-tight mt-0.5">{formattedDate}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center border border-white/5 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Slots list */}
          <div className="flex flex-col gap-3">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <div
                  key={slot.id}
                  onClick={() => handleChoose(slot)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                    isSelected
                      ? "bg-brand-cyan/10 border-brand-cyan shadow-lg shadow-brand-cyan/10"
                      : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${isSelected ? "text-brand-cyan" : "text-zinc-400"}`} />
                      <span className="text-base font-black text-white font-sans">{slot.time}</span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      slot.remainingSeats <= 3
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    }`}>
                      {slot.remainingSeats} Seats Left
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-400 pt-1 border-t border-white/5">
                    <span>Guide: <strong className="text-zinc-200">{slot.guideName}</strong></span>
                    <span className="text-zinc-500">{slot.language}</span>
                  </div>

                  {slot.recommendedReason && (
                    <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-md w-fit mt-1">
                      <Sparkles className="h-3 w-3 animate-pulse" /> {slot.recommendedReason}
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-cyan text-zinc-950 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-zinc-500 text-center flex items-center justify-center gap-1 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>All departure slots are guaranteed with verified equipment inspection.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
