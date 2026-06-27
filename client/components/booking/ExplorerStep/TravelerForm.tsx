"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { TravelerData } from "@/types/booking";
import InviteFriendsModal from "./InviteFriendsModal";

interface TravelerFormProps {
  travelersDetails: TravelerData[];
  setTravelersDetails: React.Dispatch<React.SetStateAction<TravelerData[]>>;
}

export default function TravelerForm({
  travelersDetails,
  setTravelersDetails,
}: TravelerFormProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    if (activeIndex >= travelersDetails.length) {
      setActiveIndex(Math.max(0, travelersDetails.length - 1));
    }
  }, [travelersDetails.length, activeIndex]);

  const handleChange = (index: number, field: keyof TravelerData, value: string) => {
    setTravelersDetails((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const currentTraveler = travelersDetails[activeIndex] || {
    name: "", age: "", phone: "", emergencyContact: ""
  };
  const isLead = activeIndex === 0;
  const total = travelersDetails.length;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col gap-6 shadow-xl text-left w-full relative">
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <User className={`h-4.5 w-4.5 ${isLead ? "text-brand-cyan" : "text-brand-purple"}`} />
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
            {isLead ? "Lead Explorer Details (Contact)" : `Explorer #${activeIndex + 1} Details`}
          </h4>
        </div>

        {/* Add Friends Button at Top Right Corner */}
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="h-8 px-3 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer select-none"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Friends</span>
        </button>
      </div>

      {/* Single Paginated Form Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Full Name {isLead && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                placeholder="Enter full legal name"
                value={currentTraveler.name}
                onChange={(e) => handleChange(activeIndex, "name", e.target.value)}
                className="w-full h-11 bg-zinc-950/50 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-brand-cyan transition-all"
              />
            </div>

            {/* Age (replaces Email Address) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Age (Years) {isLead && <span className="text-red-400">*</span>}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 25"
                value={currentTraveler.age}
                onChange={(e) => handleChange(activeIndex, "age", e.target.value)}
                className="w-full h-11 bg-zinc-950/50 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-brand-cyan transition-all"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Phone Number {isLead && <span className="text-red-400">*</span>}
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={currentTraveler.phone}
                onChange={(e) => handleChange(activeIndex, "phone", e.target.value)}
                className="w-full h-11 bg-zinc-950/50 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-brand-cyan transition-all"
              />
            </div>

            {/* Emergency Contact */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Emergency Contact {isLead && <span className="text-red-400">*</span>}
              </label>
              <input
                type="tel"
                placeholder="Relative / Guardian phone"
                value={currentTraveler.emergencyContact}
                onChange={(e) => handleChange(activeIndex, "emergencyContact", e.target.value)}
                className="w-full h-11 bg-zinc-950/50 border border-white/10 rounded-xl px-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-brand-cyan transition-all"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Internal Navigation Controls for switching between Explorer forms */}
      {total > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((prev) => prev - 1)}
            className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-mono font-bold uppercase text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer select-none"
          >
            <ChevronLeft className="h-4 w-4" /> Previous Explorer
          </button>

          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider select-none">
            Explorer {activeIndex + 1} of {total}
          </span>

          <button
            type="button"
            disabled={activeIndex === total - 1}
            onClick={() => setActiveIndex((prev) => prev + 1)}
            className="h-9 px-3 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/30 text-xs font-mono font-bold uppercase text-brand-cyan disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer select-none"
          >
            Next Explorer <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Standalone Centered Invite Friends Modal Popup */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
