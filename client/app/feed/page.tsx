"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppSelector } from "@/lib/store/store";
import {
  Compass,
  MapPin,
  Clock,
  Flame,
  Users,
  Radio,
  Award,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Camera,
  Plus,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Map,
  Lightbulb,
  Package,
  Home,
  DollarSign,
  Calendar,
  X,
  Send,
  Zap,
  Volume2,
  Trash2,
  Loader2,
  CheckCircle2,
  Activity
} from "lucide-react";

import {
  useFeedInfiniteQuery,
  useCommentsQuery,
  useCommentMutation,
  useLikePostMutation,
  useSavePostMutation,
  useDeletePostMutation,
  useTrackViewMutation
} from "@/hooks/api/useFeed";
import { useImpression } from "@/hooks/useImpression";

import { FeedPost, FeedQueryFilters } from "@/lib/services/feed.service";

// Image gallery slideshow component for split views and indicators
interface FeedImageGalleryProps {
  images: string[];
  onImageClick: (idx: number) => void;
}

const ImpressionTracker = ({ children, postId, onImpression, feedSessionId, sourceFeed }: { children: React.ReactNode, postId: string, onImpression: (id: string, data: any) => void, feedSessionId?: string, sourceFeed?: string }) => {
  const { ref } = useImpression(() => onImpression(postId, { feedSessionId, durationMs: 1500, lastVisiblePercent: 100, sourceFeed }), 0.5, 1500);

  return <div ref={ref} className="w-full relative h-auto">{children}</div>;
};

const FeedImageGallery = ({ images, onImageClick }: FeedImageGalleryProps) => {
  const [tick, setTick] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({});

  const handleImageLoad = (idx: number) => {
    setLoadedImages(prev => ({ ...prev, [idx]: true }));
  };

  useEffect(() => {
    // Disabled auto-transition animation from the card
  }, [images.length]);

  if (!images || images.length === 0) return null;

  let leftIdx = 0;
  let rightIdx = 1;

  if (images.length === 2) {
    leftIdx = 0;
    rightIdx = 1;
  } else if (images.length === 3) {
    const cycles = [
      [0, 1],
      [2, 0],
      [1, 2]
    ];
    const currentCycle = cycles[tick % cycles.length];
    leftIdx = currentCycle[0];
    rightIdx = currentCycle[1];
  } else if (images.length >= 4) {
    const cycles = [
      [0, 1],
      [2, 3]
    ];
    const currentCycle = cycles[tick % cycles.length];
    leftIdx = currentCycle[0];
    rightIdx = currentCycle[1];
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 group">
      {images.length === 1 ? (
        <div 
          onClick={() => onImageClick(0)}
          className="w-full h-[220px] relative overflow-hidden cursor-pointer"
        >
          {!loadedImages[0] && (
            <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center z-0">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brand-cyan animate-spin"></div>
            </div>
          )}
          <img 
            src={images[0]} 
            alt="Adventure scene" 
            onLoad={() => handleImageLoad(0)}
            className={`w-full h-full object-cover transition-all duration-500 hover:scale-105 relative z-10 ${loadedImages[0] ? 'opacity-100' : 'opacity-0'}`} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 h-[220px] relative">
          <div 
            onClick={() => onImageClick(leftIdx)}
            className="relative h-full overflow-hidden cursor-pointer bg-zinc-950"
          >
            {!loadedImages[leftIdx] && (
              <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center z-0">
                <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brand-cyan animate-spin"></div>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={`left-${leftIdx}`}
                src={images[leftIdx]} 
                alt="Adventure scene left" 
                onLoad={() => handleImageLoad(leftIdx)}
                initial={{ opacity: 0 }}
                animate={{ opacity: loadedImages[leftIdx] ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500 z-10" 
              />
            </AnimatePresence>
          </div>

          <div 
            onClick={() => onImageClick(rightIdx)}
            className="relative h-full overflow-hidden cursor-pointer bg-zinc-950"
          >
            {!loadedImages[rightIdx] && (
              <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center z-0">
                <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-brand-cyan animate-spin"></div>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={`right-${rightIdx}`}
                src={images[rightIdx]} 
                alt="Adventure scene right" 
                onLoad={() => handleImageLoad(rightIdx)}
                initial={{ opacity: 0 }}
                animate={{ opacity: loadedImages[rightIdx] ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500 z-10" 
              />
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
        {images.map((_, idx) => {
          const isHighlighted = images.length === 1 
            ? idx === 0 
            : (idx === leftIdx || idx === rightIdx);
          return (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isHighlighted 
                  ? "w-3 bg-brand-cyan" 
                  : "w-1.5 bg-white/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

const Utensils = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

// Universal category definitions for posting
const categories = [
  {
    id: "story" as const,
    label: "Adventure Story",
    description: "Detailed journals, trail logs, and epic tales",
    icon: Compass,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    hoverColor: "hover:bg-indigo-500/5",
    placeholder: "What adventure did you book or explore today? Describe the trails, details, and vibes..."
  },
  {
    id: "memory" as const,
    label: "Travel Memory",
    description: "Quick highlights, snapshots, or mini thoughts",
    icon: Camera,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    hoverColor: "hover:bg-purple-500/5",
    placeholder: "Capture a beautiful travel memory. What made this moment unforgettable?"
  },
  {
    id: "itinerary" as const,
    label: "Route & Itinerary",
    description: "Step-by-step guides, stops, and schedules",
    icon: Map,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    hoverColor: "hover:bg-cyan-500/5",
    placeholder: "Share the details of your itinerary. Days, key stops, transport, and coordinates..."
  },
  {
    id: "review" as const,
    label: "Gear Review",
    description: "Honest ratings of your outdoor & travel equipment",
    icon: Package,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hoverColor: "hover:bg-amber-500/5",
    placeholder: "What gear did you test? Share pros, cons, and performance in the field..."
  },
  {
    id: "tips" as const,
    label: "Tips & Hacks",
    description: "Essential advice for fellow explorers",
    icon: Lightbulb,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    hoverColor: "hover:bg-emerald-500/5",
    placeholder: "Got some tips for budget travel, packing light, or trail safety? Share them here..."
  },
  {
    id: "food" as const,
    label: "Food Guide",
    description: "Local culinary finds, street eats, and cafes",
    icon: Utensils,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    hoverColor: "hover:bg-rose-500/5",
    placeholder: "Where and what did you eat? Describe the flavors, local dishes, and must-try recommendations..."
  },
  {
    id: "stay" as const,
    label: "Stay & Stays",
    description: "Hostels, campsites, and homestay reviews",
    icon: Home,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    hoverColor: "hover:bg-orange-500/5",
    placeholder: "Where did you stay? Share details on the ambiance, hospitality, and overall experience..."
  },
  {
    id: "budget" as const,
    label: "Budget & Costs",
    description: "Expense splits, savings, and value-for-money tips",
    icon: DollarSign,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    hoverColor: "hover:bg-green-500/5",
    placeholder: "Break down your costs. Accommodation, food, transport, and tips for staying within budget..."
  },
  {
    id: "meetup" as const,
    label: "Events & Meetups",
    description: "Local gatherings, hikes, and group events",
    icon: Calendar,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    hoverColor: "hover:bg-blue-500/5",
    placeholder: "Are you organizing or attending a meetup? Share coordinates, times, activities, and how to join..."
  }
];

// Helper Component for word-based text truncation
const DescriptionText = ({ text, isItalic = false, borderClass = "" }: { text: string; isItalic?: boolean; borderClass?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const words = text.split(/\s+/).filter(Boolean);
  const isLong = words.length > 40;

  const displayText = isLong && !isExpanded 
    ? words.slice(0, 40).join(" ")
    : text;

  return (
    <p className={`text-xs text-zinc-300 leading-relaxed font-medium mt-1 ${isItalic ? "italic" : ""} ${borderClass}`}>
      {isItalic ? `"${displayText}"` : displayText}
      {isLong && (
        <>
          {!isExpanded && "..."}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="ml-1.5 text-brand-cyan hover:underline font-bold focus:outline-none cursor-pointer inline-block"
          >
            {isExpanded ? "show less" : "...more"}
          </button>
        </>
      )}
    </p>
  );
};

export default function ExplorerFeedPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Sync Redux auth state
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const executeAuthAction = (actionName: string, actionCallback: () => void) => {
    if (!isAuthenticated) {
      setPendingAction(actionName);
      setShowLoginModal(true);
    } else {
      actionCallback();
    }
  };

  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Trending");

  // Filters Options
  const filters = ["All", "Following", "Communities", "Experiences", "Trending", "Nearby", "Saved", "Host", "Quests"];
  const sortOptions = ["Trending", "Latest", "Popular"];

  // Map Filter Tab to Backend Feed Filters
  const currentFilters = useMemo((): FeedQueryFilters => {
    let feedType: any = 'global';
    let category: string | undefined;

    if (activeFilter === 'Following') {
      feedType = 'following';
    } else if (activeFilter === 'Trending') {
      feedType = 'trending';
    } else if (activeFilter === 'Experiences') {
      feedType = 'category';
      category = 'experience';
    } else if (activeFilter === 'Communities') {
      feedType = 'category';
      category = 'community';
    } else if (activeFilter === 'Quests') {
      feedType = 'category';
      category = 'quest';
    } else if (activeFilter === 'Nearby') {
      feedType = 'category';
      category = 'nearby';
    } else if (activeFilter === 'Saved') {
      feedType = 'saved';
    } else if (activeFilter === 'Host') {
      feedType = 'host';
    }

    if (activeSort === 'Popular') {
      feedType = 'trending';
    } else if (activeSort === 'Latest' && feedType === 'global') {
      feedType = 'recent';
    }

    return { feedType, category, limit: 9, feedSessionId: crypto.randomUUID() };
  }, [activeFilter, activeSort]);

  // TanStack Infinite Query API integration
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedLoading,
    isRefetching: isFeedRefetching,
  } = useFeedInfiniteQuery(currentFilters);

  // Adapt backend posts to frontend interface format
  const feedPosts = useMemo(() => {
    if (!infiniteData) return [];
    
    return infiniteData.pages.flatMap((page) => page.items).map((post: FeedPost) => {
      const isMemory = post.category === 'memory' || post.category === 'memories';
      let type: any = 'experience';
      if (isMemory) type = 'memory';
      else if (post.category === 'quest') type = 'quest';
      else if (post.category === 'community') type = 'community';

      return {
        id: post.id,
        type,
        user: {
          name: post.author?.displayName || 'Wanderer',
          username: `@${post.author?.username || 'explorer'}`,
          avatar: post.author?.displayName ? post.author.displayName.charAt(0).toUpperCase() : 'W',
          avatarUrl: post.author?.avatarUrl,
          level: post.author?.level || 1,
          verified: post.author?.type === 'OFFICIAL' || post.author?.type === 'HOST' || (post.author?.level ?? 0) >= 15,
        },
        timestamp: formatRelativeTime(post.publishedAt || post.createdAt),
        visibility: post.visibility === 'PUBLIC' ? 'Public' : post.visibility === 'FOLLOWERS' ? 'Friends' : 'Private',
        category: post.category,
        experienceName: !isMemory ? post.title : undefined,
        memoryTitle: isMemory ? post.title : undefined,
        location: post.locationName || 'On the Trail',
        storyText: !isMemory ? post.content : undefined,
        memoryText: isMemory ? post.content : undefined,
        images: post.images || [],
        singleImage: isMemory && post.images && post.images.length > 0 ? post.images[0] : undefined,
        likes: post.likeCount || 0,
        commentsCount: post.commentCount || 0,
        hasLiked: post.hasLiked || false,
        hasSaved: post.hasSaved || false,
        voiceNote: post.audioUrl ? { name: 'Voice Note Coordinates', duration: post.audioDuration || 35 } : undefined,
      };
    });
  }, [infiniteData]);

  // Mutations
  const likeMutation = useLikePostMutation();
  const saveMutation = useSavePostMutation();
  const deleteMutation = useDeletePostMutation();
  const addCommentMutation = useCommentMutation();
  const trackViewMutation = useTrackViewMutation();

  const [toast, setToast] = useState<string | null>(null);

  // Image Viewer Modal States
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Modal images auto-rotation every 5 seconds
  useEffect(() => {
    if (!isModalOpen || modalImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % modalImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isModalOpen, modalImages]);

  // Handle escape and arrow keys for image modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "ArrowRight" && modalImages.length > 1) {
        setActiveImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === "ArrowLeft" && modalImages.length > 1) {
        setActiveImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalImages]);

  // Comments toggles
  const [activeCommentPost, setActiveCommentPost] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // TanStack comments query for active post
  const { data: commentsData, isLoading: isCommentsLoading } = useCommentsQuery(
    activeCommentPost?.id || "",
    Boolean(activeCommentPost)
  );

  const postComments = useMemo(() => {
    return commentsData?.comments || [];
  }, [commentsData]);

  // Confetti / Celebration states
  const [celebrationOverlay, setCelebrationOverlay] = useState(false);
  const [celebratedTitle, setCelebratedTitle] = useState("");

  // Reference for intersection observer scroll detector
  const loaderRef = useRef<HTMLDivElement>(null);

  // Toast notifier
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle Like with optimism
  const handleLike = (postId: string) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;
    executeAuthAction("like posts", () => {
      likeMutation.mutate({ postId, alreadyLiked: !!post.hasLiked });
    });
  };

  // Toggle Save with optimism
  const handleSave = (postId: string) => {
    const post = feedPosts.find(p => p.id === postId);
    if (!post) return;
    executeAuthAction("bookmark posts", () => {
      saveMutation.mutate({ postId, alreadySaved: !!post.hasSaved }, {
        onSuccess: () => {
          if (!post.hasSaved) {
            triggerToast("Added to experience wishlist!");
          } else {
            triggerToast("Removed from wishlist.");
          }
        }
      });
    });
  };

  // Trigger celebration particle overlay
  const handleCelebrate = (title: string) => {
    setCelebratedTitle(title);
    setCelebrationOverlay(true);
    setTimeout(() => {
      setCelebrationOverlay(false);
    }, 4000);
  };

  // Add Comment mutation-driven
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    executeAuthAction("write comments", () => {
      addCommentMutation.mutate({ postId, content: commentInput }, {
        onSuccess: () => {
          setCommentInput("");
        },
        onError: () => {
          triggerToast("Failed to post comment.");
        }
      });
    });
  };

  // Infinite Scroll Trigger via IntersectionObserver
  useEffect(() => {
    if (!hasNextPage || isFeedLoading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
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
  }, [hasNextPage, isFeedLoading, isFetchingNextPage, fetchNextPage]);

  // Handle Guest Tab protection
  const handleFilterClick = (filter: string) => {
    if (filter === "Following" || filter === "Saved") {
      executeAuthAction(`view ${filter.toLowerCase()} feed`, () => {
        setActiveFilter(filter);
      });
    } else {
      setActiveFilter(filter);
    }
  };

  // Estimate height of a post to distribute evenly across columns
  const estimatePostHeight = (post: any) => {
    let height = 140; 
    
    const description = post.storyText || post.memoryText || "";
    if (description) {
      const textLen = description.length;
      height += Math.min(80, textLen * 0.25); 
    }

    if (post.type === "experience") {
      if (post.images && post.images.length > 0) {
        height += 230; 
      }
      if (post.user.name === "Rishiraj") {
        height += 48;
      }
    } else if (post.type === "memory") {
      if (post.singleImage) {
        height += 234;
      }
    } else if (post.type === "community") {
      height += 286; 
    } else if (post.type === "quest") {
      height += 150; 
    }

    return height;
  };

  // Dynamically distribute posts to the shortest column
  const col1Posts: any[] = [];
  const col2Posts: any[] = [];
  const col3Posts: any[] = [];

  let col1Height = 0;
  let col2Height = 0;
  let col3Height = 0;

  feedPosts.forEach((post) => {
    const postHeight = estimatePostHeight(post);
    if (col1Height <= col2Height && col1Height <= col3Height) {
      col1Posts.push(post);
      col1Height += postHeight;
    } else if (col2Height <= col1Height && col2Height <= col3Height) {
      col2Posts.push(post);
      col2Height += postHeight;
    } else {
      col3Posts.push(post);
      col3Height += postHeight;
    }
  });

  const renderPostCard = (post: any, index: number) => {
    const isRishiraj = post.user.name === "Rishiraj" || post.user.username === "@rishi005";

    const typeClasses = {
      experience: "shine-card-cyan",
      quest: "shine-card-purple",
      memory: "shine-card-purple",
      campfire: "shine-card-purple",
      community: "shine-card-emerald"
    }[post.type as string] || "";

    return (
      <ImpressionTracker 
        key={post.id} 
        postId={post.id} 
        feedSessionId={currentFilters.feedSessionId}
        sourceFeed={currentFilters.feedType}
        onImpression={(id, data) => trackViewMutation.mutate({ postId: id, data })}>
        <div className={`glass-panel border p-4 md:p-6 rounded-3xl flex flex-col gap-4 text-left shadow-lg transition-all duration-300 relative overflow-hidden group w-full shine-card ${typeClasses} ${
          isRishiraj 
            ? "border-amber-500/35 shadow-amber-500/[0.01] bg-gradient-to-tr from-amber-500/[0.02] via-transparent to-rose-500/[0.01] hover:border-amber-500/50 hover:shadow-amber-500/5" 
            : "border-white/12 hover:border-white/20"
        }`}>
          {/* CARD HEADER */}
          <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => router.push(`/profile/${post.user.username.replace('@', '')}`)}
              className={`h-9 w-9 rounded-full p-0.5 shrink-0 cursor-pointer ${
                isRishiraj 
                  ? "bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                  : "bg-gradient-to-tr from-brand-indigo to-brand-purple"
              }`}
            >
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-white overflow-hidden text-xs">
                {post.user.avatarUrl ? (
                  <img src={post.user.avatarUrl} alt={post.user.name} className="h-full w-full object-cover" />
                ) : (
                  post.user.avatar
                )}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span 
                  onClick={() => router.push(`/profile/${post.user.username.replace('@', '')}`)}
                  className="text-xs font-black text-white hover:text-brand-cyan transition-colors cursor-pointer"
                >
                  {post.user.name}
                </span>
                {isRishiraj ? (
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0 shadow-sm shadow-amber-500/5">
                    <Sparkles className="h-2.5 w-2.5 text-amber-400 animate-pulse" /> Host
                  </span>
                ) : post.user.verified ? (
                  <span className="h-3.5 w-3.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                ) : null}
                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-md">Lv.{post.user.level}</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{post.visibility}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap bg-white/[0.03] border border-white/5 px-2 py-1 rounded-lg">
              {post.timestamp}
            </span>
          </div>
        </div>

        {/* CARD BODY */}
        <div className="w-full">
          {/* TYPE 1: EXPERIENCE STORY */}
          {post.type === "experience" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const catMeta = categories.find(c => c.id === post.category);
                  const label = catMeta?.label || "Experience Story";
                  const colorClass = catMeta?.color.split(' ')[0] || "text-brand-cyan";
                  const bgClass = catMeta?.color.split(' ')[1] || "bg-brand-cyan/10";
                  const borderClass = catMeta?.color.split(' ')[2] || "border-brand-cyan/20";
                  return (
                    <span className={`text-[10px] font-bold ${colorClass} ${bgClass} border ${borderClass} px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {label}
                    </span>
                  );
                })()}
                <h2 className="text-base font-black text-white">{post.experienceName}</h2>
              </div>

              {post.images && post.images.length > 0 && (
                <FeedImageGallery 
                  images={post.images} 
                  onImageClick={(idx) => {
                    setModalImages(post.images ?? []);
                    setActiveImageIndex(idx);
                    setIsModalOpen(true);
                  }}
                />
              )}

              <div className="flex items-center gap-1.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-[10px] font-semibold text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                <span className="truncate">{post.location}</span>
              </div>

              <DescriptionText text={post.storyText || ""} />

              {post.voiceNote && (
                <div className="mt-3 flex items-center gap-3 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl">
                  <button
                    onClick={() => triggerToast(`Playing voice note snap...`)}
                    className="h-8 w-8 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-300 truncate block">{post.voiceNote.name}</span>
                    <div className="flex gap-0.5 items-center h-4 mt-1">
                      {[...Array(24)].map((_, idx) => {
                        const h = [6, 12, 10, 4, 16, 14, 8, 6, 12, 10, 14, 8, 4, 12, 16, 10, 6, 14, 8, 12, 6, 4, 10, 8][idx];
                        return (
                          <div
                            key={idx}
                            style={{ height: `${h}px` }}
                            className="w-1 rounded-full bg-brand-cyan/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold shrink-0">0:{post.voiceNote.duration < 10 ? `0${post.voiceNote.duration}` : post.voiceNote.duration}</span>
                </div>
              )}

              {isRishiraj && (
                <button
                  onClick={() => triggerToast("Booking experience module...")}
                  className="mt-2 w-full h-10 rounded-xl bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="h-4 w-4" /> Try This Experience
                </button>
              )}
            </div>
          )}

          {/* TYPE 2: QUEST COMPLETION */}
          {post.type === "quest" && (
            <div className="flex flex-col gap-3 bg-gradient-to-tr from-brand-indigo/5 via-transparent to-transparent p-4 rounded-2xl border border-brand-indigo/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber shrink-0 animate-bounce">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Quest Completed
                  </span>
                  <h2 className="text-base font-black text-white mt-1">{post.experienceName}</h2>
                </div>
              </div>

              <DescriptionText text={post.storyText || ""} />

              <button
                onClick={() => handleCelebrate(post.experienceName || "Quest Complete")}
                className="mt-2 w-full h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="h-4 w-4 text-brand-amber" /> Celebrate Achievement
              </button>
            </div>
          )}

          {/* TYPE 3: TRAVEL MEMORY */}
          {post.type === "memory" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const catMeta = categories.find(c => c.id === post.category);
                  const label = catMeta?.label || "Memory Journal";
                  const colorClass = catMeta?.color.split(' ')[0] || "text-brand-purple";
                  const bgClass = catMeta?.color.split(' ')[1] || "bg-brand-purple/10";
                  const borderClass = catMeta?.color.split(' ')[2] || "border-brand-purple/20";
                  return (
                    <span className={`text-[10px] font-bold ${colorClass} ${bgClass} border ${borderClass} px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {label}
                    </span>
                  );
                })()}
                <h2 className="text-base font-black text-white">{post.memoryTitle}</h2>
              </div>

              {post.images && post.images.length > 0 && (
                <FeedImageGallery 
                  images={post.images} 
                  onImageClick={(idx) => {
                    setModalImages(post.images);
                    setActiveImageIndex(idx);
                    setIsModalOpen(true);
                  }}
                />
              )}

              {post.location && (
                <div className="flex items-center gap-1.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-[10px] font-semibold text-zinc-400">
                  <MapPin className="h-3.5 w-3.5 text-brand-purple shrink-0" />
                  <span className="truncate">{post.location}</span>
                </div>
              )}

              <DescriptionText text={post.memoryText || ""} isItalic={true} borderClass="pl-3 border-l border-brand-purple/30" />
            </div>
          )}
        </div>

        {/* CARD FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-500 font-bold uppercase tracking-wider w-full">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${post.hasLiked ? "text-brand-cyan" : "hover:text-zinc-300"}`}
            aria-label="Like post"
          >
            <Heart className={`h-4.5 w-4.5 ${post.hasLiked ? "fill-brand-cyan text-brand-cyan" : ""}`} />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setActiveCommentPost(post)}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Toggle comments"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>{post.commentsCount}</span>
          </button>

          <button
            onClick={() => handleSave(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${post.hasSaved ? "text-brand-purple" : "hover:text-zinc-300"}`}
            aria-label="Save post"
          >
            <Bookmark className={`h-4.5 w-4.5 ${post.hasSaved ? "fill-brand-purple text-brand-purple" : ""}`} />
            <span>Save</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/profile/${post.user.username.replace('@', '')}`);
              triggerToast("Link copied to clipboard!");
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="h-4.5 w-4.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
      </ImpressionTracker>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-16">
        <div className="w-full max-w-[1440px] px-3 md:px-12 py-4 md:py-8 relative flex flex-col gap-6 overflow-y-visible">

          {/* HEADER PANEL */}
          <div className="glass-panel p-4 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full max-w-4xl mx-auto">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Compass className="h-6 w-6 text-brand-cyan animate-pulse" />
                Explorer Feed
              </h1>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                Discover adventures, stories, achievements, and real-life experiences in your explorer community.
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 w-full">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Sort by</span>
                <div className="relative">
                  <select
                    value={activeSort}
                    onChange={(e) => setActiveSort(e.target.value)}
                    className="bg-zinc-900 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-bold outline-none cursor-pointer hover:border-white/10 transition-colors"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => {
                  executeAuthAction("create posts", () => {
                    router.push("/feed/create-post");
                  });
                }}
                className="h-8 px-3 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-indigo/10 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Create Post
              </button>
            </div>

            {/* Filters List */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-2 px-2 scroll-smooth">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeFilter === filter
                      ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-black"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* INITIAL FEED LOADING STATE SKELETON */}
          {isFeedLoading && feedPosts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1440px]">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-zinc-900" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 w-28 bg-zinc-900 rounded-md" />
                        <div className="h-2 w-16 bg-zinc-900 rounded-md" />
                      </div>
                    </div>
                  </div>
                  <div className="h-32 bg-zinc-900 rounded-2xl w-full" />
                  <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
                </div>
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!isFeedLoading && feedPosts.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Compass className="h-10 w-10 text-zinc-600 animate-pulse" />
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No Coordinates Registered Yet</p>
              <p className="text-xs text-zinc-600 max-w-xs">Be the first explorer to publish stories or memories on this frequency.</p>
            </div>
          )}

          {/* Mobile & Tablet Layout */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-6 lg:hidden w-full">
            {feedPosts.map((post, idx) => renderPostCard(post, idx))}
          </div>

          {/* Desktop Layout (Masonry side-by-side columns - 3 fixed columns) */}
          <div className="hidden lg:grid grid-cols-3 gap-6 w-full items-start">
            <div className="flex flex-col gap-6">
              {col1Posts.map((post, idx) => renderPostCard(post, idx))}
            </div>
            <div className="flex flex-col gap-6">
              {col2Posts.map((post, idx) => renderPostCard(post, idx))}
            </div>
            <div className="flex flex-col gap-6">
              {col3Posts.map((post, idx) => renderPostCard(post, idx))}
            </div>
          </div>

          {/* INFINITE SCROLL SKELETON LOADERS */}
          {hasNextPage && (
            <div ref={loaderRef} className="py-6 w-full">
              {isFetchingNextPage && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-900" />
                          <div className="flex flex-col gap-1.5">
                            <div className="h-3 w-28 bg-zinc-900 rounded-md" />
                            <div className="h-2 w-16 bg-zinc-900 rounded-md" />
                          </div>
                        </div>
                      </div>
                      <div className="h-32 bg-zinc-900 rounded-2xl w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!hasNextPage && feedPosts.length > 0 && (
            <div className="py-8 text-center text-xs text-zinc-600 font-mono font-bold uppercase tracking-widest w-full">
              You've explored all feed highlights for today!
            </div>
          )}

          {/* FLOATING CONFETTI/CELEBRATION OVERLAY */}
          <AnimatePresence>
            {celebrationOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-zinc-950/20 backdrop-blur-[1px]"
              >
                {[...Array(20)].map((_, i) => {
                  const left = `${Math.random() * 100}%`;
                  const colors = ["#4F46E5", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];
                  const randomColor = colors[Math.floor(Math.random() * colors.length)];
                  const size = `${Math.random() * 8 + 6}px`;

                  return (
                    <motion.div
                      key={i}
                      initial={{ y: "100vh", opacity: 1, scale: 0.5, rotate: 0 }}
                      animate={{ y: "-10vh", opacity: 0, scale: 1.2, rotate: Math.random() * 360 }}
                      transition={{ duration: Math.random() * 2.5 + 2, ease: "easeOut" }}
                      className="absolute bottom-0"
                      style={{
                        left,
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        backgroundColor: randomColor,
                        boxShadow: `0 0 10px ${randomColor}`
                      }}
                    />
                  );
                })}

                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 30 }}
                  className="bg-zinc-900/90 border border-brand-purple/30 p-6 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-xs relative pointer-events-auto backdrop-blur-xl"
                >
                  <div className="h-14 w-14 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-cyan mb-3">
                    <Sparkles className="h-7 w-7 text-brand-cyan mb-0" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Congratulations!</h4>
                  <p className="text-xs text-zinc-300 font-semibold mt-1">Celebrating completion of:</p>
                  <p className="text-xs text-brand-cyan font-black mt-1.5 italic">"{celebratedTitle}"</p>
                  <div className="mt-4 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">+100 Sparks Added</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOAST SYSTEM */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-20 md:bottom-6 right-6 z-50 glass-panel border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
              >
                <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold text-zinc-300">
                  {toast}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* IMAGE VIEWER MODAL */}
          <AnimatePresence>
            {isModalOpen && modalImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
                onClick={() => setIsModalOpen(false)}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 z-[110] h-10 w-10 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <motion.div
                  initial={{ scale: 0.95, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="relative max-w-5xl w-full flex items-center justify-center pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {modalImages.length > 1 && (
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
                      className="absolute left-2 md:-left-16 z-[105] h-12 w-12 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                  )}

                  <div className="relative w-fit max-w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-950">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeImageIndex}
                        src={modalImages[activeImageIndex]}
                        alt={`Enlarged image ${activeImageIndex + 1}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                        className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                      />
                    </AnimatePresence>

                    {modalImages.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 flex">
                        <motion.div
                          key={activeImageIndex}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 5, ease: "linear" }}
                          className="h-full bg-brand-cyan"
                        />
                      </div>
                    )}
                  </div>

                  {modalImages.length > 1 && (
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 md:-right-16 z-[105] h-12 w-12 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  )}

                  {modalImages.length > 1 && (
                    <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                      {modalImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            activeImageIndex === idx 
                              ? "w-6 bg-brand-cyan" 
                              : "w-2.5 bg-zinc-600 hover:bg-zinc-400"
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feed Comment Modal Popup */}
          <AnimatePresence>
            {activeCommentPost && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
                <div className="absolute inset-0 cursor-default" onClick={() => setActiveCommentPost(null)} />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="glass-panel border border-white/10 rounded-3xl p-6 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
                  style={{ backgroundColor: '#09090b' }}
                >
                  <button
                    onClick={() => setActiveCommentPost(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                    
                    {/* Post details inside modal */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shrink-0">
                        <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white overflow-hidden">
                          {activeCommentPost.user.avatarUrl ? (
                            <img src={activeCommentPost.user.avatarUrl} alt={activeCommentPost.user.name} className="h-full w-full object-cover" />
                          ) : (
                            activeCommentPost.user.avatar
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white">{activeCommentPost.user.name}</span>
                          <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-md">Lv.{activeCommentPost.user.level}</span>
                        </div>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{activeCommentPost.timestamp}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                        {activeCommentPost.type === "experience" ? activeCommentPost.experienceName : activeCommentPost.type === "quest" ? activeCommentPost.questName : activeCommentPost.type === "memory" ? activeCommentPost.memoryTitle : "Feed Post"}
                      </h3>
                      <p className="text-[10.5px] text-zinc-300 leading-relaxed font-medium">
                        {activeCommentPost.type === "experience" ? activeCommentPost.storyText : activeCommentPost.type === "memory" ? activeCommentPost.memoryText : activeCommentPost.type === "quest" ? `Quest completion reward: ${activeCommentPost.reward}` : activeCommentPost.discussionHighlight || "Community post update."}
                      </p>
                    </div>

                    {/* Comment area */}
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Post Comments ({postComments.length})</h4>
                      
                      {isCommentsLoading ? (
                        <div className="flex justify-center items-center py-6">
                          <Loader2 className="h-5 w-5 animate-spin text-brand-cyan" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {postComments.map((comm: any) => (
                            <div key={comm.id} className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl text-[10px] text-left flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-200">{comm.user.displayName}</span>
                                  <span className="text-[8px] text-zinc-500 font-mono">{formatRelativeTime(comm.createdAt)}</span>
                                </div>
                                <p className="text-zinc-400 leading-relaxed mt-1 break-words">{comm.content}</p>
                              </div>
                            </div>
                          ))}
                          {postComments.length === 0 && (
                            <p className="text-[9px] text-zinc-500 font-mono py-2">No comments published. Write yours below!</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky comment input field */}
                  <div className="pt-3 border-t border-white/5 mt-3 shrink-0 bg-zinc-950/20">
                    <div className="flex gap-2 bg-zinc-900 border border-white/5 p-1 rounded-xl items-center">
                      <input
                        type="text"
                        placeholder="Share your thoughts..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(activeCommentPost.id)}
                        className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full px-2 font-semibold"
                      />
                      <button
                        onClick={() => handleAddComment(activeCommentPost.id)}
                        className="px-3.5 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-lg transition-all shrink-0 cursor-pointer"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* GUEST MODE INTERACTION REQUIRED MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowLoginModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-panel border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full relative z-10 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: '#09090b' }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shadow-lg flex items-center justify-center mb-4">
                <div className="h-full w-full rounded-2xl bg-zinc-900 flex items-center justify-center text-white border border-white/5">
                  <Compass className="h-6 w-6 text-brand-cyan animate-pulse" />
                </div>
              </div>

              <h3 className="text-base font-black text-white uppercase tracking-wider">Authentication Required</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-2 leading-relaxed">
                You need to be logged in to {pendingAction || "interact with this post"}. Join Wandercall to track your adventures and unlock quests!
              </p>

              <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="h-10 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push("/login");
                  }}
                  className="h-10 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg"
                >
                  Log In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper for formatting dates to relative time
function formatRelativeTime(dateStr: string) {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
