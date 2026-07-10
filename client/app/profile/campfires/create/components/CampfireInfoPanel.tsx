"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Camera,
  BookOpen,
  Plane,
  GraduationCap,
  Utensils,
  Radio,
  Lock,
  LockKeyhole,
  Check,
} from "lucide-react";
import { CampfireDraftState } from "../hooks/useCampfireDraft";

interface CampfireInfoPanelProps {
  draft: CampfireDraftState;
  updateField: <K extends keyof CampfireDraftState>(field: K, value: CampfireDraftState[K]) => void;
}

const CATEGORIES = [
  {
    id: "ADVENTURE",
    label: "Adventure",
    icon: Compass,
    description: "Mountain summits, trails & extreme expeditions",
    color: "brand-cyan",
  },
  {
    id: "FOOD",
    label: "Food & Culinary",
    icon: Utensils,
    description: "Street food secrets & world recipes",
    color: "brand-amber",
  },
  {
    id: "PHOTOGRAPHY",
    label: "Photography",
    icon: Camera,
    description: "Gear tips, editing & capturing raw moments",
    color: "brand-purple",
  },
  {
    id: "STORYTELLING",
    label: "Storytelling",
    icon: BookOpen,
    description: "Campfire legends & personal journeys",
    color: "brand-cyan",
  },
  {
    id: "TRAVEL",
    label: "Travel Hacks",
    icon: Plane,
    description: "Solo backpacking, visa guides & budgets",
    color: "brand-amber",
  },
  {
    id: "LEARNING",
    label: "Learning Hub",
    icon: GraduationCap,
    description: "Workshops, languages & skill exchanges",
    color: "brand-purple",
  },
];

const MOODS = [
  { id: "STORYTELLING", label: "Storytelling" },
  { id: "DEEP_DISCUSSION", label: "Deep Discussion" },
  { id: "LEARNING", label: "Learning" },
  { id: "CASUAL", label: "Casual" },
  { id: "ADVENTURE", label: "Adventure" },
  { id: "TRAVEL", label: "Travel" },
];

export const CampfireInfoPanel: React.FC<CampfireInfoPanelProps> = ({ draft, updateField }) => {
  const passcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (draft.visibility === "private") {
      const timer = setTimeout(() => {
        passcodeRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [draft.visibility]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar pr-1">
      {/* Section Header */}
      <div>
        <h2 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
          1. Core Campfire Parameters
        </h2>
        <p className="text-[11px] text-zinc-400 mt-1">
          Define your topic, theme category, and conversation atmosphere.
        </p>
      </div>

      {/* Title with Floating Label / Focus Ring */}
      <div className="relative group">
        <label className="block text-[11px] font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
          <span>Campfire Title *</span>
          <span className={`text-[10px] ${draft.title.length > 130 ? "text-amber-400 font-bold" : "text-zinc-500"}`}>
            {draft.title.length}/150
          </span>
        </label>
        <input
          type="text"
          required
          maxLength={150}
          value={draft.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Surviving solo hikes in the high Himalayas..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/40 transition-all shadow-inner"
        />
        <p className="text-[10px] text-zinc-500 mt-1.5 pl-1">
          Make it specific and inviting so explorers in the Galaxy know what stories to bring.
        </p>
      </div>

      {/* Description Textarea */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">
          Topic Guidelines & Rules (Optional)
        </label>
        <textarea
          rows={3}
          value={draft.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Outline what speakers should prepare, microphone etiquette, and key discussion prompts..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/40 transition-all resize-none shadow-inner"
        />
      </div>

      {/* Category Selector Cards */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-300 mb-2">
          Adventure Category *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = draft.category === cat.id;
            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateField("category", cat.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all relative flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "bg-brand-cyan/15 border-brand-cyan shadow-lg shadow-brand-cyan/10"
                    : "bg-zinc-950/60 border-white/5 hover:border-white/15"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-brand-cyan text-zinc-950 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-brand-cyan text-zinc-950" : "bg-white/5 text-zinc-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-xs font-bold leading-tight ${isSelected ? "text-white font-extrabold" : "text-zinc-300"}`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 line-clamp-1 leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mood Selector Chips */}
      <div>
        <label className="block text-[11px] font-bold text-zinc-300 mb-2">
          Campfire Mood *
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => {
            const isSelected = draft.mood === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                onClick={() => updateField("mood", mood.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-white text-zinc-950 border-white shadow-md font-extrabold scale-105"
                    : "bg-zinc-950/60 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                #{mood.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visibility Selectable Cards */}
      <div className="pt-2 border-t border-white/5">
        <label className="block text-[11px] font-bold text-zinc-300 mb-2">
          Access & Visibility
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => updateField("visibility", "public")}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              draft.visibility === "public"
                ? "bg-brand-cyan/15 border-brand-cyan shadow-md shadow-brand-cyan/10"
                : "bg-zinc-950/60 border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${draft.visibility === "public" ? "bg-brand-cyan text-zinc-950" : "bg-white/5 text-zinc-400"}`}>
                <Radio className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Public Space</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
              Discoverable in Galaxy & trending lists. Anyone can join freely.
            </p>
          </div>

          <div
            onClick={() => {
              updateField("visibility", "private");
              setTimeout(() => {
                passcodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              }, 300);
            }}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              draft.visibility === "private"
                ? "bg-brand-purple/15 border-brand-purple shadow-md shadow-brand-purple/10"
                : "bg-zinc-950/60 border-white/5 hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${draft.visibility === "private" ? "bg-brand-purple text-zinc-950" : "bg-white/5 text-zinc-400"}`}>
                <Lock className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-white">Private Room</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
              Protected by a 6-digit passcode. Hidden from public discovery.
            </p>
          </div>
        </div>

        {/* Passcode field animated in */}
        <AnimatePresence>
          {draft.visibility === "private" && (
            <motion.div
              ref={passcodeRef}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-brand-purple/10 border border-brand-purple/30 p-3.5 rounded-2xl">
                <label className="block text-[11px] font-bold text-brand-purple mb-1">
                  Set Room Passcode (6 Digits) *
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-purple/70" />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={draft.password || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                      updateField("password", val);
                    }}
                    placeholder="e.g., 849201"
                    className="w-full bg-zinc-950 border border-brand-purple/40 rounded-xl pl-10 pr-4 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-brand-purple"
                  />
                </div>
                <p className="text-[10px] text-brand-purple/70 mt-1 pl-1">
                  Share this passcode strictly with your invited friends or guests.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
