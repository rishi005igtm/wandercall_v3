"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  Radio,
  Users,
  Sparkles,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { CampfireDraftState } from "../hooks/useCampfireDraft";

interface LivePreviewPanelProps {
  draft: CampfireDraftState;
  hasRestoredDraft: boolean;
  clearDraft: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
  draft,
  hasRestoredDraft,
  clearDraft,
  onSubmit,
  isSubmitting,
}) => {
  // Validation status
  const titleValid = draft.title.trim().length >= 3 && draft.title.trim().length <= 150;
  const passcodeValid = draft.visibility === "public" || (draft.password !== undefined && draft.password.length === 6);

  const scheduleValid = useMemo(() => {
    if (draft.scheduleMode === "immediate") return true;
    if (!draft.scheduledDate || !draft.scheduledTime) return false;
    const target = new Date(`${draft.scheduledDate}T${draft.scheduledTime}:00`);
    return target > new Date();
  }, [draft.scheduleMode, draft.scheduledDate, draft.scheduledTime]);

  const isFormValid = titleValid && passcodeValid && scheduleValid;

  // Countdown badge
  const countdownText = useMemo(() => {
    if (draft.scheduleMode === "immediate") {
      return "Starting immediately right now";
    }
    if (!draft.scheduledDate || !draft.scheduledTime) {
      return "Pick a valid future date & time";
    }
    const target = new Date(`${draft.scheduledDate}T${draft.scheduledTime}:00`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "Time has passed — please adjust";

    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const minutes = Math.floor((diffMs % 3600000) / 60000);

    if (days > 0) {
      return `Starts in ${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
      return `Starts in ${hours}h ${minutes}m`;
    }
    return `Starts in ${minutes}m`;
  }, [draft.scheduleMode, draft.scheduledDate, draft.scheduledTime]);

  return (
    <div className="flex flex-col justify-between gap-6 h-full overflow-y-auto no-scrollbar pr-1">
      {/* Top section: Title and Draft Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
            3. Live Realtime Preview
          </h2>
          {hasRestoredDraft && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-[10px] font-bold text-zinc-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-white/10 hover:border-rose-500/30 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
              Discard Draft
            </button>
          )}
        </div>

        {/* Card Replica Preview */}
        <div className="relative group bg-zinc-950/90 rounded-3xl border border-white/10 p-5 shadow-2xl overflow-hidden transition-all hover:border-brand-cyan/40">
          {/* Top glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header: Category & Visibility Badges */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {draft.category}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg">
                #{draft.mood}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              {draft.visibility === "private" ? (
                <>
                  <Lock className="h-3 w-3 text-brand-purple" />
                  <span className="text-brand-purple font-extrabold">Private Room</span>
                </>
              ) : (
                <>
                  <Radio className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 font-extrabold">Public Space</span>
                </>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div className="mb-4 relative z-10 min-h-[60px]">
            <h3 className="text-sm md:text-base font-extrabold text-white leading-snug break-words">
              {draft.title.trim() || "Untitled Campfire Space..."}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed break-words">
              {draft.description.trim() || "No topic description provided yet. Add guidelines or prompts for your speakers..."}
            </p>
          </div>

          {/* Host & Status Bar */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-xs font-bold text-brand-cyan">
                You
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">Hosted by You</p>
                <p className="text-[9px] text-zinc-500">Host & Moderator</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] font-extrabold text-zinc-300">
                <Users className="h-3 w-3 text-brand-purple" />
                <span>0 / {draft.capacity}</span>
              </div>
              <span
                className={`text-[9px] font-bold mt-0.5 block ${
                  draft.scheduleMode === "immediate" ? "text-emerald-400 animate-pulse" : "text-brand-amber"
                }`}
              >
                {draft.scheduleMode === "immediate" ? "● LIVE RIGHT NOW" : "⏱️ SCHEDULED"}
              </span>
            </div>
          </div>

          {/* Countdown indicator bar inside card */}
          <div className="mt-3.5 bg-white/[0.03] rounded-xl px-3 py-2 border border-white/5 flex items-center justify-between text-[11px] font-bold">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-brand-cyan" />
              Timing Status:
            </span>
            <span className={draft.scheduleMode === "immediate" ? "text-brand-cyan" : scheduleValid ? "text-brand-amber" : "text-rose-400"}>
              {countdownText}
            </span>
          </div>
        </div>

        {/* Validation Status Checklist */}
        <div className="bg-zinc-950/80 rounded-2xl border border-white/10 p-4 space-y-2.5 shadow-inner">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-cyan" />
            Validation Checks
          </span>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Title provided (3 to 150 chars)</span>
            {titleValid ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-500 font-bold text-[11px]">
                <AlertCircle className="h-3.5 w-3.5" /> Required
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300">Valid Schedule Date & Time</span>
            {scheduleValid ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-bold text-[11px]">
                <AlertCircle className="h-3.5 w-3.5" /> Past or missing
              </span>
            )}
          </div>

          {draft.visibility === "private" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">6-Digit Room Passcode</span>
              {passcodeValid ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                  <AlertCircle className="h-3.5 w-3.5" /> 6 Digits Required
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary CTA Submit Button */}
      <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isFormValid || isSubmitting}
          className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
            !isFormValid
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
              : draft.scheduleMode === "immediate"
              ? "bg-brand-cyan text-zinc-950 hover:bg-brand-cyan/90 shadow-brand-cyan/25 scale-[1.01]"
              : "bg-brand-amber text-zinc-950 hover:bg-brand-amber/90 shadow-brand-amber/25 scale-[1.01]"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>{draft.scheduleMode === "immediate" ? "Lighting Campfire..." : "Scheduling Space..."}</span>
            </div>
          ) : draft.scheduleMode === "immediate" ? (
            <>
              <Flame className="h-5 w-5 fill-zinc-950 animate-pulse" />
              <span>Light & Join Campfire Right Now</span>
            </>
          ) : (
            <>
              <Calendar className="h-5 w-5" />
              <span>Confirm & Schedule Campfire</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center">
          🔒 Creating a Campfire initiates atomic real-time updates across the Galaxy & Hosted Workspace.
        </p>
      </div>
    </div>
  );
};
