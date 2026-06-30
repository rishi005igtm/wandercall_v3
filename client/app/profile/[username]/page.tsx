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
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-50">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
          Decrypting Explorer Passport...
        </p>
      </div>
    );
  }

  if (profileError || !dbProfile) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 p-6 text-center z-50">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
          <X className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-black text-white">Explorer Passport Not Found</h1>
        <p className="text-xs text-zinc-400 max-w-sm">
          The username <span className="font-mono text-brand-cyan">@{username}</span> does not exist or has not initialized their digital passport yet.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
        >
          Return to Basecamp
        </button>
      </div>
    );
  }

  return <ProfileRenderer profile={dbProfile} />;
}
