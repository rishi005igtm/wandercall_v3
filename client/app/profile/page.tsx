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
      <div className="min-h-[calc(100vh-4rem)] w-full bg-mesh-premium flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-gray-500 uppercase tracking-widest animate-pulse">
          Decrypting Explorer Passport...
        </p>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-mesh-premium flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-black text-gray-900">Error Loading Passport</h1>
        <p className="text-xs text-gray-500 max-w-sm">
          Failed to fetch your explorer profile. Please try logging in again or refresh.
        </p>
      </div>
    );
  }

  return <ProfileRenderer profile={userProfile} />;
}
