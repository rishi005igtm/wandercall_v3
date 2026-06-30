"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Share2, 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Send,
  X,
  Compass,
  Plus
} from "lucide-react";
import { usePublicProfileQuery } from "@/hooks/api/useUserQueries";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/lib/store/store";
import { 
  useUserFeedQuery, 
  useLikePostMutation, 
  useSavePostMutation, 
  useCommentsQuery, 
  useCommentMutation 
} from "@/hooks/api/useFeed";

export default function UserMemoriesPage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  // Query user details from the backend to display the correct header
  const { data: dbProfile, isLoading: isProfileLoading } = usePublicProfileQuery(username);
  const authUserId = useAppSelector((state) => state.auth.userId);
  const isOwner = dbProfile?.userId === authUserId;

  // Fetch memories from backend
  const { data: feedData, isLoading: isFeedLoading } = useUserFeedQuery(username, "memory", Boolean(username));
  const memories = useMemo(() => {
    if (!feedData?.items) return [];
    return feedData.items;
  }, [feedData]);

  // Mutations
  const likeMutation = useLikePostMutation();
  const saveMutation = useSavePostMutation();
  const addCommentMutation = useCommentMutation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments drawer states
  const [activeCommentMemory, setActiveCommentMemory] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // TanStack comments query for active post
  const { data: commentsResponse, isLoading: isCommentsLoading } = useCommentsQuery(
    activeCommentMemory?.id || "",
    Boolean(activeCommentMemory)
  );

  const activeComments = useMemo(() => {
    return commentsResponse?.comments || [];
  }, [commentsResponse]);

  // Actions
  const handleLike = (id: string, liked: boolean) => {
    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    likeMutation.mutate({ postId: id, alreadyLiked: liked });
  };

  const handleSave = (id: string, saved: boolean) => {
    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    saveMutation.mutate({ postId: id, alreadySaved: saved }, {
      onSuccess: () => {
        triggerToast(!saved ? "Memory saved to your explorer bookmarks." : "Memory removed from bookmarks.");
      }
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Link copied to clipboard!");
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentMemory) return;

    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    addCommentMutation.mutate(
      { postId: activeCommentMemory.id, content: newCommentText },
      {
        onSuccess: () => {
          setNewCommentText("");
        },
        onError: () => {
          triggerToast("Failed to post comment.");
        }
      }
    );
  };

  if (isProfileLoading || isFeedLoading || !username) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-50">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
          Retrieving Memories index...
        </p>
      </div>
    );
  }

  const userInitials = dbProfile?.displayName 
    ? dbProfile.displayName.trim().charAt(0).toUpperCase() 
    : "E";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-6 px-4 md:px-8 relative overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
      
      {/* Back to Profile top-left button */}
      <button 
        onClick={() => router.push(`/profile/${username}`)}
        className="absolute top-6 left-4 md:left-8 h-9 w-9 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
        aria-label="Go back to profile"
      >
        <ArrowLeft className="h-4.5 w-4.5" />
      </button>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 bg-zinc-900 border border-brand-cyan/30 px-5 py-3 rounded-2xl text-xs font-mono font-bold text-brand-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)] z-50 flex items-center gap-2.5"
          >
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full flex flex-col gap-8 mt-12 sm:mt-0">
        
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="hidden sm:flex items-center gap-4 text-left">
            <div className="flex flex-col text-left">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-cyan animate-pulse" />
                Explorer Memories
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Index of adventures and journals</p>
            </div>
          </div>

          {/* Right capsule and action items */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto">
            {dbProfile && (
              <div 
                onClick={() => router.push(`/profile/${username}`)}
                className="flex items-center gap-3 bg-white/[0.01] border border-white/12 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shadow-md shrink-0">
                  <div className="h-full w-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center font-bold text-[10px]">
                    {dbProfile.avatarUrl ? (
                      <img src={dbProfile.avatarUrl} alt={dbProfile.displayName} className="h-full w-full object-cover" />
                    ) : (
                      userInitials
                    )}
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-zinc-200 leading-none">{dbProfile.displayName}</span>
                  <span className="text-[8px] font-mono text-zinc-500 mt-0.5">@{dbProfile.username}</span>
                </div>
              </div>
            )}

            {isOwner && (
              <button
                onClick={() => router.push("/feed/create-post")}
                className="h-9 px-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 hover:bg-brand-cyan/25 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Post Memory</span>
              </button>
            )}
          </div>
        </header>

        {/* Empty State */}
        {memories.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
            <Compass className="h-10 w-10 text-zinc-600 animate-pulse" />
            <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No Memories Logged</p>
            <p className="text-xs text-zinc-600 max-w-xs">There are no memory coordinates published under this profile.</p>
          </div>
        )}

        {/* Memories responsive grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {memories.map((memory) => {
            const memoryImage = memory.images && memory.images.length > 0
              ? memory.images[0]
              : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80";

            return (
              <motion.article 
                key={memory.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white/[0.01] border border-white/12 rounded-3xl overflow-hidden hover:border-white/20 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col h-full group/card"
              >
                {/* Card Image Area */}
                <div className="w-full h-48 overflow-hidden relative select-none bg-zinc-900">
                  <img 
                    src={memoryImage} 
                    alt={memory.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                  <span className="absolute top-4 left-4 text-[9px] font-black text-zinc-950 bg-brand-cyan border border-brand-cyan/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    {memory.category.toUpperCase()}
                  </span>
                  
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-zinc-300 text-[10px] font-mono font-bold bg-zinc-950/70 border border-white/5 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <MapPin className="h-3 w-3 text-brand-purple" />
                    {memory.locationName || "On the Trail"}
                  </div>
                </div>

                {/* Card Contents */}
                <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white group-hover/card:text-brand-cyan transition-colors leading-tight">
                      {memory.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2.5 line-clamp-4">
                      {memory.content}
                    </p>
                  </div>

                  {/* Social interactions section */}
                  <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-zinc-400 text-xs font-mono">
                    <div className="flex items-center gap-4 w-full">
                      <button 
                        onClick={() => handleLike(memory.id, !!memory.hasLiked)}
                        className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer select-none group/btn ${memory.hasLiked ? "text-rose-500 font-black" : ""}`}
                        aria-label="Like memory"
                      >
                        <Heart className={`h-4 w-4 transition-transform group-hover/btn:scale-110 ${memory.hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{memory.likeCount || 0}</span>
                      </button>

                      <button 
                        onClick={() => setActiveCommentMemory(memory)}
                        className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer select-none group/btn"
                        aria-label="View comments"
                      >
                        <MessageSquare className="h-4 w-4 group-hover/btn:scale-110" />
                        <span>{memory.commentCount || 0}</span>
                      </button>

                      <button 
                        onClick={() => handleSave(memory.id, !!memory.hasSaved)}
                        className={`flex items-center gap-1.5 hover:text-brand-purple transition-colors cursor-pointer select-none group/btn ml-auto ${memory.hasSaved ? "text-brand-purple font-black" : ""}`}
                        aria-label="Save memory"
                      >
                        <Bookmark className={`h-4 w-4 group-hover/btn:scale-110 ${memory.hasSaved ? "fill-brand-purple text-brand-purple" : ""}`} />
                      </button>

                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-1.5 hover:text-brand-cyan transition-colors cursor-pointer select-none group/btn"
                        aria-label="Share memory link"
                      >
                        <Share2 className="h-4 w-4 group-hover/btn:scale-110" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </main>

        {memories.length > 0 && (
          <footer className="text-center py-12 border-t border-white/5 mt-6">
            <p className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
              --- Bottom of index. all coordinates synchronized ---
            </p>
          </footer>
        )}
      </div>

      {/* COMMENTS SIDE-DRAWER MODAL */}
      <AnimatePresence>
        {activeCommentMemory && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end">
            
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => setActiveCommentMemory(null)}
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-zinc-900 border-l border-white/5 flex flex-col justify-between shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Comments Thread</h3>
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[220px]">
                    On "{activeCommentMemory.title}"
                  </span>
                </div>
                <button
                  onClick={() => setActiveCommentMemory(null)}
                  className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close comments panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Comments list container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {isCommentsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 text-brand-cyan animate-spin" />
                  </div>
                ) : activeComments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <MessageSquare className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-mono uppercase tracking-wider">No comments yet</p>
                  </div>
                ) : (
                  activeComments.map((comment: any) => (
                    <div 
                      key={comment.id}
                      className="flex gap-3 items-start text-xs text-left bg-white/[0.01] p-3.5 rounded-2xl border border-white/5"
                    >
                      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 text-zinc-300 select-none">
                        {comment.user.displayName.trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-zinc-200">{comment.user.displayName}</span>
                          <span className="text-[9px] font-mono text-zinc-500">
                            {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-zinc-400 font-semibold leading-relaxed mt-0.5">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment input form */}
              <form 
                onSubmit={handleAddComment}
                className="p-4 bg-zinc-950 border-t border-white/5 flex gap-2 items-center"
              >
                <input 
                  type="text"
                  placeholder="Decrypt a thought..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 h-10 px-4 rounded-xl bg-zinc-900 border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan/40 transition-colors font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || addCommentMutation.isPending}
                  className="h-10 w-10 rounded-xl bg-brand-cyan hover:bg-cyan-500 text-zinc-950 flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  aria-label="Send comment"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
