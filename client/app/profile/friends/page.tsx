'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useFriends, usePendingIncoming, usePendingOutgoing, useFollowBackMutation, useRejectRequestMutation, useCancelRequestMutation, useFavorites, useAddFavoriteMutation, useRemoveFavoriteMutation } from '@/hooks/api/useFriends';
import { useBlockedUsers, useBlockMutation, useUnblockMutation } from '@/hooks/api/usePrivacy';
import { useUserProfileQuery } from '@/hooks/api/useUserQueries';
import { useDebounce } from '@/hooks/useDebounce';
import { useChatConversation } from '@/hooks/api/useChatConversation';
import { useChatInbox, formatMessagePreview, formatInboxTime } from '@/hooks/api/useChatInbox';
import { useAppSelector } from '@/lib/store/store';
import { getMessageRenderer } from '@/components/chat/renderers/registry';
import {
  Users,
  Heart,
  Award,
  Activity,
  UserPlus,
  ShieldAlert,
  Sparkles,
  Clock,
  Radio,
  Search,
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Send,
  MapPin,
  Mic,
  Image as ImageIcon,
  Compass,
  Bookmark,
  Trash2,
  Share2,
  Calendar,
  Plus,
  Check,
  X,
  VolumeX,
  Flag,
  EyeOff,
  Info,
  ChevronRight,
  ChevronLeft,
  Flame,
  Play,
  Pause
} from "lucide-react";

// ==========================================
// Mock Data Definition
// ==========================================

interface CompanionProps {
  id: string;
}

interface CompanionAvatarProps {
  avatar: string;
  name: string;
  className?: string;
}

function CompanionAvatar({ avatar, name, className = "h-8 w-8 text-xs" }: CompanionAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const isUrl = avatar && (avatar.startsWith("http://") || avatar.startsWith("https://") || avatar.startsWith("/"));

  const getHashColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30",
      "bg-brand-purple/20 text-brand-purple border border-brand-purple/30",
      "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30",
      "bg-brand-amber/20 text-brand-amber border border-brand-amber/30",
      "bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30"
    ];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = name ? name.trim().charAt(0).toUpperCase() : "?";

  if (isUrl && !hasError) {
    return (
      <img
        src={avatar}
        alt={name}
        onError={() => setHasError(true)}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold shrink-0 select-none ${getHashColor(
        name
      )}`}
    >
      {initials}
    </div>
  );
}

const DEFAULT_CAMPFIRES = [
  {
    id: "camp-himalayas",
    title: "Under the Himalayan Stars",
    hostName: "Tenzing N.",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    category: "Adventure",
    isPrivate: false
  },
  {
    id: "camp-penang",
    title: "Street Food Secrets of Penang",
    hostName: "Mei Ling",
    hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    category: "Food",
    isPrivate: false
  },
  {
    id: "camp-backpacking",
    title: "Solo Backpacking Europe 101",
    hostName: "Lucas Green",
    hostAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    category: "Travel",
    isPrivate: true
  },
  {
    id: "hosted-1",
    title: "Alpine Winter Gear Choices",
    hostName: "You",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    category: "Adventure",
    isPrivate: false
  },
  {
    id: "hosted-2",
    title: "Vlog Sound Design Masterclass",
    hostName: "You",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    category: "Storytelling",
    isPrivate: false
  }
];

interface Companion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "Available" | "In Campfire" | "Exploring" | "Hosting" | "Offline" | "Busy";
  compatibility: number;
  sharedDNA: "Explorer" | "Creative" | "Learner" | "Storyteller";
  mutualExperiences: number;
  mutualCommunities: number;
  bio: string;
  location: string;
  tags: string[];
  isFavorite: boolean;
  isAdventurePartner: boolean;
  lastActive: string;
}

const SUGGESTED_EXPLORERS = [
  {
    id: "s-1",
    name: "Aria Sharma",
    username: "@aria_s",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    compatibility: 95,
    sharedDNA: "Explorer",
    reason: "You both joined 6 adventure communities and completed 4 identical trek quests."
  },
  {
    id: "s-2",
    name: "Kabir Mehta",
    username: "@kabir_m",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    compatibility: 89,
    sharedDNA: "Learner",
    reason: "Attended the same campfire 'Summiting Mount Everest Solo' and maps cycling routes."
  },
  {
    id: "s-3",
    name: "Zoe Chen",
    username: "@zoe_c",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    compatibility: 87,
    sharedDNA: "Creative",
    reason: "Shares interest in twilight photography and has 12 mutual explorer connections."
  }
];

const ACTIVITY_FEED = [
  { id: "a-1", friendName: "Arjun Mehta", avatar: "🏔️", text: "completed Coorg Coffee Estate Trek", time: "10m ago", icon: Award, color: "text-brand-cyan" },
  { id: "a-2", friendName: "Divya Kapoor", avatar: "🖋️", text: "started hosting a voice room: 'Himalayan Echoes'", time: "45m ago", icon: Radio, color: "text-brand-amber animate-pulse" },
  { id: "a-3", friendName: "Sara Khan", avatar: "📸", text: "shared a new twilight photography memory card", time: "2h ago", icon: ImageIcon, color: "text-brand-purple" },
  { id: "a-4", friendName: "Karan Johar", avatar: "🎒", text: "joined Western Ghats Backpackers community", time: "4h ago", icon: Users, color: "text-brand-emerald" }
];

// Messages dictionary by friend ID
const INITIAL_MESSAGES: Record<string, any[]> = {
  "f-1": [
    { id: "m-1", sender: "friend", text: "Hey! Are you heading to Coorg this weekend? The coffee estate trails are fully open.", type: "text", timestamp: "10:24 AM" },
    { id: "m-2", sender: "me", text: "Yes! Planning a 14km loop through the valleys. The weather looks perfect.", type: "text", timestamp: "10:26 AM" },
    {
      id: "m-3",
      sender: "friend",
      type: "experience",
      timestamp: "10:28 AM",
      metadata: {
        title: "Western Ghats Ridge Walk",
        host: "Tenzing N.",
        date: "Tomorrow at 8:00 AM",
        category: "Adventure",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop"
      }
    },
    { id: "m-4", sender: "friend", text: "Here is the audio description of the steep ridge sections. Check this out:", type: "text", timestamp: "10:29 AM" },
    { id: "m-5", sender: "friend", type: "audio", timestamp: "10:29 AM", metadata: { duration: "0:42", waves: [20, 45, 15, 60, 80, 25, 40, 70, 95, 30, 50, 10] } },
    {
      id: "m-6",
      sender: "me",
      type: "plan",
      timestamp: "10:31 AM",
      metadata: {
        title: "Weekend Coorg Ridge Trek",
        date: "June 27-28",
        location: "Kakkabe, Coorg",
        companions: ["Rishiraj", "Arjun Mehta"],
        status: "Planning"
      }
    }
  ],
  "f-2": [
    { id: "m2-1", sender: "friend", text: "Hey Rishiraj, did you check the twilight photography guidelines I posted?", type: "text", timestamp: "Yesterday" },
    { id: "m2-2", sender: "me", text: "Yes! Loved the exposure timings guide. Planning to try it next week.", type: "text", timestamp: "Yesterday" }
  ]
};

// ==========================================
// Custom Hook for Nesting Lenis Scroll Containers
// ==========================================
function AudioMessagePlayer({ duration }: { duration: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Parse duration "0:42" to 42 seconds
  const totalSeconds = useMemo(() => {
    const parts = duration.split(":");
    const minutes = parseInt(parts[0] || "0", 10);
    const seconds = parseInt(parts[1] || "0", 10);
    return minutes * 60 + seconds || 10;
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalSeconds) {
            setIsPlaying(false);
            setProgress(100);
            return totalSeconds;
          }
          setProgress((next / totalSeconds) * 100);
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalSeconds]);

  const handlePlayToggle = () => {
    if (currentTime >= totalSeconds) {
      setCurrentTime(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-3 w-64">
      <button
        onClick={handlePlayToggle}
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all ${
          isPlaying
            ? "bg-rose-500/10 text-rose-450 border border-rose-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
            : "bg-brand-cyan text-zinc-950 shadow-md shadow-brand-cyan/10"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" />
        )}
      </button>

      <div className="flex-1 h-6 relative flex items-center overflow-hidden select-none">
        {isPlaying ? (
          <>
            {/* Background Wave - Unplayed (Zinc-800) */}
            <svg
              viewBox="0 0 300 24"
              className="absolute left-0 w-[300px] h-full text-zinc-800 pointer-events-none"
            >
              <path
                d="M 0 12 Q 10 2, 20 12 T 40 12 T 60 12 T 80 12 T 100 12 T 120 12 T 140 12 T 160 12 T 180 12 T 200 12 T 220 12 T 240 12 T 260 12 T 280 12 T 300 12 T 320 12 T 340 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-snake-wave"
              />
            </svg>

            {/* Foreground Wave - Played (Cyan) */}
            <div
              className="absolute left-0 h-full overflow-hidden pointer-events-none"
              style={{ width: `${progress}%` }}
            >
              <svg
                viewBox="0 0 300 24"
                className="w-[300px] h-full text-brand-cyan"
              >
                <path
                  d="M 0 12 Q 10 2, 20 12 T 40 12 T 60 12 T 80 12 T 100 12 T 120 12 T 140 12 T 160 12 T 180 12 T 200 12 T 220 12 T 240 12 T 260 12 T 280 12 T 300 12 T 320 12 T 340 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-snake-wave"
                />
              </svg>
            </div>
          </>
        ) : (
          <>
            {/* Background Flat Line - Unplayed */}
            <div className="absolute left-0 right-0 h-0.5 bg-zinc-800 rounded-full" />
            
            {/* Foreground Flat Line - Played */}
            <div
              className="absolute left-0 h-0.5 bg-brand-cyan rounded-full"
              style={{ width: `${progress}%` }}
            />
          </>
        )}
      </div>

      <span className="text-[9px] font-mono text-zinc-500 shrink-0 select-none">
        {isPlaying ? formatTime(currentTime) : duration}
      </span>
    </div>
  );
}

function useNestedScroll() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);

  const ref = useMemo(() => {
    let internalVal: HTMLDivElement | null = null;
    return {
      get current() {
        return internalVal;
      },
      set current(node: HTMLDivElement | null) {
        internalVal = node;
        setEl(node);
      }
    };
  }, []) as React.MutableRefObject<HTMLDivElement | null>;

  useEffect(() => {
    if (!el) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const delta = e.deltaY;

      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1.5;
      const isAtTop = scrollTop <= 1.5;

      if (delta > 0 && !isAtBottom) {
        e.stopPropagation();
      } else if (delta < 0 && !isAtTop) {
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY; // positive means scrolling down

      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1.5;
      const isAtTop = scrollTop <= 1.5;

      if (deltaY > 0 && !isAtBottom) {
        e.stopPropagation();
      } else if (deltaY < 0 && !isAtTop) {
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: true });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [el]);

  return ref;
}

// Helper to generate dynamic, unique icebreaker prompts based on companion profile details
function getIcebreakers(friend: Companion) {
  const name = friend.name.split(" ")[0];
  const tags = friend.tags || [];
  
  const baseIcebreakers = [
    `Hey ${name}, let's align our coordinate maps and plan an adventure! 🧭`,
    `Saw you share my adventure DNA! Up for a quick chat? 🎒`,
  ];
  
  if (tags.some(t => ["Surfing", "Scuba", "Conservation"].includes(t))) {
    return [
      `Hey ${name}, up for hitting the waves or a beach dive sometime? 🌊`,
      `Saw you do marine/surf activities. What's your favorite coastal spot? 🏄‍♂️`,
      ...baseIcebreakers
    ].slice(0, 3);
  }
  
  if (tags.some(t => ["High Altitude", "Trekking", "Forestry"].includes(t))) {
    return [
      `Hey ${name}, are you planning any steep treks or peak climbs soon? 🏔️`,
      `I'd love to join you on one of those wilderness trail explorations! 🌲`,
      ...baseIcebreakers
    ].slice(0, 3);
  }

  if (tags.some(t => ["Astro Photo", "Creative", "Journaling"].includes(t))) {
    return [
      `Hey ${name}, what gear do you use for twilight photography and stargazing? 📸`,
      `Let's sync up for a stargazing field trip sometime! 🌌`,
      ...baseIcebreakers
    ].slice(0, 3);
  }

  return [
    `Hey ${name}, let's align our coordinate grids and start planning! 🗺️`,
    `Saw you're active nearby! What community quests are you doing? 💎`,
    `Up for joining a campfire room or planning a trek together? ⛺`
  ];
}

// ==========================================
// Component Implementation
// ==========================================

interface FriendsPageProps {
  activeChatId?: string;
}

export default function FriendsPage({ activeChatId }: FriendsPageProps = {}) {
  const companionListRef = useNestedScroll();
  const chatStreamRef = useNestedScroll();
  const pendingViewRef = useNestedScroll();
  const blockedViewRef = useNestedScroll();
  const suggestedViewRef = useNestedScroll();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const { getInboxState, totalUnread, sortedByRecent } = useChatInbox(currentUserId);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [campfireList, setCampfireList] = useState<any[]>(DEFAULT_CAMPFIRES);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wandercall_hosted_campfires");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCampfireList(prev => {
              const ids = new Set(prev.map(c => c.id));
              const filteredParsed = parsed.map(c => ({
                id: c.id,
                title: c.title,
                hostName: c.hostName || "You",
                hostAvatar: c.hostAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                category: c.category || "Adventure",
                isPrivate: c.isPrivate || false
              })).filter(c => !ids.has(c.id));
              return [...prev, ...filteredParsed];
            });
          }
        } catch (e) {
          console.error("Error parsing wandercall_hosted_campfires", e);
        }
      }
    }
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "favorites" | "partners" | "online" | "pending" | "blocked" | "suggested" | "recent"
  >("all");

  const initialFriendId = useMemo(() => {
    if (!activeChatId) return null;
    const decoded = decodeURIComponent(activeChatId);
    const normalized = decoded.replace(/\s+/g, "-").replace(/_/g, "-");
    const cleanId = normalized.startsWith("chat:") ? normalized.substring(5) : normalized;
    return cleanId; // Return raw ID, allow dynamic resolution
  }, [activeChatId]);

  const [activeFriendId, setActiveFriendId] = useState<string | null>(initialFriendId);

  useEffect(() => {
    setActiveFriendId(initialFriendId);
  }, [initialFriendId]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileView, setActiveMobileView] = useState<"rail" | "chat" | "inspector">("rail");

  // API state
  const { data: friendsData } = useFriends(100, searchQuery);
  const { data: incomingData } = usePendingIncoming(100, searchQuery);
  const { data: outgoingData } = usePendingOutgoing(100, searchQuery);
  const { data: favoritesData } = useFavorites();
  const { data: blockedData } = useBlockedUsers(20);
  const { data: targetProfileData } = useUserProfileQuery(activeFriendId);

  const followBackMutation = useFollowBackMutation();
  const rejectRequestMutation = useRejectRequestMutation();
  const cancelRequestMutation = useCancelRequestMutation();
  const addFavoriteMutation = useAddFavoriteMutation();
  const removeFavoriteMutation = useRemoveFavoriteMutation();
  const blockMutation = useBlockMutation();
  const unblockMutation = useUnblockMutation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const blockedUsers = useMemo(() => {
    if (!blockedData) return [];
    return blockedData.pages.flatMap(page => page.items || []).map(b => ({
      id: b.targetUserId,
      name: b.targetUser?.displayName || b.targetUser?.username || b.targetUserId || 'Unknown User',
      avatar: b.targetUser?.avatarUrl || '',
      blockedDate: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Recently',
      blockedAt: b.createdAt ? `Blocked ${new Date(b.createdAt).toLocaleDateString()}` : 'Blocked recently',
      reason: b.reason || "No reason specified",
      username: b.targetUser?.username ? `@${b.targetUser.username}` : ''
    }));
  }, [blockedData]);

  const blockedIds = useMemo(() => new Set(blockedUsers.map(b => b.id)), [blockedUsers]);

  const companions = useMemo(() => {
    if (!friendsData) return [];
    const favList = favoritesData?.pages?.flatMap(p => p) || [];
    const baseList = friendsData.pages.flatMap(page => page.items)
      .filter(f => !blockedIds.has(f.userId))
      .map(f => ({
        id: f.userId,
        name: f.displayName || f.username || 'Unknown User',
        username: f.username ? `@${f.username}` : '',
        avatar: f.avatarUrl || '',
        status: "Available" as any,
        compatibility: f.compatibility || 90,
        sharedDNA: "Explorer" as any,
        mutualExperiences: 0,
        mutualCommunities: 0,
        bio: (f as any).bio || "An explorer on Wandercall.",
        location: (f as any).locationFormatted || "Earth",
        tags: ["Explorer"],
        isFavorite: favList.some((fav: any) => fav.friendId === f.userId || fav.userId === f.userId || fav.id === f.userId),
        isAdventurePartner: false,
        lastActive: "Active now"
      }));

    if (activeFriendId && !baseList.some(c => c.id === activeFriendId || c.username === `@${activeFriendId}` || c.username === activeFriendId)) {
      if (targetProfileData && (targetProfileData.userId === activeFriendId || targetProfileData.username === activeFriendId || `@${targetProfileData.username}` === activeFriendId)) {
        baseList.unshift({
          id: targetProfileData.userId,
          name: targetProfileData.displayName || targetProfileData.username || 'Explorer',
          username: targetProfileData.username ? `@${targetProfileData.username}` : '',
          avatar: targetProfileData.avatarUrl || '',
          status: "Available" as any,
          compatibility: 88,
          sharedDNA: "Explorer" as any,
          mutualExperiences: targetProfileData.adventuresCompleted || 1,
          mutualCommunities: targetProfileData.communitiesJoined || 1,
          bio: targetProfileData.bio || "Wandercall explorer from community discovery.",
          location: targetProfileData.locationFormatted || "Global",
          tags: ["Explorer", "Discovery"],
          isFavorite: false,
          isAdventurePartner: false,
          lastActive: "Active recently"
        });
      } else {
        baseList.unshift({
          id: activeFriendId,
          name: activeFriendId.startsWith("f-") ? `Explorer (${activeFriendId})` : "Connecting Explorer...",
          username: `@${activeFriendId}`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          status: "Available" as any,
          compatibility: 85,
          sharedDNA: "Explorer" as any,
          mutualExperiences: 1,
          mutualCommunities: 1,
          bio: "Connecting to explorer via Wandercall discovery network...",
          location: "Global",
          tags: ["Explorer"],
          isFavorite: false,
          isAdventurePartner: false,
          lastActive: "Active now"
        });
      }
    }

    return baseList;
  }, [friendsData, favoritesData, blockedIds, activeFriendId, targetProfileData]);

  const incomingRequests = useMemo(() => {
    if (!incomingData) return [];
    return incomingData.pages.flatMap(page => page.items)
      .filter(f => !blockedIds.has(f.userId))
      .map(f => ({
        id: f.userId,
        name: f.displayName,
        username: `@${f.username}`,
        avatar: f.avatarUrl || '',
        compatibility: f.compatibility || 90,
        mutualFriends: 0,
        bio: "Wants to connect with you.",
        status: "Incoming"
      }));
  }, [incomingData, blockedIds]);

  const outgoingRequests = useMemo(() => {
    if (!outgoingData) return [];
    return outgoingData.pages.flatMap(page => page.items)
      .filter(f => !blockedIds.has(f.userId))
      .map(f => ({
        id: f.userId,
        name: f.displayName,
        username: `@${f.username}`,
        avatar: f.avatarUrl || '',
        compatibility: f.compatibility || 90,
        status: "Pending Sent"
      }));
  }, [outgoingData, blockedIds]);

  const [suggestedExplorers, setSuggestedExplorers] = useState(SUGGESTED_EXPLORERS);
  const [chatMessages, setChatMessages] = useState<Record<string, any[]>>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");

  // ─── Real-time Chat via useChatConversation ────────────────────────────────
  // Use activeFriendId directly (declared above) — not activeFriend which is computed later
  const {
    conversationId: activeChatConversationId,
    messages: realMessages,
    isLoadingMessages: isChatLoading,
    sendTextMessage: sendRealTextMessage,
    sendSpecialMessage: sendRealSpecialMessage,
    emitTyping,
    emitStopTyping,
    markConversationRead,
  } = useChatConversation({ targetUserId: activeFriendId });
  // ──────────────────────────────────────────────────────────────────────────

  // Conversation Focus Manager:
  // When the user opens a conversation and messages are rendered, mark them as read.
  // This fires only when activeFriendId changes (new conversation opened) and realMessages have loaded.
  useEffect(() => {
    if (!activeFriendId || realMessages.length === 0) return;
    // Small delay to let the UI render first — messages must be visually present
    const timer = setTimeout(() => {
      markConversationRead();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeFriendId, realMessages.length, markConversationRead]);

  // Pagination states for pending requests and blocked users
  const [incomingPage, setIncomingPage] = useState(1);
  const [outgoingPage, setOutgoingPage] = useState(1);
  const [blockedPage, setBlockedPage] = useState(1);
  const ITEMS_PER_PAGE = isMobile ? 4 : 6;
  const BLOCKED_ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const totalPages = Math.ceil(incomingRequests.length / ITEMS_PER_PAGE);
    if (incomingPage > totalPages && totalPages > 0) {
      setIncomingPage(totalPages);
    }
  }, [incomingRequests.length, incomingPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    const totalPages = Math.ceil(outgoingRequests.length / ITEMS_PER_PAGE);
    if (outgoingPage > totalPages && totalPages > 0) {
      setOutgoingPage(totalPages);
    }
  }, [outgoingRequests.length, outgoingPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    const totalPages = Math.ceil(blockedUsers.length / BLOCKED_ITEMS_PER_PAGE);
    if (blockedPage > totalPages && totalPages > 0) {
      setBlockedPage(totalPages);
    }
  }, [blockedUsers.length, blockedPage, BLOCKED_ITEMS_PER_PAGE]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when real messages update
  useEffect(() => {
    const container = chatStreamRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [realMessages, activeFriendId]);

  // Find active selected friend profile
  const activeFriend = useMemo(() => {
    if (!activeFriendId) return null;
    return companions.find(f => f.id === activeFriendId) || null;
  }, [companions, activeFriendId]);

  const currentChatId = activeFriendId || "";

  // Constellation nodes calculations
  // Sizes represent friendship strength/mutual experience. Proximity represents compatibility.
  const constellationNodes = useMemo(() => {
    const centerX = 500;
    const centerY = 190;
    const placedNodes: { friend: Companion; x: number; y: number; r: number }[] = [];

    companions.forEach((friend, idx) => {
      // Proximity (closer to center for higher compatibility match)
      const baseDistance = 320 - (friend.compatibility - 60) * 4.5;
      const distance = Math.max(130, Math.min(280, baseDistance));

      // Radius sizes (16px to 28px) based on mutual experiences
      const r = 16 + (friend.mutualExperiences * 1.3);

      // Distribute evenly in visual arcs
      const angle = (idx * (2.15 * Math.PI)) / (companions.length || 1) - 0.5;

      const x = Math.round((centerX + distance * Math.cos(angle)) * 10) / 10;
      const y = Math.round((centerY + distance * Math.sin(angle)) * 10) / 10;

      placedNodes.push({ friend, x, y, r });
    });

    return placedNodes;
  }, [companions]);

  // Filtered nodes for the search input
  const filteredConstellation = useMemo(() => {
    if (!searchQuery) return constellationNodes.map(item => ({ ...item, isMatched: true }));
    const query = searchQuery.toLowerCase();
    return constellationNodes.map(item => {
      const isMatched =
        item.friend.name.toLowerCase().includes(query) ||
        item.friend.username.toLowerCase().includes(query) ||
        item.friend.sharedDNA.toLowerCase().includes(query) ||
        item.friend.tags.some(t => t.toLowerCase().includes(query));
      return { ...item, isMatched };
    });
  }, [constellationNodes, searchQuery]);

  // Filtered companions for the left list based on category & search
  // Sorted by most recent message (WhatsApp / Discord ordering)
  const filteredListCompanions = useMemo(() => {
    const filtered = companions.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "favorites") return f.isFavorite;
      if (selectedCategory === "partners") return f.isAdventurePartner;
      if (selectedCategory === "online") return f.status !== "Offline";

      return true;
    });

    // Sort: friends with recent messages first (lastMessageAt DESC),
    // then friends with no messages sorted by name
    return filtered.sort((a, b) => {
      const inboxA = getInboxState(a.id);
      const inboxB = getInboxState(b.id);

      const timeA = inboxA.lastMessageAt ? new Date(inboxA.lastMessageAt).getTime() : 0;
      const timeB = inboxB.lastMessageAt ? new Date(inboxB.lastMessageAt).getTime() : 0;

      if (timeA !== timeB) return timeB - timeA; // DESC
      return a.name.localeCompare(b.name);
    });
  }, [companions, selectedCategory, searchQuery, getInboxState]);

  // DNA badge colors
  const getDnaBadgeStyle = (dna: string) => {
    if (dna === "Explorer") return "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/20";
    if (dna === "Creative") return "bg-brand-purple/15 text-brand-purple border-brand-purple/20";
    if (dna === "Storyteller") return "bg-brand-amber/15 text-brand-amber border-brand-amber/20";
    return "bg-brand-indigo/15 text-brand-indigo border-brand-indigo/20";
  };

  const getStatusColor = (status: Companion["status"]) => {
    switch (status) {
      case "Available": return "bg-brand-emerald";
      case "In Campfire": return "bg-brand-cyan";
      case "Hosting": return "bg-brand-purple animate-pulse";
      case "Exploring": return "bg-brand-amber";
      case "Busy": return "bg-rose-500";
      default: return "bg-zinc-650 border border-white/10";
    }
  };

  // Actions
  const handleSendMessage = () => {
    if (!currentChatId || !chatInput.trim()) return;
    // Use real socket-based sending
    sendRealTextMessage(chatInput.trim());
    setChatInput("");
  };

  const handleSendExperience = () => {
    if (!currentChatId) return;
    sendRealSpecialMessage('EXPERIENCE_CARD', {
      title: "Alpine Cliff Dive Experience",
      host: "Bear G.",
      date: "June 29 at 3:00 PM",
      category: "Adventure",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop"
    });
  };

  const handleSendPlan = () => {
    if (!currentChatId || !activeFriend) return;
    sendRealSpecialMessage('PLAN_CARD', {
      title: "Gokarna Cliff Dive & Coastal Camp",
      date: "July 04-06",
      location: "Gokarna Beach",
      companions: ["Rishiraj", activeFriend.name],
      status: "Planning"
    });
  };

  const handleSendCampfireInvite = (campfire: any) => {
    if (!currentChatId) return;
    sendRealSpecialMessage('CAMPFIRE_INVITE', {
      id: campfire.id,
      title: campfire.title,
      hostName: campfire.hostName,
      hostAvatar: campfire.hostAvatar,
      category: campfire.category
    });
    setShowInviteModal(false);
  };

  // Unblock user
  const handleUnblock = async (id: string, name: string) => {
    const user = blockedUsers.find(u => u.id === id);
    if (user && user.username) {
      try {
        await unblockMutation.mutateAsync(user.username.replace('@', ''));
        triggerToast(`${name} has been unblocked.`);
      } catch (error: any) {
        triggerToast(error?.response?.data?.message || "Failed to unblock user.");
      }
    } else {
      triggerToast("User not found.");
    }
  };

  // Accept request
  const handleAcceptRequest = async (request: any) => {
    try {
      await followBackMutation.mutateAsync(request.username.replace('@', ''));
      triggerToast(`You are now friends with ${request.name}!`);
    } catch (error) {
      triggerToast("Failed to accept request.");
    }
  };

  // Decline request
  const handleDeclineRequest = async (id: string, name: string) => {
    const request = incomingRequests.find(r => r.id === id);
    if (request) {
      try {
        await rejectRequestMutation.mutateAsync(request.username.replace('@', ''));
        triggerToast(`Friend request from ${name} declined.`);
      } catch (error) {
        triggerToast("Failed to decline request.");
      }
    }
  };

  // Cancel outgoing request
  const handleCancelRequest = async (id: string, name: string) => {
    const request = outgoingRequests.find(r => r.id === id);
    if (request) {
      try {
        await cancelRequestMutation.mutateAsync(request.username.replace('@', ''));
        triggerToast(`Friend request to ${name} cancelled.`);
      } catch (error) {
        triggerToast("Failed to cancel request.");
      }
    }
  };

  const handleSendRequest = async (suggested: typeof SUGGESTED_EXPLORERS[0]) => {
    try {
      await followBackMutation.mutateAsync(suggested.username.replace('@', ''));
      setSuggestedExplorers(prev => prev.filter(s => s.id !== suggested.id));
      triggerToast(`Friend request sent to ${suggested.name}.`);
    } catch (error) {
      triggerToast("Failed to send request.");
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-3 md:py-6 text-white flex flex-col gap-3 md:gap-6 select-none font-sans overflow-hidden">

      {/* 1. FRIENDS COMMAND CENTER (STATUS RIBBON) - Hidden on desktop sizes */}
      <div className="md:hidden glass-panel rounded-2xl p-2.5 border border-white/5 shadow-md flex items-center justify-between gap-3 w-full shrink-0">
        <button
          onClick={() => router.push('/profile/friends/search')}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-brand-cyan/40 rounded-xl transition-all cursor-pointer group shadow-sm text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="h-3.5 w-3.5 text-zinc-400 group-hover:text-brand-cyan transition-colors shrink-0" />
            <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors truncate">
              Search friends & travel DNA...
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white transition-all shrink-0">
            ⌘K
          </span>
        </button>
      </div>

      {/* 2. CATEGORY HORIZONTAL SELECTOR MENU BAR */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full p-2 bg-zinc-950/20 border border-white/5 rounded-2xl shrink-0 select-none items-center" data-lenis-prevent>
        {(
          [
            { id: "all", label: "All Friends", icon: Users, count: companions.length },
            { id: "favorites", label: "Favorites", icon: Heart, count: companions.filter(f => f.isFavorite).length },
            { id: "partners", label: "Adventure Partners", icon: Award, count: companions.filter(f => f.isAdventurePartner).length },
            { id: "pending", label: "Pending Requests", icon: UserPlus, count: incomingRequests.length + outgoingRequests.length },
            { id: "blocked", label: "Blocked & Privacy", icon: ShieldAlert, count: blockedUsers.length }
          ] as const
        ).map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveMobileView("rail");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${isActive
                  ? "bg-brand-cyan text-zinc-950 border border-brand-cyan/20 shadow-md shadow-brand-cyan/10 scale-102"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-zinc-950" : "text-zinc-500"}`} />
              <span>{cat.label}</span>
              <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-black shrink-0 ${isActive ? "bg-zinc-950/20 text-zinc-950" : "bg-white/5 text-zinc-500 border border-white/5"
                }`}>
                {cat.count}
              </span>
            </button>
          );
        })}

        {/* Relocated Search Bar - Visible on desktop only */}
        <div className="hidden md:flex items-center gap-2 w-full max-w-[280px] ml-auto shrink-0">
          <button
            onClick={() => router.push('/profile/friends/search')}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-brand-cyan/40 rounded-xl transition-all cursor-pointer group shadow-sm text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Search className="h-3.5 w-3.5 text-zinc-400 group-hover:text-brand-cyan transition-colors shrink-0" />
              <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-200 transition-colors truncate">
                Search friends & DNA...
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white transition-all shrink-0">
              ⌘K
            </span>
          </button>
        </div>
      </div>

      {/* 3. FRIENDS WORKSPACE (OPERATIONAL CONTAINER) */}
      <div className="w-full flex-1 min-h-0 flex flex-col gap-4">

        {/* Right Side: Active Workspace */}
        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="glass-panel rounded-2xl md:rounded-3xl p-3 sm:p-5 border border-white/5 flex flex-col justify-between overflow-hidden flex-1 min-h-0 h-full">

            {/* VIEW A: CHAT WORKSPACE & CONVERSATION */}
            {(["all", "favorites", "partners", "online", "recent"].includes(selectedCategory)) && (
              <div className="flex flex-col lg:flex-row gap-5 items-stretch flex-1 w-full min-w-0 h-full min-h-0">

                {/* 1. Sub-left Friend Selection List (Hidden on mobile when chat is active) */}
                <div className={`w-full lg:w-[240px] shrink-0 flex flex-col gap-2 lg:border-r lg:border-white/5 lg:pr-4 flex-1 lg:flex-none min-h-0 ${activeMobileView === "chat" || activeMobileView === "inspector" ? "hidden lg:flex" : "flex"
                  }`}>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 pb-2 border-b border-white/5 shrink-0">
                    Select Companion
                  </div>
                  <div ref={companionListRef} className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 no-scrollbar pr-1 pb-4 md:pb-2 overscroll-contain touch-pan-y">
                    {filteredListCompanions.map(friend => {
                      const isSelected = activeFriendId === friend.id;
                      const inbox = getInboxState(friend.id);
                      const unreadCount = isSelected ? 0 : inbox.unreadCount;
                      const hasUnread = unreadCount > 0;
                      const isFromMe = inbox.lastMessageSenderId === currentUserId;
                      const preview = inbox.isTyping
                        ? null
                        : formatMessagePreview(inbox.lastMessageText, undefined, isFromMe);

                      return (
                        <div
                          key={friend.id}
                          onClick={() => {
                            router.push(`/profile/friends/chat:${friend.id}`);
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-2xl cursor-pointer border transition-all duration-200 ${isSelected
                            ? "bg-white/[0.04] border-brand-cyan/30 shadow-md shadow-brand-cyan/5"
                            : hasUnread
                              ? "bg-brand-cyan/[0.03] border-brand-cyan/15 hover:border-brand-cyan/25"
                              : "bg-white/[0.01] border-white/5 hover:border-white/10"
                          }`}
                        >
                          {/* Avatar with online indicator */}
                          <div className="relative shrink-0">
                            <CompanionAvatar avatar={friend.avatar} name={friend.name} className="h-8 w-8 text-[11px]" />
                            {inbox.isOnline && (
                              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-brand-emerald border-[1.5px] border-zinc-950 shadow-sm" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className={`text-xs truncate ${hasUnread ? "font-black text-white" : "font-bold text-zinc-200"}`}>
                                {friend.name}
                              </h4>
                              <div className="flex items-center gap-1 shrink-0">
                                {inbox.lastMessageAt && (
                                  <span className={`text-[8px] font-mono ${hasUnread ? "text-brand-cyan" : "text-zinc-600"}`}>
                                    {formatInboxTime(inbox.lastMessageAt)}
                                  </span>
                                )}
                                {hasUnread && (
                                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-brand-cyan text-zinc-950 text-[8px] font-black flex items-center justify-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Preview line */}
                            {inbox.isTyping ? (
                              <p className="text-[9px] text-brand-cyan font-bold flex items-center gap-1 mt-0.5">
                                <span className="inline-flex gap-0.5">
                                  <span className="w-1 h-1 rounded-full bg-brand-cyan animate-bounce [animation-delay:0ms]" />
                                  <span className="w-1 h-1 rounded-full bg-brand-cyan animate-bounce [animation-delay:150ms]" />
                                  <span className="w-1 h-1 rounded-full bg-brand-cyan animate-bounce [animation-delay:300ms]" />
                                </span>
                                Typing...
                              </p>
                            ) : preview ? (
                              <p className={`text-[9px] truncate mt-0.5 ${hasUnread ? "text-zinc-300 font-semibold" : "text-zinc-500"}`}>
                                {preview}
                              </p>
                            ) : (
                              <p className="text-[9px] text-zinc-600 truncate mt-0.5">{friend.status} • {friend.sharedDNA}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sub-center Conversational Chat (Visible on mobile in chat view) */}
                <div className={`flex-1 flex flex-col justify-between min-h-[380px] lg:border-r lg:border-white/5 lg:pr-4 min-w-0 relative ${activeMobileView === "chat" ? "flex" : activeMobileView === "inspector" ? "hidden lg:flex" : "hidden lg:flex"
                  }`}>

                  {!activeFriend ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 select-none h-full relative">
                      <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-brand-cyan/5 rounded-full filter blur-2xl animate-pulse" />
                        
                        {/* Interactive-looking Compass & Chat SVG */}
                        <svg className="w-36 h-36 relative z-10 text-brand-cyan" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="6 4" className="animate-[spin_60s_linear_infinite]" />
                          <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="12 8" className="animate-[spin_30s_linear_infinite_reverse]" />
                          <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
                          <path d="M100 65V135M65 100H135" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                          
                          {/* Chat Bubbles */}
                          <g className="animate-[bounce_4s_ease-in-out_infinite]">
                            <rect x="65" y="70" width="50" height="32" rx="10" fill="#09090b" stroke="currentColor" strokeWidth="2" />
                            <path d="M75 102L70 108L78 108L75 102Z" fill="currentColor" />
                            <circle cx="82" cy="86" r="2" fill="currentColor" />
                            <circle cx="90" cy="86" r="2" fill="currentColor" />
                            <circle cx="98" cy="86" r="2" fill="currentColor" />
                          </g>
                          
                          <g className="animate-[bounce_4s_ease-in-out_infinite_2s]">
                            <rect x="95" y="98" width="45" height="28" rx="8" fill="#09090b" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.7" />
                            <path d="M130 126L134 131L128 131L130 126Z" fill="currentColor" fillOpacity="0.7" />
                          </g>
                        </svg>
                      </div>

                      <h3 className="text-sm font-black tracking-wider uppercase text-zinc-200 mt-4 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-brand-cyan animate-pulse" />
                        Select a Companion
                      </h3>
                      <p className="text-[10px] text-zinc-400 max-w-[320px] leading-relaxed mt-2">
                        Click on any companion from the list on the left to start chatting and plan your adventures.
                      </p>
                      
                      {/* Interactive guidance arrow pointing left */}
                      <div className="mt-6 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-cyan/60 animate-pulse">
                        <ChevronLeft className="h-3.5 w-3.5 animate-[translateX_1.5s_infinite]" />
                        <span>Choose a friend to chat</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Chat Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Back button */}
                      <button
                        onClick={() => {
                          if (isMobile) {
                            setActiveMobileView("rail");
                          } else {
                            router.push("/profile/friends");
                          }
                        }}
                        className="p-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/5"
                        title="Go Back"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setZoomedAvatar({ url: activeFriend.avatar, name: activeFriend.name })}>
                        <CompanionAvatar avatar={activeFriend.avatar} name={activeFriend.name} className="h-10 w-10 text-[13px]" />
                      </div>
                      <div className="min-w-0">
                        <h3 
                          onClick={() => router.push(`/profile/${activeFriend.username.replace(/^@/, "")}`)}
                          className="text-xs font-black text-white hover:text-brand-cyan transition-colors cursor-pointer truncate flex items-center gap-1.5"
                        >
                          {activeFriend.name}
                          <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold uppercase ${getDnaBadgeStyle(activeFriend.sharedDNA)}`}>
                            {activeFriend.sharedDNA}
                          </span>
                        </h3>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {activeFriend.compatibility}% Adventure Match • {activeFriend.mutualExperiences} shared experiences
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mobile view inspector toggle */}
                      <button
                        onClick={() => setActiveMobileView("inspector")}
                        className="lg:hidden p-2 rounded-xl border border-white/5 text-zinc-400 hover:text-white"
                      >
                        <Info className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div
                    ref={chatStreamRef}
                    className="flex-1 py-4 overflow-y-auto custom-scrollbar pr-2 pb-20"
                  >
                    {realMessages.length > 0 ? (
                      <div className="space-y-3">
                        {realMessages.map((msg: any) => {
                          const isMe = msg.senderId === currentUserId;
                          const CustomRenderer = getMessageRenderer(msg.type);

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                            >
                              {CustomRenderer ? (
                                <CustomRenderer message={msg} currentUserId={currentUserId} />
                              ) : (
                                <>
                                  {(msg.type === "text" || msg.type === "TEXT") && (
                                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${isMe
                                        ? "bg-brand-cyan text-zinc-950 rounded-tr-none font-semibold shadow-md shadow-brand-cyan/5"
                                        : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/5"
                                      }`}>
                                      {msg.isDeleted ? <span className="italic text-zinc-500">Message deleted</span> : msg.text}
                                    </div>
                                  )}

                              {(msg.type === "audio" || msg.type === "AUDIO") && (
                                <AudioMessagePlayer duration={msg.metadata?.duration ?? "0:30"} />
                              )}

                              {(msg.type === "experience" || msg.type === "EXPERIENCE_CARD") && (
                                <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-lg w-64 text-left">
                                  <div className="h-28 w-full relative">
                                    <img src={msg.metadata?.image} className="h-full w-full object-cover opacity-80" alt="" />
                                    <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full">
                                      {msg.metadata?.category}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    <h4 className="text-xs font-bold text-white truncate">{msg.metadata?.title}</h4>
                                    <p className="text-[9px] text-zinc-500">{msg.metadata?.date} • Host: {msg.metadata?.host}</p>
                                    <button
                                      onClick={() => triggerToast(`Booking slot for ${msg.metadata?.title}...`)}
                                      className="w-full py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                                    >
                                      Request Slot
                                    </button>
                                  </div>
                                </div>
                              )}

                              {(msg.type === "plan" || msg.type === "PLAN_CARD") && (
                                <div className="glass-panel border border-white/10 p-3.5 rounded-2xl shadow-lg w-64 text-left space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-purple text-white px-2 py-0.5 rounded-full">
                                      Adventure Plan
                                    </span>
                                    <span className="text-[8px] font-mono text-brand-cyan font-bold">{msg.metadata?.status}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white truncate">{msg.metadata?.title}</h4>
                                    <p className="text-[9px] text-zinc-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-zinc-400" /> {msg.metadata?.location}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-mono">Date: {msg.metadata?.date}</p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {(msg.metadata?.companions || []).map((name: string, i: number) => (
                                      <span key={i} className="h-5 px-2 bg-white/5 border border-white/5 text-[8px] font-bold rounded-md text-zinc-300">
                                        {name.split(" ")[0]}
                                      </span>
                                    ))}
                                    <button
                                      onClick={() => triggerToast("Added to adventure plan cohort!")}
                                      className="h-5 w-5 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer"
                                      title="Join plan"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}

                              {(msg.type === "campfire_invite" || msg.type === "CAMPFIRE_INVITE") && (
                                <div className="glass-panel border border-brand-cyan/35 bg-zinc-950/90 p-4 rounded-3xl shadow-2xl w-64 text-left space-y-3 relative overflow-hidden animate-[fadeIn_0.3s_ease]">
                                  <div className="absolute top-0 right-0 h-16 w-16 bg-brand-cyan/10 rounded-full filter blur-xl pointer-events-none" />
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Flame className="h-2.5 w-2.5 fill-current animate-pulse text-zinc-950" /> Campfire Invite
                                    </span>
                                    <span className="text-[8px] font-mono text-brand-cyan font-black">{msg.metadata?.category}</span>
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{msg.metadata?.title}</h4>
                                    <div className="flex items-center gap-2 pt-1">
                                      <CompanionAvatar avatar={msg.metadata?.hostAvatar ?? ''} name={msg.metadata?.hostName ?? ''} className="h-6 w-6 text-[9px]" />
                                      <div>
                                        <p className="text-[9px] text-zinc-400 font-bold leading-none">{msg.metadata?.hostName}</p>
                                        <p className="text-[7px] text-zinc-500 font-mono mt-0.5">Host</p>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const slug = (msg.metadata?.title ?? '').toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                      router.push(`/profile/campfires/${msg.metadata?.id}--${slug}`);
                                    }}
                                    className="w-full py-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 border border-brand-cyan/20 text-[10px] font-black rounded-xl transition-all cursor-pointer shadow-md shadow-brand-cyan/10 flex items-center justify-center gap-1.5"
                                  >
                                    Join Campfire
                                  </button>
                                </div>
                              )}
                            </>
                          )}

                              {/* Message status indicator */}
                              <span className="text-[8px] text-zinc-500 mt-1 font-mono flex items-center gap-1">
                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (msg.timestamp ?? '')}
                                {isMe && (
                                  <span className={`ml-1 ${
                                    msg.status === 'READ' ? 'text-brand-cyan' :
                                    msg.status === 'DELIVERED' ? 'text-zinc-400' :
                                    msg.status === 'FAILED' ? 'text-rose-500' :
                                    msg.status === 'SENDING' ? 'text-zinc-600' : 'text-zinc-500'
                                  }`}>
                                    {msg.status === 'SENDING' && '◷'}
                                    {msg.status === 'SENT' && '✓'}
                                    {msg.status === 'DELIVERED' && '✓✓'}
                                    {msg.status === 'READ' && '✓✓'}
                                    {msg.status === 'FAILED' && '✗'}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center text-center px-4 py-8 select-none">
                        {/* Premium enterprise-level glowing SVG illustration representing digital alignment */}
                        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                          {/* Inner glowing pulse */}
                          <div className="absolute inset-0 bg-brand-cyan/5 rounded-full filter blur-xl animate-pulse" />
                          
                          {/* Custom Animated SVG Illustration */}
                          <svg className="w-32 h-32 relative z-10 text-brand-cyan" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Orbital Ring 1 */}
                            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 4" className="animate-[spin_40s_linear_infinite]" />
                            {/* Orbital Ring 2 */}
                            <circle cx="100" cy="100" r="50" stroke="url(#cyan-glow-grad)" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="8 6" className="animate-[spin_20s_linear_infinite_reverse]" />
                            {/* Orbital Ring 3 */}
                            <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                            
                            {/* Connections */}
                            <line x1="100" y1="100" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                            <line x1="100" y1="100" x2="140" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                            <line x1="100" y1="100" x2="100" y2="150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />

                            {/* Node 1: User coordinates */}
                            <g className="animate-[bounce_3s_ease-in-out_infinite]">
                              <circle cx="60" cy="60" r="8" fill="url(#cyan-glow-grad)" className="shadow-lg shadow-brand-cyan/20" />
                              <circle cx="60" cy="60" r="4" fill="#09090b" />
                            </g>
                            {/* Node 2: Companion coordinates */}
                            <g className="animate-[bounce_4s_ease-in-out_infinite_1s]">
                              <circle cx="140" cy="60" r="10" fill="url(#purple-glow-grad)" />
                              <text x="140" y="63" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">👤</text>
                            </g>
                            {/* Node 3: Quest target coordinates */}
                            <g className="animate-[pulse_2s_infinite]">
                              <circle cx="100" cy="150" r="7" fill="url(#amber-glow-grad)" />
                              <path d="M100 146L103 152L97 152Z" fill="#09090b" />
                            </g>

                            {/* Center Star / Explorer Compass Emblem */}
                            <g className="animate-[pulse_3s_infinite]">
                              <circle cx="100" cy="100" r="16" fill="#09090b" stroke="url(#cyan-glow-grad)" strokeWidth="2" />
                              {/* 4-point Compass Star */}
                              <path d="M100 88L103 97L112 100L103 103L100 112L97 103L88 100L97 97Z" fill="url(#cyan-glow-grad)" />
                            </g>

                            {/* Gradient definitions */}
                            <defs>
                              <linearGradient id="cyan-glow-grad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#06b6d4" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                              <linearGradient id="purple-glow-grad" x1="120" y1="40" x2="160" y2="80" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                              </linearGradient>
                              <linearGradient id="amber-glow-grad" x1="80" y1="130" x2="120" y2="170" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#ef4444" />
                              </linearGradient>
                            </defs>
                          </svg>

                          {/* Orbiting particles */}
                          <div className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-brand-cyan/40 animate-ping duration-1000" />
                          <div className="absolute bottom-[25%] right-[22%] w-1.5 h-1.5 rounded-full bg-brand-purple/40 animate-ping duration-1500" />
                        </div>

                        {/* Heading & description */}
                        <h3 className="text-xs font-black tracking-wider uppercase text-zinc-200 mt-2">
                          Connect with {activeFriend.name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 max-w-[280px] leading-relaxed mt-1">
                          Establish coordinate link alignment & collaborate on treks. Send an icebreaker below to invite them as an Adventure Partner!
                        </p>

                        {/* Icebreaker Suggestions */}
                        <div className="flex flex-col gap-1.5 w-full max-w-[320px] mt-4 shrink-0">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">
                            Suggested Icebreakers (Click to fill)
                          </span>
                          {getIcebreakers(activeFriend).slice(0, 1).map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => setChatInput(prompt)}
                              className="text-left text-[9px] font-bold px-3 py-2 bg-white/[0.01] hover:bg-brand-cyan/10 border border-white/5 hover:border-brand-cyan/20 text-zinc-400 hover:text-brand-cyan rounded-xl transition-all cursor-pointer truncate w-full flex items-center gap-2 group"
                            >
                              <span className="text-brand-cyan group-hover:scale-110 transition-transform">🧭</span>
                              <span className="truncate">{prompt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input controls - Hidden on desktop */}
                  <div className="lg:hidden pt-3 border-t border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* Short shortcuts */}
                      <button
                        onClick={handleSendExperience}
                        className="px-2 py-1 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Share2 className="h-3 w-3 text-brand-cyan" /> Experience
                      </button>
                      <button
                        onClick={handleSendPlan}
                        className="px-2 py-1 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Calendar className="h-3 w-3 text-brand-purple" /> Plan Trek
                      </button>
                    </div>

                    <div className="flex items-center gap-2 bg-zinc-950/80 border border-white/10 p-1.5 rounded-2xl w-full">
                      <button
                        onClick={() => triggerToast("Simulating mic trigger...")}
                        className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                      >
                        <Mic className="h-4 w-4" />
                      </button>

                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Write message to explorer..."
                        className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold px-2"
                      />

                      <button
                        onClick={handleSendMessage}
                        className="p-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-md shadow-brand-cyan/15"
                      >
                        <Send className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Floating/Fixed Chat Input Bar - Centered at bottom of Chat Column */}
                  {activeFriend && (["all", "favorites", "partners", "online", "recent"].includes(selectedCategory)) && (
                    <div className="hidden lg:flex absolute bottom-[-14px] left-0 lg:right-8 right-0 mx-auto z-40 w-[95%] max-w-[480px] transition-opacity duration-300 opacity-65 hover:opacity-100 focus-within:opacity-100 select-none">
                      <div className="glass-panel border border-white/10 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-zinc-950/90 w-full">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleSendPlan}
                            className="px-2 py-1 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 shrink-0"
                          >
                            <Calendar className="h-3 w-3 text-brand-purple" /> Plan Trek
                          </button>
                        </div>

                        <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 p-1.5 rounded-xl w-full">
                          <button
                            onClick={() => triggerToast("Simulating mic trigger...")}
                            className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                          >
                            <Mic className="h-4 w-4" />
                          </button>

                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder={`Write message to ${activeFriend.name}...`}
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold px-2"
                          />

                          <button
                            onClick={handleSendMessage}
                            className="p-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-md shadow-brand-cyan/15"
                          >
                            <Send className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

                {/* 3. Sub-right Friend Inspector / Insights (Visible on mobile in inspector view) */}
                <div className={`w-full lg:w-[260px] shrink-0 flex flex-col justify-between min-h-[380px] min-w-0 ${activeMobileView === "inspector" ? "flex" : "hidden lg:flex"
                  }`}>
                  {!activeFriend ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 border border-white/5 bg-white/[0.01] rounded-3xl h-full min-h-[380px] select-none">
                      <div className="relative h-16 w-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center text-zinc-500 mb-3">
                        <Compass className="h-6 w-6 text-zinc-500" />
                        <div className="absolute inset-0 rounded-full border border-dashed border-zinc-700 animate-[spin_20s_linear_infinite]" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Profile Insights</h4>
                      <p className="text-[9px] text-zinc-500 max-w-[180px] leading-relaxed mt-1">
                        Companion statistics, compatibility metrics, and passport details will populate once a friend is selected.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 text-left">
                    <div className="pb-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Explorer Profile</span>
                      <button
                        onClick={() => setActiveMobileView("chat")}
                        className="lg:hidden p-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Passport Card details */}
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-cyan/20 border border-brand-cyan/20 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold text-brand-cyan">
                        {activeFriend.compatibility}% match
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => setZoomedAvatar({ url: activeFriend.avatar, name: activeFriend.name })}>
                          <CompanionAvatar avatar={activeFriend.avatar} name={activeFriend.name} className="h-12 w-12 text-[15px]" />
                        </div>
                        <div 
                          onClick={() => router.push(`/profile/${activeFriend.username.replace(/^@/, "")}`)}
                          className="cursor-pointer group/name"
                        >
                          <h4 className="text-xs font-bold text-white group-hover/name:text-brand-cyan transition-colors">{activeFriend.name}</h4>
                          <span className="text-[9px] text-zinc-500 group-hover/name:text-brand-cyan/85 transition-colors">{activeFriend.username}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{activeFriend.bio}</p>

                      <div className="flex flex-wrap gap-1">
                        {activeFriend.tags.map(tag => (
                          <span key={tag} className="text-[8px] font-semibold bg-white/5 border border-white/5 text-zinc-400 px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Radar representation statistics */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Compatibility breakdown</h4>
                      <div className="space-y-2 bg-black/20 border border-white/5 p-3 rounded-2xl">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-brand-cyan">Adventure Overlap</span>
                            <span>{activeFriend.compatibility}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-cyan" style={{ width: `${activeFriend.compatibility}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-brand-purple">Community Overlap</span>
                            <span>{activeFriend.mutualCommunities * 15}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-purple" style={{ width: `${activeFriend.mutualCommunities * 15}%` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-brand-emerald">Experiences Shared</span>
                            <span>{activeFriend.mutualExperiences * 12}%</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-emerald" style={{ width: `${activeFriend.mutualExperiences * 12}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action shortcuts */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => triggerToast(`User reported.`)}
                        className="w-full py-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Flag className="h-3 w-3" /> Report Explorer
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            if (activeFriend.isFavorite) {
                              await removeFavoriteMutation.mutateAsync(activeFriend.id);
                            } else {
                              await addFavoriteMutation.mutateAsync(activeFriend.id);
                            }
                          } catch (err: any) {
                            triggerToast(err?.response?.data?.message || "Failed to update favorite status.");
                          }
                        }}
                        className="w-full py-1.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Heart className={`h-3 w-3 ${activeFriend.isFavorite ? "fill-brand-purple text-brand-purple" : ""}`} /> {activeFriend.isFavorite ? "Unfavorite" : "Favorite"}
                      </button>
                      <button
                        onClick={async () => {
                          const isBlocked = blockedUsers.some(u => u.id === activeFriend.id);
                          if (isBlocked) {
                            triggerToast(`${activeFriend.name} is already blocked.`);
                            return;
                          }
                          try {
                            await blockMutation.mutateAsync({ targetUsername: activeFriend.username.replace('@', ''), reason: "Blocked from inspector" });
                            triggerToast(`${activeFriend.name} has been blocked.`);
                          } catch (err: any) {
                            triggerToast(err?.response?.data?.message || "Failed to block user.");
                          }
                        }}
                        className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="h-3 w-3" /> Block Explorer
                      </button>
                    </div>
                  </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW B: PENDING REQUESTS */}
            {selectedCategory === "pending" && (() => {
              const paginatedIncoming = incomingRequests.slice((incomingPage - 1) * ITEMS_PER_PAGE, incomingPage * ITEMS_PER_PAGE);
              const totalIncomingPages = Math.ceil(incomingRequests.length / ITEMS_PER_PAGE);

              const paginatedOutgoing = outgoingRequests.slice((outgoingPage - 1) * ITEMS_PER_PAGE, outgoingPage * ITEMS_PER_PAGE);
              const totalOutgoingPages = Math.ceil(outgoingRequests.length / ITEMS_PER_PAGE);

              return (
                <div ref={pendingViewRef} className="space-y-6 flex-1 w-full text-left overflow-y-auto no-scrollbar">

                  {/* Incoming Requests */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Incoming Requests ({incomingRequests.length})
                      </h3>
                      {totalIncomingPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIncomingPage(p => Math.max(1, p - 1))}
                            disabled={incomingPage === 1}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold px-1">
                            {incomingPage} / {totalIncomingPages}
                          </span>
                          <button
                            onClick={() => setIncomingPage(p => Math.min(totalIncomingPages, p + 1))}
                            disabled={incomingPage === totalIncomingPages}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {incomingRequests.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease]">
                        {paginatedIncoming.map(req => (
                          <div key={req.id} className="bg-gradient-to-r from-emerald-950/45 to-teal-950/20 border border-emerald-500/10 hover:border-emerald-500/20 p-4 rounded-3xl flex items-center justify-between gap-4 transition-all duration-300">
                            <div 
                              className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => router.push(`/profile/${req.username.replace('@', '')}`)}
                            >
                              <CompanionAvatar avatar={req.avatar} name={req.name} className="h-10 w-10 text-[13px] shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{req.name}</h4>
                                <p className="text-[9px] text-zinc-400 mt-0.5">{req.compatibility}% match • {req.username}</p>
                                <p className="text-[9px] text-zinc-500 truncate mt-1">{req.bio}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleAcceptRequest(req)}
                                className="p-1.5 bg-brand-emerald text-zinc-950 rounded-xl cursor-pointer hover:bg-emerald-400 transition-all shadow-md shadow-brand-emerald/10"
                                title="Accept"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeclineRequest(req.id, req.name)}
                                className="p-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl cursor-pointer hover:bg-rose-500 hover:text-white transition-all"
                                title="Decline"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-zinc-500 text-xs bg-black/10 border border-white/5 rounded-2xl">
                        No incoming friend requests.
                      </div>
                    )}
                  </div>

                  {/* Outgoing Requests */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                        Outgoing Requests ({outgoingRequests.length})
                      </h3>
                      {totalOutgoingPages > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setOutgoingPage(p => Math.max(1, p - 1))}
                            disabled={outgoingPage === 1}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </button>
                          <span className="text-[9px] font-mono text-zinc-500 font-bold px-1">
                            {outgoingPage} / {totalOutgoingPages}
                          </span>
                          <button
                            onClick={() => setOutgoingPage(p => Math.min(totalOutgoingPages, p + 1))}
                            disabled={outgoingPage === totalOutgoingPages}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {outgoingRequests.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[fadeIn_0.3s_ease]">
                        {paginatedOutgoing.map(req => (
                          <div key={req.id} className="bg-gradient-to-r from-indigo-950/45 to-blue-950/20 border border-indigo-500/10 hover:border-indigo-500/20 p-4 rounded-3xl flex items-center justify-between gap-4 transition-all duration-300">
                            <div 
                              className="flex items-center gap-3 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => router.push(`/profile/${req.username.replace('@', '')}`)}
                            >
                              <CompanionAvatar avatar={req.avatar} name={req.name} className="h-10 w-10 text-[13px] shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{req.name}</h4>
                                <p className="text-[9px] text-zinc-400 mt-0.5">{req.compatibility}% match • {req.username}</p>
                              </div>
                            </div>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold bg-zinc-900 border border-white/10 text-zinc-500 px-2.5 py-1 rounded-full shrink-0">
                              Waiting
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-zinc-500 text-xs bg-black/10 border border-white/5 rounded-2xl">
                        No outgoing friend requests pending.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* VIEW C: BLOCKED & PRIVACY CENTER */}
            {selectedCategory === "blocked" && (() => {
              const paginatedBlocked = blockedUsers.slice((blockedPage - 1) * BLOCKED_ITEMS_PER_PAGE, blockedPage * BLOCKED_ITEMS_PER_PAGE);
              const totalBlockedPages = Math.ceil(blockedUsers.length / BLOCKED_ITEMS_PER_PAGE);

              return (
                <div ref={blockedViewRef} className="space-y-4 flex-1 w-full text-left overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                      Privacy Center & Block List ({blockedUsers.length})
                    </h3>
                    {totalBlockedPages > 1 && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setBlockedPage(p => Math.max(1, p - 1))}
                          disabled={blockedPage === 1}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          title="Previous Page"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                        <span className="text-[9px] font-mono text-zinc-500 font-bold px-1">
                          {blockedPage} / {totalBlockedPages}
                        </span>
                        <button
                          onClick={() => setBlockedPage(p => Math.min(totalBlockedPages, p + 1))}
                          disabled={blockedPage === totalBlockedPages}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center"
                          title="Next Page"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xl">
                    Manage blocked, muted, or restricted accounts. Blocked users cannot message you, join campfires you host, or match your coordinates on maps.
                  </p>

                  {blockedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {paginatedBlocked.map(user => (
                        <div key={user.id} className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <CompanionAvatar avatar={user.avatar} name={user.name} className="h-10 w-10 text-[13px] shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                              <p className="text-[9px] text-zinc-500 mt-0.5">{user.blockedAt}</p>
                              <p className="text-[9px] text-rose-400 font-semibold truncate mt-1">Reason: {user.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnblock(user.id, user.name)}
                            className="px-4 py-1.5 bg-brand-emerald/20 hover:bg-brand-emerald text-brand-emerald hover:text-zinc-950 border border-brand-emerald/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shrink-0"
                          >
                            Unblock
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs bg-black/10 border border-white/5 rounded-2xl">
                      No blocked accounts found.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* VIEW D: FRIEND DISCOVERY */}
            {selectedCategory === "suggested" && (
              <div ref={suggestedViewRef} className="space-y-4 flex-1 w-full text-left overflow-y-auto no-scrollbar">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-white/5 pb-2">
                  AI Explorer Discovery
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed max-w-xl">
                  Suggested travel companions nearby who share your adventure DNA, quest completions, and community networks.
                </p>

                {suggestedExplorers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {suggestedExplorers.map(explorer => (
                      <div key={explorer.id} className="bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 p-4 rounded-3xl flex flex-col justify-between gap-4 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <CompanionAvatar avatar={explorer.avatar} name={explorer.name} className="h-10 w-10 text-[13px]" />
                            <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded-full">
                              {explorer.compatibility}% match
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{explorer.name}</h4>
                            <span className="text-[9px] text-zinc-500">{explorer.username} • {explorer.sharedDNA}</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed">
                            <Sparkles className="h-3 w-3 text-brand-amber inline mr-1" /> {explorer.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSendRequest(explorer)}
                          className="w-full py-2 bg-brand-cyan text-zinc-950 font-extrabold text-[10px] rounded-xl cursor-pointer hover:bg-cyan-400 transition-all flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="h-3.5 w-3.5 fill-current" /> Add Friend
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-500 text-xs bg-black/10 border border-white/5 rounded-2xl">
                    No suggestions found at this coordinate.
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Campfire Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowInviteModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-950/95 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
              
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-brand-cyan animate-pulse" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Invite to Campfire</h3>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[10px] text-zinc-400 mb-4 leading-normal shrink-0 text-left">
                Select an active campfire to invite <strong className="text-zinc-200">{activeFriend?.name || ""}</strong>. They will receive an interactive card in the chat to join directly.
              </p>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar" data-lenis-prevent>
                {campfireList.length > 0 ? (
                  campfireList.map((campfire) => (
                    <div
                      key={campfire.id}
                      className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 hover:bg-white/[0.02] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CompanionAvatar avatar={campfire.hostAvatar} name={campfire.hostName} className="h-9 w-9 text-xs" />
                        <div className="min-w-0 text-left">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan/20 border border-brand-cyan/20 text-brand-cyan px-1.5 py-0.2 rounded font-black shrink-0">
                            {campfire.category}
                          </span>
                          <h4 className="text-xs font-bold text-white truncate mt-1">{campfire.title}</h4>
                          <p className="text-[8px] text-zinc-500 truncate mt-0.5">Host: {campfire.hostName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendCampfireInvite(campfire)}
                        className="px-3 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 font-extrabold text-[10px] rounded-xl transition-all cursor-pointer shrink-0 shadow-md shadow-brand-cyan/10 flex items-center gap-1"
                      >
                        Send Invite
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-white/10 rounded-2xl">
                    No campfires active. Start one in the campfire directory!
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zoomed Avatar Modal */}
      <AnimatePresence>
        {zoomedAvatar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setZoomedAvatar(null)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 flex flex-col items-center gap-4 bg-zinc-900/90 border border-white/10 p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl backdrop-blur-lg"
            >
              <button
                onClick={() => setZoomedAvatar(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <CompanionAvatar
                avatar={zoomedAvatar.url}
                name={zoomedAvatar.name}
                className="h-48 w-48 text-5xl shadow-2xl border-2 border-white/15"
              />

              <div className="text-center">
                <h4 className="text-sm font-black text-white">{zoomedAvatar.name}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Explorer Passport Photo</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-zinc-900/95 backdrop-blur-xl border border-brand-cyan/30 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-white text-xs font-bold"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Radial Gradient Definitions (Global scope) */}
      <svg className="h-0 w-0 absolute">
        <defs>
          <radialGradient id="cluster-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

    </div>
  );
}
