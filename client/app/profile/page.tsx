"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/lib/store/store";
import { useUserProfileQuery } from "@/hooks/api/useUserQueries";
import ProfileRenderer from "@/components/profile/ProfileRenderer";

export default function ProfilePage() {
  const authUserId = useAppSelector((state) => state.auth.userId);
  const { data: userProfile, isLoading, error } = useUserProfileQuery(authUserId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-50">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
          Decrypting Explorer Passport...
        </p>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6 text-center z-50">
        <h1 className="text-xl font-black text-white">Error Loading Passport</h1>
        <p className="text-xs text-zinc-400 max-w-sm">
          Failed to fetch your explorer profile. Please try logging in again or refresh.
        </p>
      </div>
    );
  }

  return <ProfileRenderer profile={userProfile} />;
}
