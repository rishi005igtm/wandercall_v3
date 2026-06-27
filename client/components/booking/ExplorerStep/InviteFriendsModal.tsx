"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Copy, Share2, Check, Send, Search, X, Sparkles, ShieldCheck } from "lucide-react";

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");
  const [invitedList, setInvitedList] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const tripUrl = "https://wandercall.com/join-trip?ref=EXP-WND2026";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tripUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWeb = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Wandercall Expedition!",
          text: "Hey! Fill in your traveler details to join our adventure cohort:",
          url: tripUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendSearch.trim()) return;
    setInvitedList((prev) => [...prev, friendSearch.trim()]);
    setFriendSearch("");
  };

  const suggestedFriends = [
    { name: "Aarav Sharma", handle: "@aarav_adventure", avatar: "AS" },
    { name: "Neha Gupta", handle: "@neha_skies", avatar: "NG" },
    { name: "Priya Patel", handle: "@priya_hikes", avatar: "PP" },
  ];

  const toggleSuggestedInvite = (handle: string) => {
    setInvitedList((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 select-none">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Solid Modal Window centered on device width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-[10000] w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-left"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 shadow-lg shadow-brand-cyan/10">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Invite Co-Explorers</h3>
                <span className="text-[10px] font-mono text-zinc-400 block">Share trip link to let friends join your cohort</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center border border-white/5 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Instant Share & Copy Link Section */}
          <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Direct Trip Link</span>
            <div className="flex gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  readOnly
                  value={tripUrl}
                  className="w-full h-10 bg-zinc-900 border border-white/10 rounded-xl pl-3 pr-8 text-xs font-mono text-zinc-300 outline-none select-all"
                />
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-brand-cyan" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWeb}
                className="h-10 px-4 rounded-xl bg-brand-cyan/20 hover:bg-brand-cyan/30 border border-brand-cyan/30 text-brand-cyan text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-brand-cyan/10"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Send Direct Email / Username Invite Form */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-purple animate-pulse" /> Send Direct App Invite
            </span>
            <form onSubmit={handleSendInvite} className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Enter friend's email or @username..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="w-full h-11 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-28 text-xs text-white placeholder-zinc-500 outline-none focus:border-brand-cyan transition-all"
              />
              <button
                type="submit"
                disabled={!friendSearch.trim()}
                className="absolute right-1.5 h-8 px-3 rounded-lg bg-brand-cyan hover:bg-brand-cyan/85 text-zinc-950 text-[10px] font-black uppercase transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-md shadow-brand-cyan/20"
              >
                <Send className="h-3 w-3" />
                <span>Invite</span>
              </button>
            </form>
          </div>

          {/* Quick Add Wandercall Connections */}
          <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Recent Explorer Connections</span>
            <div className="flex flex-col gap-2">
              {suggestedFriends.map((friend) => {
                const isInvited = invitedList.includes(friend.handle);

                return (
                  <div
                    key={friend.handle}
                    className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {friend.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white leading-none">{friend.name}</h4>
                        <span className="text-[9px] font-mono text-zinc-500 block mt-0.5">{friend.handle}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSuggestedInvite(friend.handle)}
                      className={`h-7 px-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 border ${
                        isInvited
                          ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Invited</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 text-brand-cyan" />
                          <span>+ Invite</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Trust Note */}
          <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 border-t border-white/5 pt-3">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Invited co-explorers can independently enter their traveler info & join your booking cohort.</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
