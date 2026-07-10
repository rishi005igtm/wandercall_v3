"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
  Globe,
  AlertTriangle,
  Users,
  Check,
} from "lucide-react";
import { CampfireDraftState } from "../hooks/useCampfireDraft";

interface SmartSchedulerPanelProps {
  draft: CampfireDraftState;
  updateField: <K extends keyof CampfireDraftState>(field: K, value: CampfireDraftState[K]) => void;
  onSubmit?: (e?: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const SmartSchedulerPanel: React.FC<SmartSchedulerPanelProps> = ({
  draft,
  updateField,
  onSubmit,
  isSubmitting = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const timezoneStr = useMemo(() => {
    if (typeof window === "undefined") return "UTC";
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local Timezone";
    } catch {
      return "Local Timezone";
    }
  }, []);

  const handleModeSelect = (mode: "immediate" | "scheduled") => {
    updateField("scheduleMode", mode);
    if (mode === "immediate") {
      updateField("scheduledDate", "");
    } else if (mode === "scheduled" && !draft.scheduledDate) {
      const tom = new Date(Date.now() + 86400000);
      const year = tom.getFullYear();
      const month = String(tom.getMonth() + 1).padStart(2, "0");
      const day = String(tom.getDate()).padStart(2, "0");
      updateField("scheduledDate", `${year}-${month}-${day}`);
      updateField("scheduledTime", "19:00");
    }
  };

  // Generate 15-minute time slots
  const timeSlots = useMemo(() => {
    const slots: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const valH = String(h).padStart(2, "0");
        const valM = String(m).padStart(2, "0");
        const value = `${valH}:${valM}`;

        const ampm = h >= 12 ? "PM" : "AM";
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const label = `${displayH}:${valM} ${ampm}`;
        slots.push({ value, label });
      }
    }
    return slots;
  }, []);

  // Calendar Grid generation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: { date: Date; dateStr: string; isPast: boolean; isToday: boolean; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, 1 - (firstDay - i));
      const ds = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
      days.push({
        date: prevDate,
        dateStr: ds,
        isPast: prevDate < today,
        isToday: false,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: curDate,
        dateStr: ds,
        isPast: curDate < today,
        isToday: curDate.getTime() === today.getTime(),
        isCurrentMonth: true,
      });
    }

    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const isScheduleInvalid = useMemo(() => {
    if (draft.scheduleMode !== "scheduled") return false;
    if (!draft.scheduledDate || !draft.scheduledTime) return true;
    const selected = new Date(`${draft.scheduledDate}T${draft.scheduledTime}:00`);
    return selected <= new Date();
  }, [draft.scheduleMode, draft.scheduledDate, draft.scheduledTime]);

  const isFormValid = useMemo(() => {
    if (!draft.title.trim() || draft.title.trim().length < 3) return false;
    if (draft.visibility === "private" && (!draft.password || draft.password.length !== 6)) return false;
    if (draft.scheduleMode === "scheduled" && isScheduleInvalid) return false;
    return true;
  }, [draft.title, draft.visibility, draft.password, draft.scheduleMode, isScheduleInvalid]);

  return (
    <div className="flex flex-col justify-between h-full overflow-y-auto no-scrollbar gap-6 pr-1">
      <div className="space-y-6">
        {/* Section Header */}
        <div>
          <h2 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-amber animate-pulse" />
            2. Smart Schedule & Launch
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1">
            Launch live immediately or pick an exact future time for your community space.
          </p>
        </div>

        {/* Mode Segmented Control */}
        <div className="bg-zinc-950 p-1.5 rounded-2xl border border-white/10 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleModeSelect("immediate")}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              draft.scheduleMode === "immediate"
                ? "bg-brand-cyan text-zinc-950 shadow-md shadow-brand-cyan/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Flame className={`h-4 w-4 ${draft.scheduleMode === "immediate" ? "fill-zinc-950 animate-bounce" : ""}`} />
            Start Right Now
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect("scheduled")}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              draft.scheduleMode === "scheduled"
                ? "bg-brand-amber text-zinc-950 shadow-md shadow-brand-amber/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Schedule for Later
          </button>
        </div>

        {/* Immediate Mode Info Card */}
        {draft.scheduleMode === "immediate" && (
          <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-brand-cyan flex items-center gap-1.5">
                <Flame className="h-4 w-4 fill-brand-cyan" /> Instant Live Campfire
              </span>
              <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-brand-purple" /> Max 50 Capacity
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your digital campfire will open immediately when you click the button below. Explorers across the Wandercall network will be notified and can drop into your space instantly.
            </p>
            <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-[11px] text-zinc-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" /> High-fidelity voice & chat
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Auto moderation tools
              </span>
            </div>
          </div>
        )}

        {/* Interactive Calendar & Time Picker if Scheduled */}
        <AnimatePresence>
          {draft.scheduleMode === "scheduled" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-5"
            >
              {/* Calendar Grid Box */}
              <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-white tracking-wide">{monthLabel}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span key={day} className="text-[10px] font-bold text-zinc-500 uppercase">
                      {day}
                    </span>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {calendarDays.map((d, idx) => {
                    const isSelected = draft.scheduledDate === d.dateStr;
                    return (
                      <button
                        key={`${d.dateStr}-${idx}`}
                        type="button"
                        disabled={d.isPast || !d.isCurrentMonth}
                        onClick={() => updateField("scheduledDate", d.dateStr)}
                        className={`h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          !d.isCurrentMonth
                            ? "opacity-20 cursor-not-allowed text-zinc-600"
                            : d.isPast
                            ? "opacity-30 cursor-not-allowed text-zinc-600 bg-white/[0.02]"
                            : isSelected
                            ? "bg-brand-amber text-zinc-950 font-extrabold shadow-md scale-105"
                            : d.isToday
                            ? "border border-brand-amber/50 text-brand-amber bg-brand-amber/10 hover:bg-brand-amber/20"
                            : "text-zinc-300 hover:bg-white/10 cursor-pointer"
                        }`}
                      >
                        {d.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Picker & Timezone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-zinc-950/80 border border-white/10 p-3.5 rounded-2xl">
                  <label className="block text-[11px] font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-brand-amber" />
                    Start Time (15-min Intervals) *
                  </label>
                  <select
                    value={draft.scheduledTime || "20:00"}
                    onChange={(e) => updateField("scheduledTime", e.target.value)}
                    className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-brand-amber"
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label} ({slot.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-zinc-950/80 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
                  <label className="block text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-brand-cyan" />
                    Detected Timezone
                  </label>
                  <div className="mt-2 text-xs font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-2 rounded-xl flex items-center justify-between">
                    <span>{timezoneStr}</span>
                    <span className="text-[10px] text-brand-cyan/70">Automatic</span>
                  </div>
                </div>
              </div>

              {/* Validation Warning if past date/time */}
              {isScheduleInvalid && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center gap-2.5 text-amber-400 text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>The selected schedule time has already passed. Please pick a future date or time.</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Primary Submit CTA Button */}
      <div className="pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => onSubmit && onSubmit()}
          disabled={isSubmitting || !isFormValid}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer ${
            !isFormValid
              ? "bg-zinc-800/80 text-zinc-500 border border-white/5 cursor-not-allowed"
              : draft.scheduleMode === "immediate"
              ? "bg-gradient-to-r from-brand-cyan via-teal-400 to-brand-cyan text-zinc-950 hover:brightness-110 shadow-brand-cyan/25 scale-[1.01]"
              : "bg-gradient-to-r from-brand-amber via-yellow-400 to-brand-amber text-zinc-950 hover:brightness-110 shadow-brand-amber/25 scale-[1.01]"
          }`}
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Flame className="h-5 w-5 fill-zinc-950 animate-bounce" />
          )}
          <span>
            {draft.scheduleMode === "immediate"
              ? "Light & Join Campfire Right Now"
              : "Confirm & Schedule Campfire"}
          </span>
        </button>
        <p className="text-center text-[10px] text-zinc-500 mt-2.5 font-medium">
          Fixed Capacity: 50 Explorers • Creating initiates instant real-time network broadcast
        </p>
      </div>
    </div>
  );
};
