"use client";

import { useState, useEffect, useCallback } from "react";

export interface CampfireDraftState {
  title: string;
  description: string;
  category: string;
  mood: string;
  visibility: "public" | "private";
  password?: string;
  scheduleMode: "immediate" | "scheduled";
  scheduledDate?: string;
  scheduledTime?: string;
  capacity: number;
}

export const DEFAULT_DRAFT_STATE: CampfireDraftState = {
  title: "",
  description: "",
  category: "ADVENTURE",
  mood: "STORYTELLING",
  visibility: "public",
  password: "",
  scheduleMode: "immediate",
  scheduledDate: "",
  scheduledTime: "20:00",
  capacity: 50,
};

const DRAFT_STORAGE_KEY = "wandercall_campfire_draft_v1";

export const useCampfireDraft = () => {
  const [draft, setDraft] = useState<CampfireDraftState>(DEFAULT_DRAFT_STATE);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed: Partial<CampfireDraftState> = JSON.parse(saved);
        if (parsed && (parsed.title || parsed.description || parsed.scheduledDate)) {
          let cat = parsed.category || "ADVENTURE";
          if (cat.toUpperCase().includes("FOOD")) cat = "FOOD";
          else if (cat.toUpperCase().includes("PHOTO")) cat = "PHOTOGRAPHY";
          else if (cat.toUpperCase().includes("STORY")) cat = "STORYTELLING";
          else if (cat.toUpperCase().includes("TRAVEL")) cat = "TRAVEL";
          else if (cat.toUpperCase().includes("LEARN")) cat = "LEARNING";
          else cat = "ADVENTURE";

          let mood = parsed.mood || "STORYTELLING";
          if (mood.toUpperCase().includes("DEEP")) mood = "DEEP_DISCUSSION";
          else if (mood.toUpperCase().includes("STORY")) mood = "STORYTELLING";
          else if (mood.toUpperCase().includes("LEARN")) mood = "LEARNING";
          else if (mood.toUpperCase().includes("CASUAL")) mood = "CASUAL";
          else if (mood.toUpperCase().includes("TRAVEL")) mood = "TRAVEL";
          else mood = "ADVENTURE";

          setDraft({
            ...DEFAULT_DRAFT_STATE,
            ...parsed,
            category: cat,
            mood: mood,
          });
          setHasRestoredDraft(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse campfire draft from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage whenever draft changes (debounced effect or clean sync)
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      const hasContent =
        draft.title.trim() !== "" ||
        draft.description.trim() !== "" ||
        (draft.scheduleMode === "scheduled" && draft.scheduledDate !== "");

      if (hasContent) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save campfire draft:", e);
    }
  }, [draft, isLoaded]);

  const updateField = useCallback(<K extends keyof CampfireDraftState>(field: K, value: CampfireDraftState[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    setDraft(DEFAULT_DRAFT_STATE);
    setHasRestoredDraft(false);
  }, []);

  return {
    draft,
    setDraft,
    updateField,
    clearDraft,
    hasRestoredDraft,
    setHasRestoredDraft,
    isLoaded,
  };
};
