"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  Clock,
  Star,
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
  ArrowRight,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Volleyball,
  Send,
  Zap,
  Volume2,
  Calendar,
  Image as ImageIcon
} from "lucide-react";

// Types
interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

interface FeedPost {
  id: string;
  type: "experience" | "quest" | "memory" | "campfire" | "community" | "achievement" | "recap";
  user: {
    name: string;
    username: string;
    avatar: string;
    level: number;
    verified: boolean;
  };
  timestamp: string;
  visibility: "Public" | "Friends" | "Community";

  // Type 1: Experience Story details
  experienceName?: string;
  location?: string;
  duration?: string;
  cost?: string;
  rating?: number;
  storyText?: string;
  images?: string[];

  // Type 2: Quest Completion details
  questName?: string;
  reward?: string;
  xpGained?: number;
  badgeIcon?: any;

  // Type 3: Memory Post details
  memoryTitle?: string;
  memoryText?: string;
  singleImage?: string;

  // Type 4: Campfire Highlight details
  campfireTopic?: string;
  campfireDuration?: string;
  campfireTakeaways?: string[];
  participantsCount?: number;
  participantsAvatars?: string[];

  // Type 5: Community Update details
  communityName?: string;
  communityBanner?: string;
  newEventTitle?: string;
  discussionHighlight?: string;
  membersJoined?: number;

  // Type 6: Achievement Unlock details
  achievementTitle?: string;
  badgeName?: string;
  badgeColor?: string;
  levelReached?: number;

  // Type 7: AI Generated Recap details
  recapDistance?: number;
  recapQuestsCount?: number;
  recapCampfiresCount?: number;
  recapBadgesCount?: number;

  // Common Interactions
  likes: number;
  commentsCount: number;
  comments: Comment[];
  hasLiked?: boolean;
  hasSaved?: boolean;
}

// Initial Feed Posts Data (Page 1)
const initialFeedPosts: FeedPost[] = [
  {
    id: "post-1",
    type: "experience",
    user: {
      name: "Arjun Mehta",
      username: "@arjun_explores",
      avatar: "A",
      level: 18,
      verified: true
    },
    timestamp: "2 hours ago",
    visibility: "Public",
    experienceName: "Gokarna Cliff Trek & Beach Camping",
    location: "Gokarna, Karnataka",
    duration: "2 Days",
    cost: "₹3,200",
    rating: 4.9,
    storyText: "Hiked from Kudle to Paradise Beach along the rugged coastline. Slept under the stars with the sound of the ocean. The gradient of the sea during sunrise was pure gold. Truly one of the best off-grid escapes in South India.",
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 84,
    commentsCount: 12,
    comments: [
      { id: "c1", user: "Rishiraj", avatar: "R", text: "Stunning shots! Did you camp on Paradise beach directly?", time: "1h ago" },
      { id: "c2", user: "Neha Sharma", avatar: "N", text: "Added this to my wishlist immediately.", time: "45m ago" }
    ],
    hasLiked: false,
    hasSaved: true
  },
  {
    id: "post-2",
    type: "quest",
    user: {
      name: "Wandercall Quests",
      username: "@quests_bot",
      avatar: "Q",
      level: 99,
      verified: true
    },
    timestamp: "4 hours ago",
    visibility: "Public",
    questName: "Western Ghats Monsoon Explorer",
    reward: "Western Ghats Badge + 200 Sparks",
    xpGained: 400,
    badgeIcon: Award,
    likes: 128,
    commentsCount: 9,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-3",
    type: "campfire",
    user: {
      name: "Kabir Dev",
      username: "@kabir_campfire",
      avatar: "K",
      level: 24,
      verified: true
    },
    timestamp: "6 hours ago",
    visibility: "Community",
    campfireTopic: "Solo Travel Hacks in North-East India",
    campfireDuration: "52 mins",
    participantsCount: 42,
    participantsAvatars: ["A", "S", "D", "R"],
    campfireTakeaways: [
      "Shared taxi loops in Sikkim are the cheapest way to navigate.",
      "ILP details for Arunachal Pradesh can now be processed online in 24 hours.",
      "Homestays are highly recommended over hotels to discover authentic tribal cuisines."
    ],
    likes: 56,
    commentsCount: 3,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-4",
    type: "recap",
    user: {
      name: "AI Travel Assistant",
      username: "@wandercall_ai",
      avatar: "AI",
      level: 10,
      verified: true
    },
    timestamp: "1 day ago",
    visibility: "Friends",
    recapDistance: 142,
    recapQuestsCount: 3,
    recapCampfiresCount: 4,
    recapBadgesCount: 1,
    likes: 94,
    commentsCount: 2,
    comments: [],
    hasLiked: false,
    hasSaved: false
  }
];

// Additional Posts Data to simulate infinite scrolling (Page 2)
const page2Posts: FeedPost[] = [
  {
    id: "post-5",
    type: "memory",
    user: {
      name: "Sarah Jenkins",
      username: "@sarah_wander",
      avatar: "S",
      level: 14,
      verified: false
    },
    timestamp: "1 day ago",
    visibility: "Public",
    memoryTitle: "Golden Hour at Kudle Beach",
    memoryText: "No agenda, no laptop, just watching the waves dissolve into the sand. This is my absolute happy place. Golden hour in Gokarna has a different vibe altogether.",
    singleImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    likes: 47,
    commentsCount: 4,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-6",
    type: "community",
    user: {
      name: "Wandercall Community",
      username: "@community_hub",
      avatar: "C",
      level: 80,
      verified: true
    },
    timestamp: "2 days ago",
    visibility: "Public",
    communityName: "Himalayan Trekkers Club",
    communityBanner: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    newEventTitle: "Hampta Pass Monsoon Prep Meetup",
    discussionHighlight: "Altitude sickness prevention guidelines & heavy rain gear comparisons",
    membersJoined: 24,
    likes: 110,
    commentsCount: 8,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-7",
    type: "achievement",
    user: {
      name: "Rishiraj",
      username: "@rishi005",
      avatar: "R",
      level: 12,
      verified: true
    },
    timestamp: "3 days ago",
    visibility: "Public",
    achievementTitle: "Unlocked 'Thrill Seeker Level 3' Badge",
    badgeName: "Thrill Seeker",
    badgeColor: "from-cyan-500 to-blue-600",
    levelReached: 12,
    likes: 215,
    commentsCount: 15,
    comments: [
      { id: "ca1", user: "Arjun Mehta", avatar: "A", text: "Massive level up mate! Congrats!", time: "2d ago" }
    ],
    hasLiked: false,
    hasSaved: false
  }
];

export default function ExplorerFeedPage() {
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Trending");
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState<"story" | "campfire" | "memory">("story");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Comments toggles
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  // Confetti / Celebration states
  const [celebrationOverlay, setCelebrationOverlay] = useState(false);
  const [celebratedTitle, setCelebratedTitle] = useState("");

  // Reference for intersection observer scroll detector
  const loaderRef = useRef<HTMLDivElement>(null);

  // Filters Options
  const filters = ["All", "Following", "Communities", "Experiences", "Achievements", "Campfires", "Quests", "Memories", "Trending", "Nearby"];

  // Sort Options
  const sortOptions = ["Trending", "Latest", "Popular", "Recommended", "AI Curated", "Friends"];

  // Filtered and Sorted Posts
  const processedPosts = useMemo(() => {
    let result = [...feedPosts];

    // Filter
    if (activeFilter !== "All") {
      if (activeFilter === "Communities") {
        result = result.filter(p => p.type === "community");
      } else if (activeFilter === "Experiences") {
        result = result.filter(p => p.type === "experience");
      } else if (activeFilter === "Achievements") {
        result = result.filter(p => p.type === "achievement");
      } else if (activeFilter === "Campfires") {
        result = result.filter(p => p.type === "campfire");
      } else if (activeFilter === "Quests") {
        result = result.filter(p => p.type === "quest");
      } else if (activeFilter === "Memories") {
        result = result.filter(p => p.type === "memory" || p.type === "experience");
      } else if (activeFilter === "Trending") {
        result = result.sort((a, b) => b.likes - a.likes);
      }
    }

    // Sort
    if (activeSort === "Latest") {
      // In a real app we'd sort by date, for mock data we keep current list order reversed
    } else if (activeSort === "Popular") {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [feedPosts, activeFilter, activeSort]);

  // AI Summary stats
  const aiRecapSummary = {
    adventures: 42,
    badges: 18,
    campfires: 6
  };

  // Handle post creation
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const newPostId = `custom-post-${Date.now()}`;
    let newPost: FeedPost;

    if (postType === "campfire") {
      newPost = {
        id: newPostId,
        type: "campfire",
        user: {
          name: "Rishiraj",
          username: "@rishi005",
          avatar: "R",
          level: 12,
          verified: true
        },
        timestamp: "Just now",
        visibility: "Public",
        campfireTopic: postText,
        campfireDuration: "Scheduled",
        participantsCount: 1,
        participantsAvatars: ["R"],
        campfireTakeaways: [
          "Host has started this campfire discussion.",
          "Live audio will commence shortly. Join the queue."
        ],
        likes: 1,
        commentsCount: 0,
        comments: []
      };
    } else if (postType === "memory") {
      newPost = {
        id: newPostId,
        type: "memory",
        user: {
          name: "Rishiraj",
          username: "@rishi005",
          avatar: "R",
          level: 12,
          verified: true
        },
        timestamp: "Just now",
        visibility: "Public",
        memoryTitle: "Shared a new Memory",
        memoryText: postText,
        singleImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop",
        likes: 1,
        commentsCount: 0,
        comments: []
      };
    } else {
      newPost = {
        id: newPostId,
        type: "experience",
        user: {
          name: "Rishiraj",
          username: "@rishi005",
          avatar: "R",
          level: 12,
          verified: true
        },
        timestamp: "Just now",
        visibility: "Public",
        experienceName: "Exploring Local Wilderness",
        location: "Outdoors",
        duration: "1 Day",
        cost: "Free",
        rating: 5.0,
        storyText: postText,
        images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"],
        likes: 1,
        commentsCount: 0,
        comments: []
      };
    }

    setFeedPosts(prev => [newPost, ...prev]);
    setPostText("");
    triggerToast("Adventure story posted successfully!");
  };

  // Toast notifier
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle Like
  const handleLike = (postId: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked,
          likes: hasLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  // Toggle Save
  const handleSave = (postId: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const hasSaved = !post.hasSaved;
        if (hasSaved) {
          triggerToast("Added to experience wishlist!");
        }
        return { ...post, hasSaved };
      }
      return post;
    }));
  };

  // Trigger celebration particle overlay
  const handleCelebrate = (title: string) => {
    setCelebratedTitle(title);
    setCelebrationOverlay(true);
    setTimeout(() => {
      setCelebrationOverlay(false);
    }, 4000);
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newComment = {
          id: `comment-${Date.now()}`,
          user: "Rishiraj",
          avatar: "R",
          text: commentInput,
          time: "Just now"
        };
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));

    setCommentInput("");
  };

  // Infinite Scroll Simulated Loading
  useEffect(() => {
    if (page >= 2 || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setFeedPosts(prev => [...prev, ...page2Posts]);
          setPage(2);
          setIsLoading(false);
          setHasMore(false); // only 2 pages for mock
        }, 1500);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, isLoading, hasMore]);

  // Split posts into 2 columns for masonry layout on desktop
  const leftColumnPosts = processedPosts.filter((_, idx) => idx % 2 === 0);
  const rightColumnPosts = processedPosts.filter((_, idx) => idx % 2 === 1);

  const renderPostCard = (post: FeedPost) => {
    const UserIcon = post.user.avatar;
    const isRishiraj = post.user.name === "Rishiraj";

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col gap-4 text-left shadow-lg hover:border-white/10 transition-all duration-300 relative overflow-hidden group w-full"
      >
        
        {/* CARD HEADER */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shrink-0">
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white">
                {UserIcon}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{post.user.name}</span>
                {post.user.verified && (
                  <span className="h-3.5 w-3.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                )}
                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-md">Lv.{post.user.level}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                <span>{post.timestamp}</span>
                <span>•</span>
                <span>{post.visibility}</span>
              </div>
            </div>
          </div>
          
          <button className="p-1 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer">
            <Volume2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* CARD BODY (ADAPTIVE TYPE RENDER) */}
        <div className="w-full">
          
          {/* TYPE 1: EXPERIENCE STORY */}
          {post.type === "experience" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Experience Story
                </span>
                <h2 className="text-base font-black text-white">{post.experienceName}</h2>
              </div>
              
              {/* Image Carousel/Gallery Grid */}
              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden relative border border-white/5 max-h-[220px]">
                  {post.images.map((img, idx) => (
                    <div key={idx} className="h-[220px] relative overflow-hidden">
                      <img src={img} alt="Adventure scene" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}

              {/* Travel details meta */}
              <div className="grid grid-cols-3 gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-[10px] font-semibold text-zinc-400">
                <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> {post.location}</span>
                <span className="flex items-center gap-1.5 truncate"><Clock className="h-3.5 w-3.5 text-brand-purple shrink-0" /> {post.duration}</span>
                <span className="flex items-center gap-1.5 truncate"><Star className="h-3.5 w-3.5 text-brand-amber shrink-0" /> {post.rating} / 5.0</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-medium mt-1">
                {post.storyText}
              </p>
              
              {/* Book CTA */}
              <button 
                onClick={() => triggerToast("Booking experience module...")}
                className="mt-2 w-full h-10 rounded-xl bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Zap className="h-4 w-4" /> Try This Experience {post.cost && `(${post.cost})`}
              </button>
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
                  <h2 className="text-base font-black text-white mt-1">{post.questName}</h2>
                </div>
              </div>

              <div className="mt-1 flex flex-wrap gap-2 text-xs font-mono font-bold text-brand-cyan">
                <span className="bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-xl">Reward: {post.reward}</span>
                <span className="bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-xl text-brand-purple">XP: +{post.xpGained}</span>
              </div>

              <button 
                onClick={() => handleCelebrate(post.questName || "Quest Complete")}
                className="mt-2 w-full h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="h-4 w-4 text-brand-amber" /> Celebrate Achievement
              </button>
            </div>
          )}

          {/* TYPE 3: MEMORY POST */}
          {post.type === "memory" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Memory Journal
                </span>
                <h2 className="text-base font-black text-white">{post.memoryTitle}</h2>
              </div>
              
              {post.singleImage && (
                <div className="w-full h-56 rounded-2xl overflow-hidden border border-white/5 relative">
                  <img src={post.singleImage} alt="Memory scene" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                </div>
              )}

              <p className="text-xs text-zinc-300 leading-relaxed font-medium italic pl-3 border-l border-brand-purple/30">
                "{post.memoryText}"
              </p>
            </div>
          )}

          {/* TYPE 4: CAMPFIRE HIGHLIGHT */}
          {post.type === "campfire" && (
            <div className="flex flex-col gap-3 bg-zinc-950/30 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Campfire Highlight
                  </span>
                  <h2 className="text-sm font-black text-white mt-1.5">{post.campfireTopic}</h2>
                </div>
                
                {/* Live participant overlap avatars */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  {post.participantsAvatars?.map((av, idx) => (
                    <div key={idx} className="h-6 w-6 rounded-full border border-zinc-950 bg-zinc-900 flex items-center justify-center font-black text-[9px] text-white">
                      {av}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Key takeaways */}
              <div className="mt-2 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-purple">AI Voice Summary</span>
                {post.campfireTakeaways?.map((takeaway, idx) => (
                  <p key={idx} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0 mt-1.5" />
                    {takeaway}
                  </p>
                ))}
              </div>

              <button 
                onClick={() => triggerToast("Connecting to live campfire room...")}
                className="mt-2 w-full h-9 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:bg-brand-purple/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="h-4 w-4 animate-pulse" /> Join Similar Room ({post.campfireDuration})
              </button>
            </div>
          )}

          {/* TYPE 5: COMMUNITY UPDATE */}
          {post.type === "community" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Community Update
                </span>
                <h2 className="text-base font-black text-white">{post.communityName}</h2>
              </div>

              {post.communityBanner && (
                <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/5 relative shadow-inner">
                  <img src={post.communityBanner} alt="Community Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs flex flex-col gap-2">
                <p className="text-zinc-300 font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-emerald shrink-0" />
                  Meetup: {post.newEventTitle}
                </p>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed pl-4">
                  Discussion: {post.discussionHighlight}
                </p>
              </div>

              <button 
                onClick={() => triggerToast("Joined Trekking Community!")}
                className="mt-1 w-full h-9 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald font-bold text-xs uppercase tracking-wider hover:bg-brand-emerald/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4" /> Join Community (+{post.membersJoined} members)
              </button>
            </div>
          )}

          {/* TYPE 6: ACHIEVEMENT UNLOCK */}
          {post.type === "achievement" && (
            <div className="flex flex-col gap-4 bg-gradient-to-tr from-brand-purple/5 via-transparent to-transparent p-5 rounded-2xl border border-brand-purple/10 items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shadow-2xl animate-pulse">
                <div className="h-full w-full rounded-2xl bg-zinc-900 flex items-center justify-center text-brand-cyan border border-white/10">
                  <Award className="h-8 w-8 text-brand-cyan" />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Achievement Unlocked
                </span>
                <h2 className="text-lg font-black text-white mt-2">{post.achievementTitle}</h2>
                <p className="text-xs text-zinc-500 font-semibold mt-1">Level {post.levelReached} passport credentials reached globally.</p>
              </div>

              <button 
                onClick={() => handleCelebrate(post.achievementTitle || "Level Up")}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="h-4 w-4 text-brand-purple" /> Celebrate Level Up
              </button>
            </div>
          )}

          {/* TYPE 7: AI GENERATED RECAP */}
          {post.type === "recap" && (
            <div className="flex flex-col gap-3 bg-gradient-to-br from-brand-indigo/5 to-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10">
              <div className="flex items-center gap-2 text-brand-purple">
                <span className="text-xs font-black uppercase tracking-wider">Weekly AI Explorer Recap</span>
              </div>
              
              <p className="text-xs text-zinc-400 font-medium">
                Here is your verified network activity for the week of June 16 - June 22:
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-white">{post.recapDistance} km</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Distance Covered</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-cyan">+{post.recapQuestsCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Quests Completed</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-purple">+{post.recapCampfiresCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Campfires Attended</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-amber">+{post.recapBadgesCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Medals Earned</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* CARD FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-500 font-bold uppercase tracking-wider w-full">
          <button 
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              post.hasLiked ? "text-brand-cyan" : "hover:text-zinc-300"
            }`}
            aria-label="Like post"
          >
            <Heart className={`h-4.5 w-4.5 ${post.hasLiked ? "fill-brand-cyan text-brand-cyan" : ""}`} />
            <span>{post.likes}</span>
          </button>
          
          <button 
            onClick={() => setExpandedCommentsId(expandedCommentsId === post.id ? null : post.id)}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Toggle comments"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>{post.commentsCount}</span>
          </button>
          
          <button 
            onClick={() => handleSave(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${
              post.hasSaved ? "text-brand-purple" : "hover:text-zinc-300"
            }`}
            aria-label="Save post"
          >
            <Bookmark className={`h-4.5 w-4.5 ${post.hasSaved ? "fill-brand-purple text-brand-purple" : ""}`} />
            <span>Save</span>
          </button>
          
          <button 
            onClick={() => triggerToast("Link copied to clipboard!")}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="h-4.5 w-4.5" />
            <span>Share</span>
          </button>
        </div>

        {/* EXPANDED COMMENTS SECTION */}
        {expandedCommentsId === post.id && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-2">
              {post.comments.map(c => (
                <div key={c.id} className="flex gap-2.5 items-start text-xs bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                  <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-black text-[9px] text-white shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-zinc-300">{c.user} <span className="text-[8px] font-mono text-zinc-600 font-bold ml-1">{c.time}</span></span>
                    <p className="text-zinc-400 font-medium mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-zinc-300 focus:border-white/10"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="h-8 w-8 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-none relative flex flex-col gap-6 overflow-y-visible">
      
      {/* HEADER PANEL */}
      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full">
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
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
              const el = document.getElementById("create-post-card");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-8 px-3 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-indigo/10"
          >
            <Plus className="h-3.5 w-3.5" /> Create Post
          </button>
        </div>

        {/* Filters List */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-2 px-2 scroll-smooth">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                activeFilter === filter
                  ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-black"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* AI FEED INSIGHTS CARD */}
      <div className="bg-gradient-to-r from-brand-indigo/5 to-brand-purple/5 border border-brand-purple/10 p-4 rounded-3xl flex items-center gap-4 text-left shadow-lg relative overflow-hidden group w-full">
        <div className="h-10 w-10 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-purple">AI Summary Recap</span>
          <p className="text-xs text-zinc-300 font-semibold leading-relaxed mt-0.5">
            Today your network completed <span className="text-brand-cyan font-black">{aiRecapSummary.adventures}</span> adventures, unlocked <span className="text-brand-amber font-black">{aiRecapSummary.badges}</span> badges, and completed 6 key milestones.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>

      {/* CREATE POST CARD */}
      <div id="create-post-card" className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full">
        <div className="flex gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shrink-0">
            <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white">
              R
            </div>
          </div>
          <form onSubmit={handleCreatePost} className="flex-1 flex flex-col gap-3">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder={
                postType === "story" ? "What adventure did you book or explore today?" :
                postType === "campfire" ? "Enter a topic for your live campfire discussion..." :
                "Write about a travel memory from the trail..."
              }
              className="w-full min-h-[70px] bg-transparent border-none text-xs text-zinc-200 outline-none resize-none font-medium placeholder-zinc-500"
            />
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              {/* Select post type */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPostType("story")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                    postType === "story" ? "bg-white/5 border-white/10 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Story
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("campfire")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                    postType === "campfire" ? "bg-white/5 border-white/10 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Campfire
                </button>
                <button
                  type="button"
                  onClick={() => setPostType("memory")}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                    postType === "memory" ? "bg-white/5 border-white/10 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Memory
                </button>
              </div>

              <button
                type="submit"
                disabled={!postText.trim()}
                className="h-8 px-4 rounded-lg bg-white text-zinc-950 font-bold text-[10px] uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                Post <Send className="h-3 w-3" />
              </button>
            </div>
          </form>
        </div>
        
        {/* Quick actions buttons grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 pt-3 border-t border-white/5">
          <button 
            type="button"
            onClick={() => { setPostType("memory"); setPostText("Sunset camping in Coorg hills"); }}
            className="py-1.5 px-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-[9px] text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
          >
            <Camera className="h-3.5 w-3.5 text-brand-cyan" /> Share Memory
          </button>
          <button 
            type="button"
            onClick={() => { setPostType("story"); setPostText("Explored Netrani Deep Sea Scuba Diving"); }}
            className="py-1.5 px-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-[9px] text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
          >
            <Compass className="h-3.5 w-3.5 text-brand-indigo" /> Share Adventure
          </button>
          <button 
            type="button"
            onClick={() => { handleCelebrate("Monsoon Western Ghats Explorer Quest"); }}
            className="py-1.5 px-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-[9px] text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
          >
            <Award className="h-3.5 w-3.5 text-brand-amber" /> Complete Quest
          </button>
          <button 
            type="button"
            onClick={() => { setPostType("campfire"); setPostText("Backpacking Loops in North Sikkim homestays"); }}
            className="py-1.5 px-2.5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-[9px] text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase tracking-wider"
          >
            <Radio className="h-3.5 w-3.5 text-brand-purple" /> Host Campfire
          </button>
        </div>
      </div>

      {/* Mobile Layout (chronological single column) */}
      <div className="flex flex-col gap-6 md:hidden w-full">
        <AnimatePresence mode="popLayout">
          {processedPosts.map((post) => renderPostCard(post))}
        </AnimatePresence>
      </div>

      {/* Desktop Layout (Masonry side-by-side columns) */}
      <div className="hidden md:grid grid-cols-2 gap-6 items-start w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {leftColumnPosts.map((post) => renderPostCard(post))}
          </AnimatePresence>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {rightColumnPosts.map((post) => renderPostCard(post))}
          </AnimatePresence>
        </div>
      </div>

      {/* INFINITE SCROLL SKELETON LOADERS SIMULATION */}
      {hasMore && (
        <div ref={loaderRef} className="py-6 w-full">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Skeleton Card 1 */}
              <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
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
              {/* Skeleton Card 2 */}
              <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
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
            </div>
          )}
        </div>
      )}

      {!hasMore && (
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
            {/* Particle simulation items floating up */}
            {[...Array(20)].map((_, i) => {
              const left = `${Math.random() * 100}%`;
              const delay = `${Math.random() * 2}s`;
              const duration = `${Math.random() * 2 + 2}s`;
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

            {/* Glowing Trophy Card popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="bg-zinc-900/90 border border-brand-purple/30 p-6 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-xs relative pointer-events-auto backdrop-blur-xl"
            >
              <div className="h-14 w-14 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-cyan mb-3">
                <Sparkles className="h-7 w-7 text-brand-cyan animate-spin-slow" />
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

    </div>
  );
}

// Mock live campfire topics
const liveCampfires = [
  { topic: "Paragliding safety checklist in Bir Billing", host: "Captain Rohit", listeners: 42 },
  { topic: "Cheapest homestay loops in Sikkim valley routes", host: "Neha Sharma", listeners: 28 }
];
