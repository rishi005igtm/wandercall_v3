'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FriendsPage from "../page";
import { useFriends, useFavorites, useAddFavoriteMutation, useRemoveFavoriteMutation } from '@/hooks/api/useFriends';
import { useBlockedUsers, useBlockMutation } from '@/hooks/api/usePrivacy';
import { useUserProfileQuery } from '@/hooks/api/useUserQueries';
import { useChatConversation } from '@/hooks/api/useChatConversation';
import { useAppSelector } from '@/lib/store/store';
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Flame,
  Info,
  Send,
  Mic,
  Share2,
  Calendar,
  Compass,
  MapPin,
  Heart,
  Flag,
  ShieldAlert,
  Play,
  Pause
} from "lucide-react";

// Mock Companion Data definition matching friends/page.tsx
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

function AudioMessagePlayer({ duration }: { duration: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Parse duration "0:42" to 42 seconds
  const totalSeconds = React.useMemo(() => {
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
    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-3 w-60">
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

export default function MobileChatPage({ params }: { params: React.Usable<{ chatId: string }> }) {
  const { chatId } = React.use(params);

  // Clean parameter (extract the userId from e.g. 'chat:f-1')
  const decodedChatId = decodeURIComponent(chatId);
  const normalizedChatId = decodedChatId.replace(/\s+/g, "-").replace(/_/g, "-");
  const userId = normalizedChatId.startsWith("chat:") ? normalizedChatId.substring(5) : normalizedChatId;

  const router = useRouter();

  // Track mobile vs desktop — on desktop, FriendsPage owns the chat connection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const { data: friendsData } = useFriends(100);
  const { data: favoritesData } = useFavorites();
  const { data: blockedData } = useBlockedUsers(100);
  const { data: targetProfileData } = useUserProfileQuery(userId);

  const addFavoriteMutation = useAddFavoriteMutation();
  const removeFavoriteMutation = useRemoveFavoriteMutation();
  const blockMutation = useBlockMutation();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const blockedIds = React.useMemo(() => {
    if (!blockedData) return new Set<string>();
    return new Set(blockedData.pages.flatMap(page => page.items || []).map(b => b.targetUserId));
  }, [blockedData]);

  const companions: Companion[] = React.useMemo(() => {
    if (!friendsData) return [];
    const favList = favoritesData?.pages?.flatMap(p => p) || [];
    const favIds = new Set(favList.map((f: any) => f.userId || f.id));

    const baseList = friendsData.pages.flatMap(page => page.items || [])
      .filter(f => !blockedIds.has(f.userId))
      .map(f => ({
        id: f.userId,
        name: f.displayName || f.username || 'Unknown User',
        username: f.username ? `@${f.username}` : '',
        avatar: f.avatarUrl || '',
        status: "Available" as const,
        compatibility: f.compatibility || 85,
        sharedDNA: "Explorer" as const,
        mutualExperiences: 3,
        mutualCommunities: 2,
        bio: "Exploring Wandercall communities and adventures.",
        location: "Global",
        tags: ["Adventure", "Explorer"],
        isFavorite: favIds.has(f.userId),
        isAdventurePartner: false,
        lastActive: "Active recently"
      }));

    if (userId && !baseList.some(c => c.id === userId || c.username === `@${userId}` || c.username === userId)) {
      if (targetProfileData && (targetProfileData.userId === userId || targetProfileData.username === userId || `@${targetProfileData.username}` === userId)) {
        baseList.unshift({
          id: targetProfileData.userId,
          name: targetProfileData.displayName || targetProfileData.username || 'Explorer',
          username: targetProfileData.username ? `@${targetProfileData.username}` : '',
          avatar: targetProfileData.avatarUrl || '',
          status: "Available" as const,
          compatibility: 88,
          sharedDNA: "Explorer" as const,
          mutualExperiences: targetProfileData.adventuresCompleted || 1,
          mutualCommunities: targetProfileData.communitiesJoined || 1,
          bio: targetProfileData.bio || "Wandercall explorer from community discovery.",
          location: targetProfileData.locationFormatted || "Global",
          tags: ["Adventure", "Explorer"],
          isFavorite: false,
          isAdventurePartner: false,
          lastActive: "Active recently"
        });
      } else {
        baseList.unshift({
          id: userId,
          name: userId.startsWith("f-") ? `Explorer (${userId})` : "Connecting Explorer...",
          username: `@${userId}`,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          status: "Available" as const,
          compatibility: 85,
          sharedDNA: "Explorer" as const,
          mutualExperiences: 1,
          mutualCommunities: 1,
          bio: "Connecting to explorer via Wandercall discovery network...",
          location: "Global",
          tags: ["Adventure", "Explorer"],
          isFavorite: false,
          isAdventurePartner: false,
          lastActive: "Active recently"
        });
      }
    }

    return baseList;
  }, [friendsData, favoritesData, blockedIds, userId, targetProfileData]);

  const [activeFriend, setActiveFriend] = useState<Companion | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [showInspector, setShowInspector] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [campfireList, setCampfireList] = useState<any[]>(DEFAULT_CAMPFIRES);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);

  // ─── Real-time Chat ────────────────────────────────────────────────────────
  // Use userId from URL param directly — this is the target userId
  // Only actually active on mobile (desktop renders FriendsPage which has its own useChatConversation)
  const currentUserId = useAppSelector((state) => state.auth.userId);
  const {
    messages: realMessages,
    isLoadingMessages,
    sendTextMessage,
    sendSpecialMessage,
    emitTyping,
  } = useChatConversation({ targetUserId: isMobile ? userId : null });
  // ──────────────────────────────────────────────────────────────────────────

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

  const chatStreamRef = useRef<HTMLDivElement>(null);

  // Initialize activeFriend on mount
  useEffect(() => {    if (companions.length > 0) {
      const friend = companions.find(c => c.id === userId || c.username === `@${userId}` || c.username === userId) || companions[0];
      setActiveFriend(friend);
    }
  }, [userId, companions]);

  // Scroll to bottom when real messages update
  useEffect(() => {
    const container = chatStreamRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [realMessages]);

  if (!activeFriend) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-bg text-zinc-400">
        Loading Chat...
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    sendTextMessage(chatInput.trim());
    setChatInput("");
  };

  const handleSendExperience = () => {
    sendSpecialMessage('EXPERIENCE_CARD', {
      title: "Alpine Cliff Dive Experience",
      host: "Bear G.",
      date: "June 29 at 3:00 PM",
      category: "Adventure",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop"
    });
  };

  const handleSendPlan = () => {
    sendSpecialMessage('PLAN_CARD', {
      title: `Weekend Coorg Ridge Trek`,
      date: "June 27-28",
      location: "Kakkabe, Coorg",
      companions: ["Rishiraj", activeFriend?.name ?? ''],
      status: "Planning"
    });
  };

  const handleSendCampfireInvite = (campfire: any) => {
    sendSpecialMessage('CAMPFIRE_INVITE', {
      id: campfire.id,
      title: campfire.title,
      hostName: campfire.hostName,
      hostAvatar: campfire.hostAvatar,
      category: campfire.category
    });
    setShowInviteModal(false);
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-brand-cyan/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="h-2 w-2 rounded-full bg-brand-cyan animate-pulse" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Desktop view rendering the main FriendsPage with the chatId */}
      <div className="hidden lg:block h-screen w-screen overflow-hidden">
        <FriendsPage activeChatId={chatId} />
      </div>

      {/* Mobile view rendering the immersive phone-only full screen chat */}
      <div className="block lg:hidden h-full w-full">
        <div className="flex flex-col h-screen w-screen bg-brand-bg text-white relative overflow-hidden">

      {/* 1. HEADER SECTION */}
      <header className="h-16 w-full border-b border-white/5 px-4 flex items-center justify-between bg-zinc-950/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/profile/friends')}
            className="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white shrink-0 cursor-pointer animate-none"
            title="Go Back"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 animate-none shrink-0" onClick={() => setZoomedAvatar({ url: activeFriend.avatar, name: activeFriend.name })}>
            <CompanionAvatar avatar={activeFriend.avatar} name={activeFriend.name} className="h-8 w-8 text-[11px]" />
          </div>
          <div 
            onClick={() => router.push(`/profile/${activeFriend.username.replace(/^@/, "")}`)}
            className="min-w-0 cursor-pointer group/name"
          >
            <h3 className="text-sm font-black text-white truncate flex items-center gap-1.5 group-hover/name:text-brand-cyan transition-colors">
              {activeFriend.name}
            </h3>
            <p className="text-[9px] text-zinc-500 truncate group-hover/name:text-brand-cyan/80 transition-colors">{activeFriend.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => triggerToast(`Calling ${activeFriend.name}...`)}
            className="p-2 rounded-xl bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Voice Call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-2 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
            title="Invite to Campfire"
          >
            <Flame className="h-4 w-4" /> Invite
          </button>
          <button
            onClick={() => setShowInspector(true)}
            className="p-2 rounded-xl border border-white/5 text-zinc-400 hover:text-white cursor-pointer"
            title="Explorer Info"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. MESSAGES STREAM */}
      <div
        ref={chatStreamRef}
        className="flex-1 py-4 overflow-y-auto space-y-3 custom-scrollbar px-4"
        data-lenis-prevent
      >
        {realMessages.length > 0 ? (
          <div className="space-y-3">
            {realMessages.map((msg) => {
              const isMe = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
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
                    <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-lg w-60 text-left">
                      <div className="h-24 w-full relative">
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
                    <div className="glass-panel border border-white/10 p-3.5 rounded-2xl shadow-lg w-60 text-left space-y-3">
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
                      </div>
                    </div>
                  )}

                  {(msg.type === "campfire_invite" || msg.type === "CAMPFIRE_INVITE") && (
                    <div className="glass-panel border border-brand-cyan/35 bg-zinc-950/90 p-4 rounded-3xl shadow-2xl w-60 text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Flame className="h-2.5 w-2.5 fill-current" /> Campfire Invite
                        </span>
                        <span className="text-[8px] font-mono text-brand-cyan font-black">{msg.metadata?.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2">{msg.metadata?.title}</h4>
                      <button
                        onClick={() => triggerToast(`Joining ${msg.metadata?.title}...`)}
                        className="w-full py-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[10px] font-black rounded-xl transition-all cursor-pointer"
                      >
                        Join Campfire
                      </button>
                    </div>
                  )}

                  {/* Status + timestamp */}
                  <span className="text-[8px] text-zinc-500 mt-1 font-mono flex items-center gap-1">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    {isMe && (
                      <span className={`ml-1 ${
                        msg.status === 'READ' ? 'text-brand-cyan' :
                        msg.status === 'DELIVERED' ? 'text-zinc-400' :
                        msg.status === 'FAILED' ? 'text-rose-500' :
                        'text-zinc-600'
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
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-4 py-8 select-none animate-none">
            {/* Premium enterprise-level glowing SVG illustration representing digital alignment */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              {/* Inner glowing pulse */}
              <div className="absolute inset-0 bg-brand-cyan/5 rounded-full filter blur-xl animate-pulse" />
              
              {/* Custom Animated SVG Illustration */}
              <svg className="w-32 h-32 relative z-10 text-brand-cyan" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Orbital Ring 1 */}
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 4" className="animate-[spin_40s_linear_infinite]" />
                {/* Orbital Ring 2 */}
                <circle cx="100" cy="100" r="50" stroke="url(#cyan-glow-grad-mob)" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="8 6" className="animate-[spin_20s_linear_infinite_reverse]" />
                {/* Orbital Ring 3 */}
                <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                
                {/* Connections */}
                <line x1="100" y1="100" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="100" y1="100" x2="140" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="100" y1="100" x2="100" y2="150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />

                {/* Node 1: User coordinates */}
                <g className="animate-[bounce_3s_ease-in-out_infinite]">
                  <circle cx="60" cy="60" r="8" fill="url(#cyan-glow-grad-mob)" className="shadow-lg shadow-brand-cyan/20" />
                  <circle cx="60" cy="60" r="4" fill="#09090b" />
                </g>
                {/* Node 2: Companion coordinates */}
                <g className="animate-[bounce_4s_ease-in-out_infinite_1s]">
                  <circle cx="140" cy="60" r="10" fill="url(#purple-glow-grad-mob)" />
                  <text x="140" y="63" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">👤</text>
                </g>
                {/* Node 3: Quest target coordinates */}
                <g className="animate-[pulse_2s_infinite]">
                  <circle cx="100" cy="150" r="7" fill="url(#amber-glow-grad-mob)" />
                  <path d="M100 146L103 152L97 152Z" fill="#09090b" />
                </g>

                {/* Center Star / Explorer Compass Emblem */}
                <g className="animate-[pulse_3s_infinite]">
                  <circle cx="100" cy="100" r="16" fill="#09090b" stroke="url(#cyan-glow-grad-mob)" strokeWidth="2" />
                  {/* 4-point Compass Star */}
                  <path d="M100 88L103 97L112 100L103 103L100 112L97 103L88 100L97 97Z" fill="url(#cyan-glow-grad-mob)" />
                </g>

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="cyan-glow-grad-mob" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="purple-glow-grad-mob" x1="120" y1="40" x2="160" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="amber-glow-grad-mob" x1="80" y1="130" x2="120" y2="170" gradientUnits="userSpaceOnUse">
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
      </div>

      {/* 3. INPUT CONTROLS */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2 bg-zinc-950/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
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

      {/* 4. DETAILS OVERLAY PANEL (INSPECTOR) */}
      {showInspector && (
        <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col p-6 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Explorer Profile</span>
            <button
              onClick={() => setShowInspector(false)}
              className="p-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 text-left flex-1">
            {/* Passport Card */}
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-cyan/20 border border-brand-cyan/20 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold text-brand-cyan">
                {activeFriend.compatibility}% match
              </div>
              <div className="flex items-center gap-3">
                <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" onClick={() => setZoomedAvatar({ url: activeFriend.avatar, name: activeFriend.name })}>
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

            {/* Compatibility Breakdown */}
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

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  triggerToast("Explorer reported.");
                  setShowInspector(false);
                }}
                className="w-full py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Flag className="h-3.5 w-3.5" /> Report Explorer
              </button>
              <button
                onClick={() => {
                  if (activeFriend.isFavorite) {
                    removeFavoriteMutation.mutate(activeFriend.id, {
                      onSuccess: () => triggerToast(`Removed ${activeFriend.name} from favorites.`)
                    });
                  } else {
                    addFavoriteMutation.mutate(activeFriend.id, {
                      onSuccess: () => triggerToast(`Added ${activeFriend.name} to favorites!`)
                    });
                  }
                  setActiveFriend(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
                  setShowInspector(false);
                }}
                className="w-full py-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Heart className="h-3.5 w-3.5" /> {activeFriend.isFavorite ? "Unfavorite" : "Favorite"}
              </button>
              <button
                onClick={() => {
                  const target = activeFriend.username ? activeFriend.username.replace('@', '') : activeFriend.id;
                  blockMutation.mutate({ targetUsername: target, reason: "Blocked from chat inspector" }, {
                    onSuccess: () => {
                      triggerToast(`${activeFriend.name} has been blocked.`);
                      router.push('/profile/friends');
                    },
                    onError: () => {
                      triggerToast(`Failed to block ${activeFriend.name}.`);
                    }
                  });
                }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Block Explorer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campfire Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
          <div className="absolute inset-0 cursor-default" onClick={() => setShowInviteModal(false)} />
          
          <div className="glass-panel border border-white/10 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-950/95 overflow-hidden flex flex-col max-h-[85vh]">
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
              Select an active campfire to invite <strong className="text-zinc-200">{activeFriend.name}</strong>. They will receive an interactive card in the chat to join directly.
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
          </div>
        </div>
      )}

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
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer animate-none"
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

        </div>
      </div>
    </>
  );
}
