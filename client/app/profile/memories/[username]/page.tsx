"use client";

import React, { useState, useEffect, useRef } from "react";
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
import LocationSearch from "@/components/location/LocationSearch";
import { useAppSelector } from "@/lib/store/store";

interface Comment {
  id: string;
  author: string;
  avatar: string | null;
  text: string;
  time: string;
}

interface Memory {
  id: string;
  title: string;
  text: string;
  tag: string;
  location: string;
  image: string;
  likes: number;
  commentsCount: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
}

// Generate some sample memories
const generateMockMemories = (username: string, page: number): Memory[] => {
  const images = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80", // beach
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80", // mountain
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&auto=format&fit=crop&q=80", // forest
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=80", // roadtrip
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80", // bonfire
    "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80", // waterfall
  ];

  const tags = ["Underwater Adventure", "Mountain Summit", "Wilderness Camping", "Coastal Drive", "Milestone Earned", "Forest Exploration"];
  const locations = ["Netrani Island, Murdeshwar", "Coorg Coffee Estate, KA", "Manali Heights, HP", "Gokarna Coast, India", "Varkala Cliffside, Kerala", "Zanskar Valley, Ladakh"];

  const batchSize = 6;
  const startId = page * batchSize;

  return Array.from({ length: batchSize }).map((_, idx) => {
    const memoryId = `${startId + idx + 1}`;
    const imgUrl = images[(startId + idx) % images.length];
    const tag = tags[(startId + idx) % tags.length];
    const location = locations[(startId + idx) % locations.length];

    return {
      id: memoryId,
      title: `${tag} at ${location.split(",")[0]}`,
      text: `An incredible adventure exploring the scenic beauty and local secrets of ${location}. Every step of this journey brought a new perspective and a reminder of why we explore the real world. Truly an unforgettable memory!`,
      tag: tag.toUpperCase(),
      location: location,
      likes: Math.floor(Math.random() * 120) + 18,
      commentsCount: 3,
      liked: false,
      saved: false,
      image: imgUrl,
      comments: [
        { id: `c-${memoryId}-1`, author: "Elena Rostova", avatar: null, text: "Wow, this looks absolutely beautiful! Wish I was there.", time: "2h ago" },
        { id: `c-${memoryId}-2`, author: "Rajesh Kumar", avatar: null, text: "What camera or lens did you use for this shot?", time: "1d ago" },
        { id: `c-${memoryId}-3`, author: "Alex Mercer", avatar: null, text: "Added this exact route to my watchlist!", time: "2d ago" },
      ]
    };
  });
};

export default function UserMemoriesPage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  // Query user details from the backend to display the correct header
  const { data: dbProfile, isLoading: isProfileLoading } = usePublicProfileQuery(username);
  const authUserId = useAppSelector((state) => state.auth.userId);
  const isOwner = dbProfile?.userId === authUserId;

  const [memories, setMemories] = useState<Memory[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments drawer states
  const [activeCommentMemory, setActiveCommentMemory] = useState<Memory | null>(null);
  const [newCommentText, setNewCommentText] = useState("");



  const loaderRef = useRef<HTMLDivElement>(null);
  const isFetchingMoreRef = useRef(false);

  // Initialize first page
  useEffect(() => {
    if (!username) return;
    setMemories(generateMockMemories(username, 0));
    setPage(0);
    setHasMore(true);
    setIsFetchingMore(false);
    isFetchingMoreRef.current = false;
  }, [username]);

  // Infinite scroll trigger
  useEffect(() => {
    if (!hasMore || isProfileLoading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingMoreRef.current && hasMore) {
        isFetchingMoreRef.current = true;
        setIsFetchingMore(true);
        // Simulate minor API latency for cool skeleton feel
        setTimeout(() => {
          setPage(prev => {
            const nextPage = prev + 1;
            const newMemories = generateMockMemories(username, nextPage);
            if (nextPage >= 4) {
              setHasMore(false);
            }
            setMemories(current => {
              const existingIds = new Set(current.map(m => m.id));
              const uniqueNew = newMemories.filter(m => !existingIds.has(m.id));
              return [...current, ...uniqueNew];
            });
            setIsFetchingMore(false);
            isFetchingMoreRef.current = false;
            return nextPage;
          });
        }, 150);
      }
    }, { threshold: 0.1 });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, username, isProfileLoading]);

  // Actions
  const handleLike = (id: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          liked: !m.liked,
          likes: m.liked ? m.likes - 1 : m.likes + 1
        };
      }
      return m;
    }));
  };

  const handleSave = (id: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, saved: !m.saved };
      }
      return m;
    }));
    triggerToast("Memory saved to your explorer bookmark index.");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    triggerToast("Link copied to clipboard!");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentMemory) return;

    const commentObj: Comment = {
      id: `c-new-${Date.now()}`,
      author: "You (Explorer)",
      avatar: null,
      text: newCommentText,
      time: "Just now"
    };

    setMemories(prev => prev.map(m => {
      if (m.id === activeCommentMemory.id) {
        const updatedComments = [commentObj, ...m.comments];
        const updatedMemory = {
          ...m,
          comments: updatedComments,
          commentsCount: updatedComments.length
        };
        // Also update local open drawer state
        setActiveCommentMemory(updatedMemory);
        return updatedMemory;
      }
      return m;
    }));

    setNewCommentText("");
  };

  if (isProfileLoading || !username) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-50">
        <Loader2 className="h-10 w-10 text-brand-cyan animate-spin" />
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
          Retrieving Memories index...
        </p>
      </div>
    );
  }

  // Fallback initial
  const userInitials = dbProfile?.displayName 
    ? dbProfile.displayName.trim().charAt(0).toUpperCase() 
    : "E";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center py-6 px-4 md:px-8 relative overflow-x-hidden selection:bg-brand-cyan/30 selection:text-white">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 bg-zinc-900 border border-brand-cyan/30 px-5 py-3 rounded-2xl text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] z-50 flex items-center gap-2.5"
          >
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="hidden sm:flex items-center gap-4 text-left">
            <div className="flex flex-col text-left">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-cyan" />
                Explorer Memories
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">Index of adventures and journals</p>
            </div>
          </div>

          {/* Right capsule and action items */}
          <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto">
            {/* User profile capsule card */}
            {dbProfile && (
              <div className="flex items-center gap-3 bg-white/[0.01] border border-white/12 px-3 py-1.5 rounded-xl">
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

            {/* Post Memory Button */}
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

        {/* Memories responsive grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {memories.map((memory) => (
            <motion.article 
              key={memory.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/[0.01] border border-white/12 rounded-3xl overflow-hidden hover:border-white/20 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col h-full group/card"
            >
              {/* Card Image Area */}
              <div className="w-full h-48 overflow-hidden relative select-none">
                <img 
                  src={memory.image} 
                  alt={memory.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105" 
                  loading="lazy"
                />
                {/* Visual grid pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                <span className="absolute top-4 left-4 text-[9px] font-black text-zinc-950 bg-brand-cyan border border-brand-cyan/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {memory.tag}
                </span>
                
                <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-zinc-300 text-[10px] font-mono font-bold bg-zinc-950/70 border border-white/5 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <MapPin className="h-3 w-3 text-brand-purple" />
                  {memory.location}
                </div>
              </div>

              {/* Card Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                <div className="text-left">
                  <h3 className="text-sm font-black text-white group-hover/card:text-brand-cyan transition-colors leading-tight">
                    {memory.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2.5">
                    {memory.text}
                  </p>
                </div>

                {/* Social interactions section */}
                <div className="border-t border-white/5 pt-3.5 flex items-center justify-between text-zinc-400 text-xs font-mono">
                  
                  {/* Actions buttons container */}
                  <div className="flex items-center gap-4 w-full">
                    {/* Like button */}
                    <button 
                      onClick={() => handleLike(memory.id)}
                      className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer select-none group/btn ${memory.liked ? "text-rose-500 font-black" : ""}`}
                      aria-label="Like memory"
                    >
                      <Heart className={`h-4 w-4 transition-transform group-hover/btn:scale-110 ${memory.liked ? "fill-rose-500" : ""}`} />
                      <span>{memory.likes}</span>
                    </button>

                    {/* Comment trigger */}
                    <button 
                      onClick={() => setActiveCommentMemory(memory)}
                      className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors cursor-pointer select-none group/btn"
                      aria-label="View comments"
                    >
                      <MessageSquare className="h-4 w-4 group-hover/btn:scale-110" />
                      <span>{memory.commentsCount}</span>
                    </button>

                    {/* Save button */}
                    <button 
                      onClick={() => handleSave(memory.id)}
                      className={`flex items-center gap-1.5 hover:text-brand-purple transition-colors cursor-pointer select-none group/btn ml-auto ${memory.saved ? "text-brand-purple font-black" : ""}`}
                      aria-label="Save memory"
                    >
                      <Bookmark className={`h-4 w-4 group-hover/btn:scale-110 ${memory.saved ? "fill-brand-purple" : ""}`} />
                    </button>

                    {/* Share button */}
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
          ))}
        </main>

        {/* Loader trigger for smart infinite scroll */}
        {hasMore && (
          <div 
            ref={loaderRef}
            className="w-full flex justify-center py-10"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 text-brand-cyan animate-spin" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                Decrypting further coordinates...
              </span>
            </div>
          </div>
        )}

        {!hasMore && memories.length > 0 && (
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
            
            {/* Close touch area */}
            <div 
              className="absolute inset-0 cursor-default" 
              onClick={() => setActiveCommentMemory(null)}
            />

            {/* Sliding Panel */}
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
                {activeCommentMemory.comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <MessageSquare className="h-8 w-8 opacity-20" />
                    <p className="text-xs font-mono uppercase tracking-wider">No comments yet</p>
                  </div>
                ) : (
                  activeCommentMemory.comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="flex gap-3 items-start text-xs text-left bg-white/[0.01] p-3.5 rounded-2xl border border-white/5"
                    >
                      <div className="h-7 w-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-[10px] shrink-0 text-zinc-300 select-none">
                        {comment.author.trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-zinc-200">{comment.author}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{comment.time}</span>
                        </div>
                        <p className="text-zinc-400 font-semibold leading-relaxed mt-0.5">
                          {comment.text}
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
                  className="flex-1 h-10 px-4 rounded-xl bg-zinc-900 border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan/40 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
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
