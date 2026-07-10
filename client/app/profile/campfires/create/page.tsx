"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCampfire } from "../../../../hooks/api/useCampfire";
import { useCampfireDraft } from "./hooks/useCampfireDraft";
import { CampfireInfoPanel } from "./components/CampfireInfoPanel";
import { SmartSchedulerPanel } from "./components/SmartSchedulerPanel";
import {
  Flame,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function CreateCampfirePage() {
  const router = useRouter();
  const createCampfire = useCreateCampfire();
  const {
    draft,
    updateField,
    clearDraft,
  } = useCampfireDraft();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const triggerToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getRoomSlug = (room: any) => {
    const titleSlug = (room.title || "campfire")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${room.id}--${titleSlug}`;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!draft.title.trim() || draft.title.trim().length < 3) {
      triggerToast("Please provide a valid campfire title (at least 3 characters).", "error");
      return;
    }

    if (draft.visibility === "private" && (!draft.password || draft.password.length !== 6)) {
      triggerToast("Private spaces require a 6-digit numeric passcode.", "error");
      return;
    }

    let scheduledStartAt: string | undefined = undefined;
    if (draft.scheduleMode === "scheduled") {
      if (!draft.scheduledDate || !draft.scheduledTime) {
        triggerToast("Please pick a future date and time for your scheduled space.", "error");
        return;
      }
      const targetDate = new Date(`${draft.scheduledDate}T${draft.scheduledTime}:00`);
      if (targetDate <= new Date()) {
        triggerToast("The selected scheduled time is in the past. Please select a future time.", "error");
        return;
      }
      scheduledStartAt = targetDate.toISOString();
    }

    try {
      const mapCategory = (cat: string): string => {
        const c = (cat || "").toUpperCase().replace(/[^A-Z]/g, "");
        if (c.includes("FOOD")) return "FOOD";
        if (c.includes("PHOTO")) return "PHOTOGRAPHY";
        if (c.includes("STORY")) return "STORYTELLING";
        if (c.includes("TRAVEL")) return "TRAVEL";
        if (c.includes("LEARN")) return "LEARNING";
        return "ADVENTURE";
      };

      const mapMood = (m: string): string => {
        const moodStr = (m || "").toUpperCase();
        if (moodStr === "DEEP DISCUSSION" || moodStr.includes("DEEP")) return "DEEP_DISCUSSION";
        if (moodStr.includes("STORY")) return "STORYTELLING";
        if (moodStr.includes("LEARN")) return "LEARNING";
        if (moodStr.includes("CASUAL")) return "CASUAL";
        if (moodStr.includes("TRAVEL")) return "TRAVEL";
        if (moodStr.includes("ADVENTURE")) return "ADVENTURE";
        return "STORYTELLING";
      };

      const createdRoom = await createCampfire.mutateAsync({
        communityId: "00000000-0000-0000-0000-000000000000",
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: mapCategory(draft.category) as any,
        mood: mapMood(draft.mood) as any,
        visibility: draft.visibility.toUpperCase() as any,
        scheduledStartAt,
        settings: {
          isPrivate: draft.visibility === "private",
          password: draft.visibility === "private" ? draft.password : undefined,
          capacity: 50, // Fixed backend value
        },
      } as any);

      if (createdRoom.visibility === "PRIVATE" || draft.visibility === "private") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`authorized_campfire_${createdRoom.id}`, "true");
        }
      }

      clearDraft();
      triggerToast(
        draft.scheduleMode === "scheduled"
          ? "Campfire scheduled successfully!"
          : "Campfire created successfully! Entering space...",
        "success"
      );

      // Redirect based on schedule mode (use replace so browser back goes to /profile/campfires, not /create)
      if (typeof window !== "undefined" && window.history) {
        window.history.replaceState(null, "", "/profile/campfires");
      }
      if (draft.scheduleMode === "immediate" || !scheduledStartAt) {
        router.replace(`/profile/campfires/${getRoomSlug(createdRoom as any)}`);
      } else {
        router.replace("/profile/campfires?tab=hosted");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to create campfire space. Please check your network.";
      triggerToast(errorMsg, "error");
    }
  };

  const isFormValid = draft.title.trim().length >= 3 &&
    (draft.visibility !== "private" || (!!draft.password && draft.password.length === 6));

  return (
    <div className="min-h-screen lg:h-[calc(100vh-80px)] w-full bg-brand-bg text-white flex flex-col overflow-x-hidden lg:overflow-hidden relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
            toastType === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/40 text-rose-300"
          }`}
        >
          {toastType === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="shrink-0 h-16 px-4 md:px-8 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center shrink-0">
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">Light a Digital Campfire</h1>
            <p className="text-[10px] text-zinc-400 hidden sm:block">Canonical creation workspace & scheduler</p>
          </div>
        </div>

        {/* Status indicator and Top Create Action on right */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-bold text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Auto-Draft Active</span>
          </div>

          {/* Create button at top header section replacing Enterprise Scheduler tag */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={createCampfire.isPending || !isFormValid}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-lg cursor-pointer ${
              !isFormValid
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                : draft.scheduleMode === "immediate"
                ? "bg-gradient-to-r from-brand-cyan to-teal-400 text-zinc-950 hover:brightness-110 shadow-brand-cyan/20"
                : "bg-gradient-to-r from-brand-amber to-yellow-400 text-zinc-950 hover:brightness-110 shadow-brand-amber/20"
            }`}
          >
            {createCampfire.isPending ? (
              <div className="h-3.5 w-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : draft.scheduleMode === "immediate" ? (
              <Flame className="h-3.5 w-3.5 fill-zinc-950" />
            ) : (
              <Calendar className="h-3.5 w-3.5" />
            )}
            <span>{draft.scheduleMode === "immediate" ? "Light & Join" : "Create Schedule"}</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Enterprise Dashboard (No-scroll on Desktop lg:, stack & scroll on mobile <lg) */}
      {/* 1. Core Campfire Parameters (col-span-7 ~ 58%) MORE THAN 2. Smart Schedule (col-span-5 ~ 42%) */}
      <main className="flex-1 p-4 md:p-6 lg:p-6 pb-28 lg:pb-6 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left Panel: Core Information (Col 1-7) */}
        <section className="lg:col-span-7 bg-zinc-950/40 border border-white/5 rounded-3xl p-5 lg:h-full lg:overflow-hidden shadow-2xl flex flex-col justify-between">
          <CampfireInfoPanel draft={draft} updateField={updateField} />
        </section>

        {/* Right Panel: Smart Schedule & Submit CTA (Col 8-12) */}
        <section className="lg:col-span-5 bg-zinc-950/40 border border-white/5 rounded-3xl p-5 lg:h-full lg:overflow-hidden shadow-2xl flex flex-col justify-between">
          <SmartSchedulerPanel
            draft={draft}
            updateField={updateField}
            onSubmit={handleSubmit}
            isSubmitting={createCampfire.isPending}
          />
        </section>
      </main>

      {/* Mobile Sticky Bottom CTA Bar (< lg only) */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-between gap-4 shadow-2xl">
        <div className="text-left shrink-0">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mode</p>
          <p className="text-xs font-extrabold text-white">
            {draft.scheduleMode === "immediate" ? "🔥 Immediate Live" : "⏱️ Scheduled Space"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={createCampfire.isPending || !isFormValid}
          className={`flex-1 py-3 px-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
            !isFormValid
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
              : draft.scheduleMode === "immediate"
              ? "bg-brand-cyan text-zinc-950 hover:bg-brand-cyan/90 shadow-brand-cyan/20"
              : "bg-brand-amber text-zinc-950 hover:bg-brand-amber/90 shadow-brand-amber/20"
          }`}
        >
          {createCampfire.isPending ? (
            <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Flame className="h-4 w-4 fill-zinc-950" />
          )}
          <span>{draft.scheduleMode === "immediate" ? "Light & Join Campfire" : "Confirm Schedule"}</span>
        </button>
      </footer>
    </div>
  );
}
