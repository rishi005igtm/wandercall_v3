"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/store";
import {
  Compass, MapPin, Flame, Award, MessageSquare, Heart, Share2,
  Bookmark, Camera, Plus, Sparkles, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Map, Lightbulb,
  Package, Home, DollarSign, Calendar, X, Zap, Volume2, Loader2, Send, Check, Clock, Search, Radio, User
} from "lucide-react";

import {
  useFeedInfiniteQuery,
  useCommentsQuery,
  useCommentMutation,
  useLikePostMutation,
  useSavePostMutation,
  useTrackViewMutation
} from "@/hooks/api/useFeed";
import { FeedPost, FeedQueryFilters } from "@/lib/services/feed.service";

// ==========================================
// HELPERS & CONFIGURATIONS
// ==========================================

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return '1d';
  return `${diffDays}d`;
}

// Categories Configuration
const CATEGORIES = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "adventure", label: "Adventure", icon: Map },
  { id: "gear", label: "Gear", icon: Package },
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "tips", label: "Tips", icon: Lightbulb },
  { id: "nearby", label: "Nearby", icon: MapPin },
];

// ==========================================
// COMPONENTS
// ==========================================

// Immersive Media Viewer
const ImmersiveMediaViewer = ({ images, onImageClick }: { images: string[], onImageClick?: (idx: number) => void }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    if (!images || !images[activeIdx]) return;
    const img = new Image();
    img.onload = () => {
      // If height > width, it's portrait (e.g. 9:16). Otherwise landscape (e.g. 16:9).
      setIsPortrait(img.naturalHeight > img.naturalWidth);
    };
    img.src = images[activeIdx];
  }, [activeIdx, images]);

  if (!images || images.length === 0) return null;

  // Determine dynamic object-fit classes based on orientation and device
  // isPortrait: Mobile -> cover, Desktop -> contain
  // !isPortrait: Mobile -> contain, Desktop -> cover
  const objectFitClass = isPortrait === null 
    ? "object-cover" // Default while loading
    : isPortrait 
      ? "object-cover md:object-contain" 
      : "object-contain md:object-cover";

  return (
    <div className="relative w-full h-[100dvh] md:h-[75vh] md:rounded-[32px] rounded-none overflow-hidden bg-black md:border md:border-white/10 border-none group shadow-2xl flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Blurred Background to fill empty space seamlessly */}
          <img
            src={images[activeIdx]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
          />
          {/* Foreground properly contained/covered based on orientation */}
          <motion.img
            src={images[activeIdx]}
            alt=""
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 w-full h-full z-10 transition-all duration-300 ${objectFitClass}`}
            onClick={() => onImageClick && onImageClick(activeIdx)}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Dark gradient overlay for text readability at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent pointer-events-none z-10" />

      {images.length > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveIdx(idx); }}
              className={`w-1.5 transition-all duration-300 rounded-full ${activeIdx === idx ? "h-6 bg-white" : "h-1.5 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN PAGE
// ==========================================

export default function ImmersiveFeedPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // States
  const [activeFilter, setActiveFilter] = useState("trending");
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showMobileComments, setShowMobileComments] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [storyModalContent, setStoryModalContent] = useState<{title: string, content: string} | null>(null);
  
  // Refs for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Set<HTMLDivElement>>(new Set());
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('published') === 'true') {
      // Small delay to ensure the DOM and feed list are fully hydrated/rendered
      setTimeout(() => {
        if (leftPanelRef.current) {
          leftPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 300);
    }
  }, [searchParams]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const scrollUp = () => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (leftPanelRef.current) {
      leftPanelRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // Queries & Mutations
  const currentFilters = useMemo((): FeedQueryFilters => {
    let feedType: any = 'trending';
    let category: string | undefined;

    if (activeFilter === 'saved') feedType = 'saved';
    else if (activeFilter === 'nearby') { feedType = 'category'; category = 'nearby'; }
    else if (activeFilter !== 'trending') { feedType = 'category'; category = activeFilter; }

    return { feedType, category, limit: 10, feedSessionId: "immersive-session-1" };
  }, [activeFilter]);

  const { data: infiniteData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeedInfiniteQuery(currentFilters);
  const likeMutation = useLikePostMutation();
  const saveMutation = useSavePostMutation();
  const addCommentMutation = useCommentMutation();

  const feedPosts = useMemo(() => {
    if (!infiniteData) return [];
    return infiniteData.pages.flatMap(page => page.items).map(post => ({
      id: post.id,
      title: post.title || post.content?.substring(0, 50) || "Experience",
      content: post.content,
      category: post.category,
      location: post.locationName || "Global Coordinates",
      images: post.images || [],
      likes: post.likeCount || 0,
      commentsCount: post.commentCount || 0,
      hasLiked: post.hasLiked || false,
      hasSaved: post.hasSaved || false,
      timestamp: formatRelativeTime(post.publishedAt || post.createdAt),
      user: {
        name: post.author?.displayName || 'Explorer',
        username: `@${post.author?.username || 'user'}`,
        avatarUrl: post.author?.avatarUrl,
        level: post.author?.level || 1,
        verified: post.author?.type === 'OFFICIAL' || (post.author?.level ?? 0) > 10,
      }
    }));
  }, [infiniteData]);

  // Set initial active post
  useEffect(() => {
    if (feedPosts.length > 0 && !activePostId) {
      setActivePostId(feedPosts[0].id);
    }
  }, [feedPosts, activePostId]);

  // Intersection Observer for Scroll Snapping State Sync
  useEffect(() => {
    if (!leftPanelRef.current) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const postId = entry.target.getAttribute('data-post-id');
          if (postId) {
            setActivePostId(prevId => prevId !== postId ? postId : prevId);
          }
        }
      });
    }, { 
      root: leftPanelRef.current,
      threshold: 0.5 
    });
    
    observerRef.current = observer;
    elementsRef.current.forEach(node => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  // Observe post elements
  const observePost = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      elementsRef.current.add(node);
      if (observerRef.current) {
        observerRef.current.observe(node);
      }
    }
  }, []);

  const activePost = useMemo(() => feedPosts.find(p => p.id === activePostId), [feedPosts, activePostId]);

  // Unified Query for Right Panel Data
  const { data: commentsData, isLoading: isContextLoading } = useCommentsQuery(
    activePostId || "", 
    Boolean(activePostId)
  );
  const postComments = commentsData?.comments || [];
  const [commentInput, setCommentInput] = useState("");

  const handleLike = (postId: string) => {
    if (!isAuthenticated) return triggerToast("Log in to like posts");
    likeMutation.mutate({ postId, alreadyLiked: false });
  };

  const handleSave = (postId: string) => {
    if (!isAuthenticated) return triggerToast("Log in to save posts");
    saveMutation.mutate({ postId, alreadySaved: false });
    triggerToast("Saved to collection");
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !activePostId) return;
    if (!isAuthenticated) return triggerToast("Log in to comment");
    addCommentMutation.mutate({ postId: activePostId, content: commentInput }, {
      onSuccess: () => setCommentInput("")
    });
  };

  // Predictive Infinite Scroll Trigger
  const predictiveObserver = useRef<IntersectionObserver | null>(null);
  const predictivePrefetchRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    
    if (predictiveObserver.current) {
      predictiveObserver.current.disconnect();
    }

    if (node) {
      predictiveObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      predictiveObserver.current.observe(node);
    }
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Handle locking body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const activeEl = document.activeElement;
      if (activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (leftPanelRef.current) {
          leftPanelRef.current.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (leftPanelRef.current) {
          leftPanelRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-white font-sans overflow-hidden flex flex-col md:flex-row z-50">
      
      {/* ======================================= */}
      {/* LEFT PANEL: FIXED HEADER + FEED VIEWPORT*/}
      {/* ======================================= */}
      <div className="w-full md:w-[60%] lg:w-[65%] h-full flex flex-col relative">
        
        {/* Fixed Top Controls Area */}
        <div className="absolute md:relative top-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-4 z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none md:pointer-events-auto">
          <div className="flex justify-between items-center w-full pointer-events-auto">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div className="h-10 w-10 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl flex items-center justify-center backdrop-blur-md transition-all group-hover:scale-105">
                <Compass className="h-5 w-5 text-brand-cyan" />
              </div>
              <span className="text-lg font-black tracking-widest text-white hidden sm:block drop-shadow-md">WANDERCALL</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/feed/create-post" className="h-10 px-4 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-200 transition-transform hover:scale-105 shadow-xl shadow-white/10">
                <Plus className="h-4 w-4" /> Create
              </Link>
            </div>
          </div>

          {/* Fixed Filter Capsule */}
          <div className="flex w-full pointer-events-auto md:justify-center">
            <div className="flex items-center p-1.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10 shadow-lg w-full md:w-auto max-w-full">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full px-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      activeFilter === cat.id 
                        ? "bg-white text-black" 
                        : "text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <cat.icon className="h-3 w-3" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Left Navigation Sidebar */}
        <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50 p-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
          {[
            { id: "home", icon: Home, tooltip: "Home", href: "/" },
            { id: "experiences", icon: Compass, tooltip: "Experiences", href: "/feed" },
            { id: "chat", icon: MessageSquare, tooltip: "Chat", href: "/profile/friends" },
            { id: "profile", icon: User, tooltip: "Profile", href: "/profile" },
          ].map(nav => {
            return (
              <motion.div key={nav.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link 
                  href={nav.href}
                  className="relative h-12 w-12 rounded-full flex items-center justify-center transition-all group bg-transparent text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <nav.icon className="h-5 w-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                    {nav.tooltip}
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
          <motion.button 
            onClick={scrollUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] group"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronUp className="h-6 w-6" />
            </motion.div>
          </motion.button>

          <motion.button 
            onClick={scrollDown}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] group"
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.button>
        </div>

        {/* Scrollable Viewport */}
        <div 
          ref={leftPanelRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar relative overscroll-y-none"
        >
          {/* Filler spacer on mobile to prevent cards from hiding behind the absolute-positioned transparent header. 
              On desktop, we can rely on normal flex layout. But to keep edge-to-edge media on mobile, 
              the viewport actually needs to extend to the top of the screen. 
              So the wrapper should stretch fully, and the first card snaps to the top! */}
          {isLoading && feedPosts.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="h-12 w-12 rounded-full border-2 border-brand-cyan border-t-transparent animate-spin" />
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Tuning Frequencies...</p>
              </div>
            </div>
          ) : (
            <>
              {feedPosts.map((post, index) => {
                const isPredictiveTrigger = feedPosts.length >= 5 && index === feedPosts.length - 3;
                return (
                  <div 
                    key={post.id}
                    data-post-id={post.id}
                    ref={(node) => {
                      observePost(node);
                      if (isPredictiveTrigger) predictivePrefetchRef(node);
                    }}
                    className="w-full h-[100dvh] md:h-full snap-start snap-always flex flex-col justify-end md:justify-center p-0 md:p-8 lg:p-12 relative"
                  >
                  {/* Desktop: Centered Premium Card */}
                  {/* Mobile: Full Screen Edge-to-Edge Immersion */}
                  <div className="w-full h-full md:h-auto max-w-2xl mx-auto flex flex-col justify-end md:justify-start relative group">
                    
                    <div className="absolute inset-0 md:relative md:inset-auto w-full h-full md:h-auto z-0 md:z-10">
                      <ImmersiveMediaViewer images={post.images.length ? post.images : ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"]} />
                    </div>

                    {/* Overlaid Information */}
                    <div className="relative z-20 p-4 md:p-6 md:absolute md:bottom-0 md:left-0 md:right-0 pb-24 md:pb-6 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-white/20 overflow-hidden bg-black/50 backdrop-blur-sm">
                          {post.user.avatarUrl ? (
                            <img src={post.user.avatarUrl} alt={post.user.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gradient-to-tr from-brand-indigo to-brand-purple">{post.user.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-black text-white">{post.user.name}</span>
                              {post.user.verified && <Check className="h-3.5 w-3.5 text-brand-cyan bg-brand-cyan/20 rounded-full p-0.5" />}
                            </div>
                            <button className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider transition-colors">
                              Follow
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-300 font-semibold">{post.timestamp} • {post.location}</span>
                        </div>
                      </div>

                      <div className="pr-16 md:pr-0">
                        <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-lg leading-tight mb-2">{post.title}</h2>
                        <div className="relative">
                          <p className="text-xs md:text-sm text-zinc-200 drop-shadow-md font-medium leading-relaxed max-w-xl">
                            {post.content && post.content.length > 60 
                              ? post.content.substring(0, 60) + "..." 
                              : post.content}
                            {post.content && post.content.length > 60 && (
                              <button 
                                onClick={() => setStoryModalContent({ title: post.title, content: post.content || "" })}
                                className="text-[10px] md:text-xs font-bold text-brand-cyan uppercase tracking-wider ml-2 hover:text-white transition-colors drop-shadow-md"
                              >
                                More
                              </button>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Data Chips */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-brand-cyan tracking-wider flex items-center gap-1.5 shadow-lg">
                          <MapPin className="h-3 w-3" /> 2.4k km
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-brand-purple tracking-wider flex items-center gap-1.5 shadow-lg">
                          <Flame className="h-3 w-3" /> Hard
                        </span>
                      </div>

                      {/* Mobile Only Quick Actions */}
                      <div className="absolute right-4 bottom-28 md:hidden flex flex-col gap-4 items-center z-30">
                        <button onClick={() => handleLike(post.id)} className="group flex flex-col items-center gap-1">
                          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors">
                            <Heart className={`h-6 w-6 ${post.hasLiked ? "fill-brand-cyan text-brand-cyan" : "text-white"}`} />
                          </div>
                          <span className="text-[10px] font-bold drop-shadow-md">{post.likes}</span>
                        </button>
                        
                        <button onClick={() => setShowMobileComments(true)} className="group flex flex-col items-center gap-1">
                          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors">
                            <MessageSquare className="h-6 w-6 text-white" />
                          </div>
                          <span className="text-[10px] font-bold drop-shadow-md">{post.commentsCount}</span>
                        </button>

                        <button onClick={() => handleSave(post.id)} className="group flex flex-col items-center gap-1">
                          <div className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors">
                            <Bookmark className={`h-6 w-6 ${post.hasSaved ? "fill-white text-white" : "text-white"}`} />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
              

            </>
          )}
        </div>
      </div>

      {/* ======================================= */}
      {/* RIGHT PANEL: CONTEXT HUB (DESKTOP)      */}
      {/* ======================================= */}
      <div className="hidden md:flex md:w-[40%] lg:w-[35%] h-full bg-[#0a0a0c] border-l border-white/5 flex-col relative z-50 shadow-2xl">
          {!activePost || isContextLoading ? (
            <ExperienceContextSkeleton />
          ) : (
            <div 
              key={activePost.id}
              className="flex flex-col h-full w-full animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {/* Context Header */}
              <div className="p-6 border-b border-white/5 bg-[#0a0a0c] z-10 shrink-0">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-cyan" /> Experience Context
                </h3>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => handleLike(activePost.id)} className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activePost.hasLiked ? "text-brand-cyan" : "text-zinc-500 hover:text-white"}`}>
                    <Heart className={`h-4 w-4 ${activePost.hasLiked ? "fill-brand-cyan" : ""}`} /> {activePost.likes} Likes
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                  <button onClick={() => handleSave(activePost.id)} className={`ml-auto flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activePost.hasSaved ? "text-white" : "text-zinc-500 hover:text-white"}`}>
                    <Bookmark className={`h-4 w-4 ${activePost.hasSaved ? "fill-white" : ""}`} /> Save
                  </button>
                </div>
              </div>

              {/* Scrollable Context (Story + Comments) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* Story Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">The Journey</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                    {activePost.content}
                  </p>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1 overflow-hidden">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1 shrink-0"><MapPin className="h-3 w-3" /> Location</span>
                    <div className="overflow-x-auto no-scrollbar w-full">
                      <span className="text-xs font-black text-white whitespace-nowrap">{activePost.location}</span>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Duration</span>
                    <span className="text-xs font-black text-white">4 Days, 3 Nights</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Discussion ({activePost.commentsCount})
                  </h4>
                  
                  {postComments.length > 0 ? (
                    <div className="space-y-3">
                      {postComments.map((comm: any) => (
                        <div key={comm.id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold">
                            {comm.user.avatarUrl ? <img src={comm.user.avatarUrl} className="w-full h-full object-cover" /> : comm.user.displayName.charAt(0)}
                          </div>
                          <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-none p-3 w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-white">{comm.user.displayName}</span>
                              <span className="text-[9px] font-mono text-zinc-500">{formatRelativeTime(comm.createdAt)}</span>
                            </div>
                            <p className="text-xs text-zinc-300 font-medium leading-relaxed">{comm.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                      <MessageSquare className="h-8 w-8 text-zinc-700" />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">No conversation yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment Input */}
              <div className="p-4 border-t border-white/5 bg-[#0a0a0c] z-10 shrink-0">
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-1.5">
                  <input
                    type="text"
                    placeholder="Add to the conversation..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white px-3 font-medium placeholder-zinc-500"
                  />
                  <button 
                    onClick={handleAddComment}
                    className="h-8 w-8 rounded-xl bg-white hover:bg-zinc-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer text-black"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

      </div>

      {/* ======================================= */}
      {/* MOBILE BOTTOM SHEET COMMENTS            */}
      {/* ======================================= */}
      <AnimatePresence>
        {showMobileComments && activePost && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileComments(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[95] md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 h-[75vh] bg-[#0a0a0c] rounded-t-3xl border-t border-white/10 z-[100] md:hidden flex flex-col shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setShowMobileComments(false)}>
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>
              
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Discussion ({activePost.commentsCount})</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {postComments.map((comm: any) => (
                  <div key={comm.id} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold">
                      {comm.user.avatarUrl ? <img src={comm.user.avatarUrl} className="w-full h-full object-cover" /> : comm.user.displayName.charAt(0)}
                    </div>
                    <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-none p-3 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-white">{comm.user.displayName}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{formatRelativeTime(comm.createdAt)}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">{comm.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/5 bg-[#0a0a0c]">
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-1.5">
                  <input
                    type="text"
                    placeholder="Add to the conversation..."
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white px-3 font-medium placeholder-zinc-500"
                  />
                  <button onClick={handleAddComment} className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0 text-black">
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Global Mobile Floating Bottom Action Row */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-[90] bg-white backdrop-blur-xl border border-black/5 shadow-2xl rounded-2xl h-14 p-1 px-2 flex items-center justify-between overflow-hidden">
        <Link href="/" className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1 text-zinc-800 hover:text-black">
          <Home className="h-4 w-4 z-10" />
          <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10">Home</span>
        </Link>

        <Link href="/profile/friends/search" className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1 text-zinc-800 hover:text-black">
          <Search className="h-4 w-4 z-10" />
          <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10">Search</span>
        </Link>

        <div className="flex-1 flex justify-center relative z-50">
          <Link href="/experiences" className="h-11 w-11 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-all duration-300">
            <Compass className="h-5 w-5 text-white" />
          </Link>
        </div>

        <Link href="/feed" className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1 text-white">
          <div className="absolute inset-0 bg-black border border-black rounded-xl z-0" />
          <Radio className="h-4 w-4 z-10" />
          <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10">Feed</span>
        </Link>

        <Link
          href={isAuthenticated ? "/profile/friends" : "/login"}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer group flex-1 text-zinc-800 hover:text-black"
        >
          <MessageSquare className="h-4 w-4 z-10" />
          <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10">Chat</span>
        </Link>
      </div>
      <AnimatePresence>
        {storyModalContent && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setStoryModalContent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a0a0c] border border-white/10 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-sm font-black text-white uppercase tracking-widest truncate mr-4">{storyModalContent.title}</h3>
                <button onClick={() => setStoryModalContent(null)} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto no-scrollbar">
                <p className="text-sm text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {storyModalContent.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed top-20 md:bottom-6 right-6 md:top-auto z-[100] bg-zinc-900 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function ExperienceContextSkeleton() {
  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-300 animate-pulse">
      {/* Context Header */}
      <div className="p-6 border-b border-white/5 bg-[#0a0a0c] z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm bg-white/10" />
          <div className="h-3 w-32 bg-white/10 rounded-sm" />
        </div>
        <div className="flex gap-4 mt-4 pt-1">
          <div className="h-4 w-20 bg-white/10 rounded-sm" />
          <div className="h-4 w-16 bg-white/10 rounded-sm" />
          <div className="ml-auto h-4 w-16 bg-white/10 rounded-sm" />
        </div>
      </div>

      {/* Scrollable Context (Story + Comments) */}
      <div className="flex-1 overflow-hidden p-6 space-y-8">
        
        {/* Story Section */}
        <div className="space-y-3">
          <div className="h-2.5 w-24 bg-white/10 rounded-sm" />
          <div className="space-y-2 pt-1">
            <div className="h-3 w-full bg-white/10 rounded-sm" />
            <div className="h-3 w-full bg-white/10 rounded-sm" />
            <div className="h-3 w-5/6 bg-white/10 rounded-sm" />
            <div className="h-3 w-2/3 bg-white/10 rounded-sm" />
          </div>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1 overflow-hidden">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-white/10 rounded-sm" />
              <div className="h-2 w-16 bg-white/10 rounded-sm" />
            </div>
            <div className="h-3 w-24 bg-white/10 rounded-sm mt-1" />
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 bg-white/10 rounded-sm" />
              <div className="h-2 w-16 bg-white/10 rounded-sm" />
            </div>
            <div className="h-3 w-20 bg-white/10 rounded-sm mt-1" />
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="h-2.5 w-32 bg-white/10 rounded-sm" />
          <div className="w-full py-4 mt-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center gap-2">
            <div className="h-4 w-4 bg-white/10 rounded-sm" />
            <div className="h-3 w-24 bg-white/10 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0c] z-10 shrink-0">
        <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-1.5 h-11">
          <div className="flex-1 ml-2 h-3 w-1/3 bg-white/10 rounded-sm" />
          <div className="h-8 w-8 rounded-xl bg-white/10 shrink-0" />
        </div>
      </div>
    </div>
  );
}
