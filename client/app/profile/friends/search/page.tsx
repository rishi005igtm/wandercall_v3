"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  Users,
  UserPlus,
  MessageSquare,
  X,
  Check,
  ShieldCheck
} from "lucide-react";
import { useFriends, useFollowBackMutation } from "@/hooks/api/useFriends";

// Companion Avatar helper component
function SearchCompanionAvatar({ avatar, name, className = "h-11 w-11 text-xs" }: { avatar?: string; name: string; className?: string }) {
  const initial = name?.trim().charAt(0).toUpperCase() || "E";
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${className} rounded-full object-cover border border-white/10`}
      />
    );
  }
  return (
    <div className={`${className} rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple border border-white/10 flex items-center justify-center font-bold text-white shadow-inner`}>
      {initial}
    </div>
  );
}

export default function FriendsSearchPage() {
  const router = useRouter();
  
  // Local input state vs Executed search query state
  const [inputValue, setInputValue] = useState("");
  const [executedQuery, setExecutedQuery] = useState("");
  
  // Filter state: "all" or "friends"
  const [activeFilter, setActiveFilter] = useState<"all" | "friends">("all");
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

  // Real backend queries — NO MOCK DATA
  const { data: friendsData, isLoading: isSearchLoading, refetch } = useFriends(30, executedQuery);
  const followMutation = useFollowBackMutation();

  // Execute Search action (triggered only on SEARCH button click or Enter key)
  const handleExecuteSearch = () => {
    setExecutedQuery(inputValue.trim());
    refetch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleExecuteSearch();
    }
  };

  const handleClear = () => {
    setInputValue("");
    setExecutedQuery("");
  };

  // Map real backend items into explorer display list
  const explorersList = useMemo(() => {
    if (!friendsData?.pages) return [];

    const items = friendsData.pages.flatMap((page) => page.items || []);

    return items.map((f: any) => ({
      id: f.userId || f.id,
      name: f.displayName || f.username,
      username: `@${f.username}`,
      avatar: f.avatarUrl,
      compatibility: f.compatibility || 95,
      isFriend: true,
      dnaTags: f.interests || ["Explorer", "TravelDNA"],
      sharedExperiences: 2,
      location: f.location || "Global Explorer"
    }));
  }, [friendsData]);

  const handleSendRequest = async (username: string, id: string) => {
    try {
      setSentRequests((prev) => ({ ...prev, [id]: true }));
      await followMutation.mutateAsync(username.replace("@", ""));
    } catch {
      // Revert optimistic update on failure
      setSentRequests((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full md:h-[calc(100vh-64px-2rem)] max-h-full md:max-h-[calc(100vh-64px-1rem)] w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-3 md:py-4 text-white flex flex-col gap-3 md:gap-4 select-none font-sans overflow-hidden">
      
      {/* 1. TOP NAVIGATION & INTERACTIVE SEARCH HEADER BAR (FIXED) */}
      <div className="glass-panel rounded-2xl p-2.5 sm:p-3 border border-white/10 shadow-xl flex flex-col sm:flex-row items-center gap-3 w-full shrink-0">
        
        {/* Back Button + Search Bar */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={() => router.push("/profile/friends")}
            className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/10 hover:border-brand-cyan/40 text-zinc-400 hover:text-white transition-all cursor-pointer shrink-0 flex items-center justify-center"
            title="Back to Friends"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Search Input Field + Cyan SEARCH Button */}
          <div className="flex flex-1 items-center gap-2.5 px-3.5 py-1.5 bg-zinc-900 border border-white/15 rounded-xl focus-within:border-brand-cyan focus-within:ring-1 focus-within:ring-brand-cyan/50 transition-all shadow-inner min-w-0">
            <Search className="h-4 w-4 text-brand-cyan shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type name, @username, or travel DNA tag..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-zinc-500 w-full font-medium"
            />
            {inputValue && (
              <button
                onClick={handleClear}
                className="p-1 rounded-full text-zinc-500 hover:text-white transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Explicit Cyan Search Button */}
          <button
            onClick={handleExecuteSearch}
            className="bg-brand-cyan hover:bg-cyan-400 text-zinc-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-brand-cyan/20 cursor-pointer active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5 text-zinc-950" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* 2. FILTER CHIPS ROW (FIXED - CLEAN OPTIONS ONLY) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 shrink-0">
        {[
          { id: "all", label: "All Explorers", icon: Users },
          { id: "friends", label: "My Friends", icon: ShieldCheck }
        ].map((filter) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-brand-cyan text-zinc-950 border border-brand-cyan/30 shadow-md shadow-brand-cyan/10"
                  : "bg-zinc-950/40 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
              <span>{filter.label}</span>
            </button>
          );
        })}

        <span className="text-[10px] font-mono text-zinc-500 ml-auto hidden sm:inline-block shrink-0">
          {explorersList.length} results
        </span>
      </div>

      {/* 3. SEARCH RESULTS CONTAINER (FIXED BOX, ONLY INNER RESULTS STREAM SCROLLS) */}
      <div className="glass-panel rounded-2xl md:rounded-3xl p-3 sm:p-5 border border-white/5 flex flex-col flex-1 min-h-0 h-full overflow-hidden">
        <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 pb-3 border-b border-white/5 shrink-0 flex items-center justify-between">
          <span>Explorer Search Results</span>
          <span className="text-brand-cyan font-mono">{explorersList.length} Active Nodes</span>
        </div>

        {/* Scrollable Results Stream (ONLY THIS SCROLLS - 2 Column Grid on Desktop) */}
        <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar pt-3 pr-1 pb-3 md:pb-4 overscroll-contain touch-pan-y">
          {isSearchLoading ? (
            <div className="p-12 text-center text-zinc-500 text-xs font-mono animate-pulse">
              Searching Wandercall global network...
            </div>
          ) : explorersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-300">
                {executedQuery ? `No results for "${executedQuery}"` : "Search Explorers & Friends"}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm">
                {executedQuery
                  ? "Try checking spelling or search using another username."
                  : "Type a name or username in the search bar above and click Search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {explorersList.map((explorer) => {
                const isReqSent = sentRequests[explorer.id];

                return (
                  <motion.div
                    key={explorer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-brand-cyan/20 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Avatar & Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <SearchCompanionAvatar
                          avatar={explorer.avatar}
                          name={explorer.name}
                          className="h-10 w-10 text-xs"
                        />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-brand-emerald border-2 border-zinc-950" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-white truncate">
                            {explorer.name}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[90px]">
                            {explorer.username}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-extrabold shrink-0">
                            {explorer.compatibility}% Match
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {explorer.isFriend ? (
                        <button
                          onClick={() => router.push(`/profile/friends/chat:${explorer.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Chat</span>
                        </button>
                      ) : isReqSent ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Sent</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(explorer.username, explorer.id)}
                          className="px-3 py-1.5 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-brand-cyan/10 cursor-pointer active:scale-95"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
