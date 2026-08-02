"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { usePublicProfileQuery } from "@/hooks/api/useUserQueries";
import ProfileRenderer from "@/components/profile/ProfileRenderer";

export default function ExplorerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  // Query user details from the backend
  const { data: dbProfile, isLoading: isProfileLoading, error: profileError } = usePublicProfileQuery(username);

  if (isProfileLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-mesh-premium flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-gray-500 uppercase tracking-widest animate-pulse">
          Decrypting Explorer Passport...
        </p>
      </div>
    );
  }

  if (profileError || !dbProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] w-full bg-mesh-premium flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
          <X className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Explorer Passport Not Found</h1>
        <p className="text-xs text-gray-500 max-w-sm">
          The username <span className="font-mono text-brand-cyan">@{username}</span> does not exist or has not initialized their digital passport yet.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-gray-900 transition-all cursor-pointer shadow-sm"
        >
          Return to Basecamp
        </button>
      </div>
    );
  }

  return <ProfileRenderer profile={dbProfile} />;
}
