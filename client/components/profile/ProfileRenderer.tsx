"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, easeOut, AnimatePresence } from "framer-motion";
import { 
  Award, 
  BrainCircuit, 
  Calendar, 
  CheckCircle2, 
  Compass, 
  Globe, 
  Heart, 
  Image as ImageIcon, 
  Radio, 
  User, 
  Users, 
  Clock, 
  MapPin, 
  Camera, 
  Loader2,
  MessageSquare, 
  BookOpen, 
  Check, 
  Star, 
  ChevronLeft,
  ChevronRight, 
  Bookmark, 
  ArrowRight,
  Sparkles,
  Map,
  Shield,
  ThumbsUp,
  Share2,
  TrendingUp,
  UserPlus,
  MessageCircle,
  X
} from "lucide-react";
import { useAppSelector } from "@/lib/store/store";
import { 
  useUploadAvatarMutation, 
  useUploadCoverImageMutation,
} from "@/hooks/api/useUserMutations";
import { RelationshipButton } from "@/components/shared/RelationshipButton";
import { 
  useFollowersInfiniteQuery,
  useFollowingInfiniteQuery
} from "@/hooks/api/useUserQueries";
import { UserProfileResponse } from "@/lib/services/user.service";
import { 
  useUserFeedQuery, 
  useLikePostMutation, 
  useSavePostMutation 
} from "@/hooks/api/useFeed";

interface ProfileRendererProps {
  profile: UserProfileResponse;
}

// Inline CompanionAvatar helper to ensure no broken dependencies
interface CompanionAvatarProps {
  avatar?: string;
  name: string;
  className?: string;
}

function CompanionAvatar({ avatar, name, className = "h-8 w-8 text-xs" }: CompanionAvatarProps) {
  return (
    <div className={`rounded-full bg-zinc-900 flex items-center justify-center font-black text-white overflow-hidden shrink-0 select-none ${className}`}>
      {avatar ? (
        <img src={avatar} alt={name} className="h-full w-full object-cover" />
      ) : (
        name ? name.trim().charAt(0).toUpperCase() : "E"
      )}
    </div>
  );
}

export default function ProfileRenderer({ profile }: ProfileRendererProps) {
  const router = useRouter();
  const authUserId = useAppSelector((state) => state.auth.userId);
  const isOwner = profile.userId === authUserId;

  // Mutations
  const uploadAvatarMutation = useUploadAvatarMutation(authUserId);
  const uploadCoverMutation = useUploadCoverImageMutation(authUserId);

  // Connection queries for visitors

  // Inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // States
  const [showToast, setShowToast] = useState<string | null>(null);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [activeDnaTab, setActiveDnaTab] = useState<number | null>(null);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);

  // Connections modal states
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsActiveTab, setConnectionsActiveTab] = useState<"followers" | "following">("followers");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Paginated followers/following queries
  const {
    data: followersData,
    fetchNextPage: fetchNextFollowers,
    hasNextPage: hasMoreFollowers,
    isFetchingNextPage: isFetchingMoreFollowers,
    isLoading: isFollowersLoading,
  } = useFollowersInfiniteQuery(
    profile.username,
    debouncedSearch,
    showConnectionsModal && connectionsActiveTab === "followers"
  );

  const {
    data: followingData,
    fetchNextPage: fetchNextFollowing,
    hasNextPage: hasMoreFollowing,
    isFetchingNextPage: isFetchingMoreFollowing,
    isLoading: isFollowingLoading,
  } = useFollowingInfiniteQuery(
    profile.username,
    debouncedSearch,
    showConnectionsModal && connectionsActiveTab === "following"
  );

  const followersList = useMemo(() => {
    if (!followersData) return [];
    return followersData.pages.flatMap((page) => page.items);
  }, [followersData]);

  const followingList = useMemo(() => {
    if (!followingData) return [];
    return followingData.pages.flatMap((page) => page.items);
  }, [followingData]);

  const itemsList = connectionsActiveTab === "followers" ? followersList : followingList;
  const isLoadingList = connectionsActiveTab === "followers" ? isFollowersLoading : isFollowingLoading;
  const hasNextPage = connectionsActiveTab === "followers" ? hasMoreFollowers : hasMoreFollowing;
  const fetchNextPage = connectionsActiveTab === "followers" ? fetchNextFollowers : fetchNextFollowing;
  const isFetchingNext = connectionsActiveTab === "followers" ? isFetchingMoreFollowers : isFetchingMoreFollowing;

  // Fallback calculations for followers/following count (using backend DTO counters)
  const followersCount = profile.followerCount ?? 0;
  const followingCount = profile.followingCount ?? 0;

  // Toast Helper
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Upload Actions
  const handleAvatarClick = () => {
    if (isOwner) avatarInputRef.current?.click();
  };

  const handleCoverClick = () => {
    if (isOwner) coverInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file, {
        onSuccess: () => triggerToast("Avatar updated successfully!"),
        onError: () => triggerToast("Failed to upload avatar."),
      });
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCoverMutation.mutate(file, {
        onSuccess: () => triggerToast("Cover banner updated successfully!"),
        onError: () => triggerToast("Failed to upload cover banner."),
      });
    }
  };

  // Follow logic is now delegated to RelationshipButton

  const handleMessageClick = () => {
    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    router.push("/profile/friends");
    triggerToast(`Connecting secure chat tunnel to ${profile.displayName}...`);
  };

  const handleShareProfile = async () => {
    const cleanUsername = profile.username.replace(/^@/, "");
    const profileUrl = `${window.location.origin}/profile/${cleanUsername}`;
    const shareData = {
      title: "Wandercall Explorer Passport",
      text: `Check out ${profile.displayName}'s explorer passport profile on Wandercall!`,
      url: profileUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast("Profile shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          triggerToast("Failed to share profile.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        triggerToast("Profile link copied to clipboard!");
      } catch (err) {
        triggerToast("Failed to copy link.");
      }
    }
  };

  // Deterministic DNA stats based on profile.username
  const dnaStats = useMemo(() => {
    const usernameClean = profile.username.toLowerCase();
    let seed = 0;
    for (let i = 0; i < usernameClean.length; i++) {
      seed += usernameClean.charCodeAt(i);
    }
    
    const getVal = (offset: number) => {
      return 60 + ((seed + offset) % 36); // Deterministic score between 60% and 95%
    };

    return [
      { name: "Explorer", value: getVal(1), desc: "Thrives on remote expeditions and pathfinding.", color: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5" },
      { name: "Thrill Seeker", value: getVal(2), desc: "Seeks adrenaline rushes, heights, and speed.", color: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
      { name: "Creator", value: getVal(3), desc: "Documents journeys, takes photographs, and logs stories.", color: "text-brand-purple border-brand-purple/20 bg-brand-purple/5" },
      { name: "Learner", value: getVal(4), desc: "Interested in local history, ecology, and heritage.", color: "text-brand-indigo border-brand-indigo/20 bg-brand-indigo/5" },
      { name: "Socializer", value: getVal(5), desc: "Enjoys cohort meetups, campfire sessions, and group treks.", color: "text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5" },
      { name: "Storyteller", value: getVal(6), desc: "Shares travel journals, notes, and hosts campfires.", color: "text-brand-amber border-brand-amber/20 bg-brand-amber/5" },
    ];
  }, [profile.username]);

  // Deterministic Compatibility Score for Followers List
  const calculateCompatibility = (targetUsername: string) => {
    const combined = (profile.username + targetUsername).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 30) + 70;
  };

  // Timeline & Mocks
  const timelineJourney = useMemo(() => {
    const u = profile.displayName;
    return [
      { 
        date: "June 20, 2026", 
        type: "adventure", 
        title: `Completed Coorg Coffee Estate Trek`, 
        details: `${u} completed the 14km hike through private coffee plantations and forest trails.`,
        xp: "+250 XP", 
        meta: "Coorg, Karnataka"
      },
      { 
        date: "June 12, 2026", 
        type: "campfire", 
        title: `Hosted Live Campfire: 'Solo Trekking in Himalayas'`, 
        details: `${u} shared backpacking routes, gear guides, and safety tips.`,
        xp: "+150 XP", 
        meta: "89 listeners • 45m"
      },
      { 
        date: "June 05, 2026", 
        type: "badge", 
        title: "Unlocked 'Night Owl' Achievement Badge", 
        details: "Participated in 5 live audio campfires starting after midnight.",
        xp: "+100 XP", 
        meta: "Special Trophy"
      }
    ];
  }, [profile.displayName]);

  // Load all user posts (formerly strictly 'memory' category) from backend
  const { data: userFeedData } = useUserFeedQuery(profile.username);

  const memoriesList = useMemo(() => {
    if (!userFeedData?.items) return [];
    
    return userFeedData.items.slice(0, 3).map((post: any) => ({
      id: post.id,
      title: post.title,
      text: post.content || "",
      tag: post.category.toUpperCase(),
      location: post.locationName || "On the Trail",
      image: post.images && post.images.length > 0 
        ? post.images[0] 
        : "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
      likes: post.likeCount || 0,
      comments: post.commentCount || 0,
      liked: post.hasLiked || false,
      saved: post.hasSaved || false
    }));
  }, [userFeedData]);

  const likeMutation = useLikePostMutation();
  const saveMutation = useSavePostMutation();

  const handleLikeMemory = (postId: string, alreadyLiked: boolean) => {
    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    likeMutation.mutate({ postId, alreadyLiked });
  };

  const handleSaveMemory = (postId: string, alreadySaved: boolean) => {
    if (!authUserId) {
      router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    saveMutation.mutate({ postId, alreadySaved }, {
      onSuccess: () => {
        triggerToast(!alreadySaved ? "Memory saved to bookmarks!" : "Memory removed from bookmarks!");
      }
    });
  };

  // Radar calculations
  const cx = 150;
  const cy = 150;
  const maxVal = 100;
  const radius = 110;
  const bgGrids = [25, 50, 75, 100];

  const getCoordinates = (index: number, val: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  const pointsStr = dnaStats.map((stat, i) => {
    const { x, y } = getCoordinates(i, stat.value);
    return `${x},${y}`;
  }).join(" ");

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: easeOut } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-10 overflow-y-visible"
    >
      {/* SECTION 1: PROFILE COVER & HERO CARD */}
      <motion.section variants={itemVariants} className="w-full relative flex flex-col">
        {/* Cover Photo */}
        <div className="w-full h-[220px] md:h-[320px] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl group/cover flex items-center justify-center select-none bg-zinc-950">
          {profile.coverImageUrl ? (
            <img 
              src={profile.coverImageUrl} 
              alt={`${profile.displayName} Banner`} 
              className="w-full h-full object-cover opacity-85"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
              <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-indigo/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
              <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-cyan/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center -mt-6 md:-mt-8">
                <div className="px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-inner">
                  <Sparkles className="h-3 w-3 text-brand-cyan animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 font-mono">Verified Explorer Passport</span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm uppercase">
                  {profile.displayName}
                </h2>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 pointer-events-none" />

          {isOwner && (
            <>
              <input 
                type="file" 
                ref={coverInputRef} 
                accept="image/*" 
                onChange={handleCoverFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleCoverClick} 
                disabled={uploadCoverMutation.isPending}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-950/80 border border-white/10 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-xl z-20 group disabled:opacity-50" 
                aria-label="Change cover photo"
              >
                {uploadCoverMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
                ) : (
                  <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Profile Card Header overlay */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end px-3 md:px-8 -mt-16 md:-mt-20 z-10 gap-6 w-full text-center lg:text-left">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-5 w-full lg:w-auto">
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-1 border-4 border-zinc-950 shadow-2xl relative group/avatar">
              <div 
                onClick={() => {
                  if (profile.avatarUrl) {
                    setZoomedAvatar({ url: profile.avatarUrl, name: profile.displayName });
                  }
                }}
                className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center text-3xl md:text-4xl font-black text-white overflow-hidden cursor-pointer"
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  profile.displayName ? profile.displayName.trim().charAt(0).toUpperCase() : "E"
                )}
              </div>
              
              {isOwner && (
                <>
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    accept="image/*" 
                    onChange={handleAvatarFileChange} 
                    className="hidden" 
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAvatarClick();
                    }} 
                    disabled={uploadAvatarMutation.isPending}
                    className="absolute bottom-0 left-0 p-2 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-lg z-20 group disabled:opacity-50" 
                    aria-label="Change avatar photo"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin text-brand-purple" />
                    ) : (
                      <Camera className="h-3 w-3 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{profile.displayName}</h1>
                <span className="h-5 w-5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[10px] font-bold">
                  <Check className="h-3 w-3" />
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-1 text-xs font-mono text-zinc-400">
                <span>@{profile.username}</span>
                <span className="text-zinc-600 font-sans">•</span>
                <div className="flex gap-2">
                  <span 
                    onClick={() => {
                      setConnectionsActiveTab("followers");
                      setShowConnectionsModal(true);
                    }}
                    className="hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <strong className="text-zinc-200 font-sans font-black">{followersCount}</strong> Followers
                  </span>
                  <span className="text-zinc-600 font-sans">•</span>
                  <span 
                    onClick={() => {
                      setConnectionsActiveTab("following");
                      setShowConnectionsModal(true);
                    }}
                    className="hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <strong className="text-zinc-200 font-sans font-black">{followingCount}</strong> Following
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3 text-xs text-zinc-400 font-semibold">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-cyan" /> {profile.locationFormatted || "Location pending"}</span>
                <span className="h-1 w-1 rounded-full bg-white/10 hidden sm:inline" />
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-purple" /> 
                  Joined {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Recently"}
                </span>
              </div>
            </div>
          </div>

          {/* Social / Profile Actions */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 w-full lg:w-auto">
            {isOwner ? (
              <>
                <button 
                  onClick={() => router.push("/profile/settings")}
                  className="h-10 px-5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={handleShareProfile}
                  className="h-10 w-10 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer shrink-0" 
                  aria-label="Share profile"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <RelationshipButton 
                  username={profile.username}
                  variant="default"
                  className="h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                />
                <button 
                  onClick={handleMessageClick}
                  className="h-10 px-5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-brand-cyan" />
                  Message
                </button>
                <button 
                  onClick={handleShareProfile}
                  className="h-10 w-10 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer shrink-0" 
                  aria-label="Share profile"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* SECTION 2: ADVENTURE DNA & SUMMARY */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
        <div className="lg:col-span-4 bg-white/[0.01] border border-white/12 p-6 rounded-3xl flex items-center justify-center shadow-xl">
          <div className="relative w-[300px] h-[300px] flex-shrink-0">
            <svg width="300" height="300" className="relative z-10">
              {bgGrids.map((gridVal, gridIdx) => {
                const guidePoints = dnaStats.map((_, i) => {
                  const { x, y } = getCoordinates(i, gridVal);
                  return `${x},${y}`;
                }).join(" ");
                return (
                  <polygon
                    key={gridIdx}
                    points={guidePoints}
                    className="stroke-white/5 stroke-1 fill-none"
                  />
                );
              })}

              {dnaStats.map((_, i) => {
                const { x, y } = getCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    className="stroke-white/5 stroke-[1px]"
                  />
                );
              })}

              <polygon
                points={pointsStr}
                className="fill-brand-purple/20 stroke-brand-purple stroke-[1.5px] transition-all duration-500"
              />

              {dnaStats.map((stat, i) => {
                const pos = getCoordinates(i, 118);
                const nodePos = getCoordinates(i, stat.value);
                const isHovered = activeDnaTab === i;

                return (
                  <g key={i} className="cursor-pointer">
                    <circle
                      cx={nodePos.x}
                      cy={nodePos.y}
                      r={isHovered ? 5.5 : 3.5}
                      className={`transition-all duration-200 fill-zinc-950 stroke-2 ${
                        isHovered ? "stroke-brand-cyan" : "stroke-brand-purple"
                      }`}
                      onMouseEnter={() => setActiveDnaTab(i)}
                      onMouseLeave={() => setActiveDnaTab(null)}
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      className={`text-[8px] font-mono font-bold uppercase tracking-wider transition-colors duration-200 text-center ${
                        isHovered ? "fill-brand-cyan font-black" : "fill-zinc-500"
                      }`}
                      textAnchor="middle"
                      alignmentBaseline="middle"
                    >
                      {stat.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute inset-4 rounded-full bg-brand-purple/5 blur-[50px] -z-10" />
          </div>
        </div>

        {/* Explorer Stats Card */}
        <div className="lg:col-span-8 bg-white/[0.01] border border-white/12 p-6 rounded-3xl shadow-lg flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-brand-cyan" />
              Explorer Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/12">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Reputation Score</span>
                <span className="text-2xl font-black text-white">{profile.reputationScore ?? 0}</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/12">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Level reached</span>
                <span className="text-2xl font-black text-brand-purple">Lv. {profile.level ?? 1}</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/12">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Adventures Done</span>
                <span className="text-xl font-black text-white">{profile.adventuresCompleted ?? 0}</span>
              </div>
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/12">
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Communities Joined</span>
                <span className="text-xl font-black text-white">{profile.communitiesJoined ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Highlighted Bio Section - auto stretches on desktop, normal content height on mobile */}
          <div className="lg:flex-1 min-h-[90px] bg-white/[0.02] hover:bg-white/[0.03] border border-white/10 hover:border-brand-purple/20 p-4 rounded-2xl flex flex-col justify-start gap-2 transition-all duration-300 shadow-inner">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 bg-white/5 w-fit px-2 py-0.5 rounded">Explorer Bio</span>
            <p className="text-xs text-zinc-300 font-semibold leading-relaxed">
              {profile.bio || "No bio added yet."}
            </p>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: MEMORIES */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="bg-white/[0.01] border border-white/12 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Memories</h2>
              <p className="text-xs text-zinc-400 font-medium">Shared passport snapshots and adventure journals.</p>
            </div>
            
            {/* More Button */}
            <button
              onClick={() => router.push(`/profile/memories/${profile.username}`)}
              className="h-9 px-4 rounded-xl border border-white/12 bg-white/[0.02] hover:bg-white/5 text-xs font-bold uppercase tracking-wider text-brand-cyan hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
            >
              <span>More</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {memoriesList.map((item) => (
              <div key={item.id} className="bg-white/[0.02] border border-white/12 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col h-full text-left">
                <div className="w-full h-36 overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <span className="absolute top-2.5 left-2.5 text-[8.5px] font-bold text-zinc-950 bg-brand-cyan border border-brand-cyan/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">{item.tag}</span>
                </div>
                
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 text-left">
                  <div>
                    <h3 className="text-xs font-black text-white truncate">{item.title}</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed mt-1 block line-clamp-2">{item.text}</p>
                  </div>

                  <div className="border-t border-white/5 pt-2 flex items-center justify-between text-zinc-500">
                    <span className="text-[8.5px] font-bold truncate flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-purple" /> {item.location}</span>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <button onClick={() => handleLikeMemory(item.id, item.liked)} className={`hover:text-rose-500 transition-colors p-1 cursor-pointer ${item.liked ? "text-rose-500" : ""}`} aria-label="Like memory">
                        <Heart className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <button onClick={() => handleSaveMemory(item.id, item.saved)} className={`hover:text-brand-cyan transition-colors p-1 cursor-pointer ${item.saved ? "text-brand-cyan" : ""}`} aria-label="Save memory">
                        <Bookmark className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 4: JOURNEY TIMELINE */}
      <motion.section variants={itemVariants} className="w-full">
        <div className="bg-white/[0.01] border border-white/12 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Journey</h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Completed treks, accomplishments, and milestones.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => setJourneyIndex(prev => Math.max(0, prev - 1))}
                disabled={journeyIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setJourneyIndex(prev => Math.min(Math.ceil(timelineJourney.length / 2) - 1, prev + 1))}
                disabled={journeyIndex >= Math.ceil(timelineJourney.length / 2) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <motion.div 
            key={journeyIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pl-6 sm:pl-8 border-l border-white/5 space-y-8 mt-4 py-2"
          >
            {timelineJourney.slice(journeyIndex * 2, journeyIndex * 2 + 2).map((node, i) => {
              const isAdventure = node.type === "adventure";
              const isCampfire = node.type === "campfire";
              return (
                <div key={i} className="relative group text-left">
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 h-[10px] w-[10px] sm:h-3 sm:w-3 rounded-full border bg-zinc-950 transition-all duration-300 group-hover:scale-125 ${
                    isAdventure 
                      ? "border-brand-cyan group-hover:bg-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]" 
                      : isCampfire 
                        ? "border-brand-amber group-hover:bg-brand-amber shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                        : "border-brand-purple group-hover:bg-brand-purple shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  }`} />
                  
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 block mb-0.5">{node.date}</span>
                  <h3 className="text-xs font-black text-white group-hover:text-brand-cyan transition-colors">{node.title}</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed mt-1">{node.details}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[8.5px] font-bold text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">{node.meta}</span>
                    <span className="text-[8.5px] font-black text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded tracking-widest">{node.xp}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* CONNECTIONS MODAL (FOLLOWERS / FOLLOWING) */}
      <AnimatePresence>
        {showConnectionsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowConnectionsModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Tabs Switcher */}
              <div className="flex border-b border-white/5 p-2 gap-2 mt-10">
                <button
                  onClick={() => {
                    setConnectionsActiveTab("followers");
                    setSearchQuery("");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                    connectionsActiveTab === "followers"
                      ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Followers ({followersCount})
                </button>
                <button
                  onClick={() => {
                    setConnectionsActiveTab("following");
                    setSearchQuery("");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                    connectionsActiveTab === "following"
                      ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Following ({followingCount})
                </button>
              </div>

              {/* Search input */}
              <div className="px-4 py-2 border-b border-white/5 flex items-center bg-white/[0.01]">
                <input
                  type="text"
                  placeholder={`Search ${connectionsActiveTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan/30 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors text-[10px] ml-2 font-bold uppercase shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Connections list */}
              <div className="p-4 overflow-y-auto max-h-[350px] flex flex-col gap-3">
                {isLoadingList ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="h-5 w-5 text-brand-cyan animate-spin" />
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">Loading passport graph...</span>
                  </div>
                ) : (
                  <>
                    {itemsList.map((connection) => (
                      <div
                        key={connection.userId}
                        onClick={() => {
                          setShowConnectionsModal(false);
                          setSearchQuery("");
                          router.push(`/profile/${connection.username}`);
                        }}
                        className="group bg-white/[0.02] border border-white/5 hover:border-white/15 p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CompanionAvatar
                            avatar={connection.avatarUrl}
                            name={connection.displayName}
                            className="h-10 w-10 text-sm border-2 border-white/10 group-hover:border-white/20 transition-all shadow-md"
                          />
                          <div className="min-w-0 text-left">
                            <h4 className="text-xs font-black text-white group-hover:text-brand-cyan transition-colors truncate">
                              {connection.displayName}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-mono truncate">
                              @{connection.username}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <Sparkles className="h-2.5 w-2.5 text-brand-purple" /> {calculateCompatibility(connection.username)}%
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}

                    {hasNextPage && (
                      <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNext}
                        className="w-full py-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isFetchingNext ? (
                          <Loader2 className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
                        ) : (
                          "Load More Connections"
                        )}
                      </button>
                    )}

                    {itemsList.length === 0 && (
                      <div className="text-center py-12 text-zinc-500 text-xs font-medium">
                        No connections found.
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AVATAR ZOOM MODAL */}
      <AnimatePresence>
        {zoomedAvatar && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] cursor-zoom-out"
            onClick={() => setZoomedAvatar(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-md w-full aspect-square rounded-full overflow-hidden border-4 border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={zoomedAvatar.url} 
                alt={zoomedAvatar.name} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setZoomedAvatar(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-950/80 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close zoomed view"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 px-5 py-3 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl flex items-center gap-3 z-50 text-xs text-white font-semibold text-left"
          >
            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse shrink-0" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
