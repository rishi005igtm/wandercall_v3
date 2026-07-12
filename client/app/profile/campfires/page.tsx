"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket } from "../../../lib/socket";
import {
  useCampfireSearch,
  useStartCampfire,
  useRestartCampfire,
  useDeleteCampfire,
  useToggleReminder,
  useWorkspaceCampfires,
} from "../../../hooks/api/useCampfire";
import { useCampfireSessionManager } from "../../../providers/CampfireSessionProvider";
import { QUERY_KEYS } from "../../../lib/api/queryKeys";
import { useUserProfileQuery } from "../../../hooks/api/useUserQueries";
import { useAppSelector } from "../../../lib/store/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  Users,
  Search,
  Plus,
  Lock,
  Unlock,
  MessageSquare,
  Calendar,
  Play,
  Volume2,
  LogOut,
  Compass,
  Share2,
  Bookmark,
  Award,
  TrendingUp,
  Clock,
  Activity,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  UserPlus,
  LockKeyhole,
  CheckCircle2,
  BookmarkCheck,
  Shield,
  Sliders,
  VolumeX,
  MessageCircle,
  Eye,
  BookOpen,
  Trash2,
  ShieldAlert,
  Copy,
  Check
} from "lucide-react";

// ==========================================
// Interfaces
// ==========================================

interface Speaker {
  id: string;
  name: string;
  avatar: string;
  isSpeaking?: boolean;
  role: "host" | "speaker";
}

interface Listener {
  id: string;
  name: string;
  avatar: string;
  hasHandRaised?: boolean;
}

interface CampfireRoom {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  participantsCount: number;
  speakers: Speaker[];
  listeners: Listener[];
  energyLevel: "Quiet" | "Active" | "Exciting" | "Legendary";
  energyScore: number; // 0-100
  category: "Adventure" | "Food" | "Photography" | "Storytelling" | "Travel" | "Learning";
  mood: "Adventure" | "Deep Discussion" | "Storytelling" | "Learning" | "Casual" | "Travel";
  isPrivate: boolean;
  password?: string;
  duration: string;
  x: number; // SVG universe coordinates
  y: number;
  size: "small" | "medium" | "large";
  status?: "Live" | "Ended" | "Scheduled";
  coverUrl?: string;
}

interface ScheduledCampfire {
  id: string;
  title: string;
  description: string;
  hostName: string;
  hostAvatar: string;
  category: string;
  dateTime: string; // human readable
  dayGroup: "Today" | "Tomorrow" | "This Week" | "This Month";
  interestedCount: number;
  isBookmarked?: boolean;
}

interface ReplayLog {
  id: string;
  title: string;
  hostName: string;
  date: string;
  duration: string;
  listenersCount: number;
  summary: string;
  highlights: string[];
  quotes: string[];
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

// ==========================================
// Mock Datasets & Fallbacks
// ==========================================

const WORKSPACE_JOINED: any[] = [];
const WORKSPACE_SAVED: any[] = [];
const WORKSPACE_BLOCKED: any[] = [];

const REPLAY_LOGS: ReplayLog[] = [
  {
    id: "rep-1",
    title: "Backpacking Solo Across Patagonia",
    hostName: "Mateo Ortiz",
    date: "June 20, 2026",
    duration: "1h 12m",
    listenersCount: 245,
    summary: "In this campfire session, Mateo shares his personal journey hiking the O-Circuit in Patagonia alone, dealing with extreme wind storms, freezing temperatures, and the psychological impact of complete solitude.",
    highlights: [
      "🎒 Packed 12kg pack instead of 20kg - lighter gear saved his ankles.",
      "💨 Experienced winds up to 90km/h on John Gardner Pass, requiring hands-and-knees crawling.",
      "🏔️ Glaciar Grey ice hiking tips: hire local guides for the crevasses."
    ],
    quotes: [
      "\"Patagonia doesn't care about your plans. It will test your spirit and reward you with vistas that defy imagination.\"",
      "\"When you are out there in the freezing rain, the warm soup at the campsite is worth more than any five-star restaurant.\""
    ]
  },
  {
    id: "rep-2",
    title: "How to Travel and Live Anywhere",
    hostName: "Sarah Jenkins",
    date: "June 18, 2026",
    duration: "52m",
    listenersCount: 189,
    summary: "A practical campfire talking about remote working visas, tax implications, digital nomad co-living spaces, and staying sane while changing country every month.",
    highlights: [
      "💻 Reliable Wi-Fi is step zero - never book a place without speed tests.",
      "📝 Visual Nomad Visas: Croatia, Portugal, and Bali updates.",
      "🤝 Community hubs like Selina or local Meetups are crucial to avoid loneliness."
    ],
    quotes: [
      "\"Moving is easy. Finding a community where you belong takes intentional effort.\"",
      "\"Travel is not a vacation anymore; it is a lifestyle. Pace yourself accordingly.\""
    ]
  }
];

const MOCK_DNA_METRICS = {
  Storyteller: 85,
  Listener: 72,
  Teacher: 60,
  Explorer: 94,
  Motivator: 78,
  Host: 65
};

const CATEGORIES = [
  { id: "all", label: "All Topics" },
  { id: "adventure", label: "🏔️ Adventure" },
  { id: "food", label: "🍛 Food" },
  { id: "photography", label: "📸 Photography" },
  { id: "storytelling", label: "🖋️ Storytelling" },
  { id: "travel", label: "✈️ Travel" },
  { id: "learning", label: "🎒 Learning" }
];

const CARD_GRADIENTS = [
  {
    bg: "bg-gradient-to-br from-indigo-950/35 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-indigo"
  },
  {
    bg: "bg-gradient-to-br from-purple-950/35 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-purple"
  },
  {
    bg: "bg-gradient-to-br from-cyan-950/25 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-cyan"
  },
  {
    bg: "bg-gradient-to-br from-emerald-950/25 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-emerald"
  },
  {
    bg: "bg-gradient-to-br from-rose-950/35 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-rose"
  },
  {
    bg: "bg-gradient-to-br from-blue-950/35 via-zinc-900/60 to-zinc-950",
    hover: "shine-card-blue"
  }
];

interface CompanionAvatarProps {
  avatar?: string | null;
  name?: string | null;
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

  const initials = name && name.trim().length > 0 ? name.trim().charAt(0).toUpperCase() : "W";

  if (isUrl && !hasError) {
    return (
      <img
        src={avatar || undefined}
        alt={name || "Explorer"}
        onError={() => setHasError(true)}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${className} rounded-full flex items-center justify-center font-bold shrink-0 select-none ${getHashColor(
        name || "Wanderer"
      )}`}
    >
      {initials}
    </div>
  );
}

const getCardStyle = (id: string) => {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return CARD_GRADIENTS[sum % CARD_GRADIENTS.length];
};

const getProfileUsername = (name: string): string => {
  const normalized = name.trim().toLowerCase();
  if (normalized === "you" || normalized === "rishiraj" || normalized === "rishi005") {
    return "";
  }
  const mappings: { [key: string]: string } = {
    "sara khan": "sara_k",
    "arjun mehta": "arjun_m",
    "divya kapoor": "divya_k",
    "milind soman": "milind_s",
    "ananya rao": "ananya_r",
    "rohit kumar": "rohit_k",
    "zoe chen": "zoe_c",
    "kabir singh": "kabir_s",
    "priya sharma": "priya_s",
    "vikram malhotra": "vikram_m",
    "aisha patel": "aisha_p",
    "rohan joshi": "rohan_j",
    "neha gupta": "neha_g",
    "dev adams": "dev_a",
    "tara sen": "tara_s",
  };
  if (mappings[normalized]) {
    return mappings[normalized];
  }
  for (const [key, val] of Object.entries(mappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }
  return normalized.replace(/\s+/g, "_");
};

export default function CampfiresPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authState = useAppSelector((state) => state.auth);
  const { activeSessionId, leaveRoom } = useCampfireSessionManager();
  const { data: currentUserProfile } = useUserProfileQuery(authState?.userId || null);

  const { data: searchResults, isLoading: isSearchLoading } = useCampfireSearch({ hostId: authState.userId, limit: 100 }, { enabled: !!authState.userId });
  const { data: allDiscoveryResp } = useCampfireSearch({ status: "ACTIVE", limit: 100 });
  const { data: scheduledResp } = useCampfireSearch({ status: "SCHEDULED", limit: 20 });
  const { data: joinedWorkspaceResp } = useWorkspaceCampfires("joined", { enabled: !!authState.userId });
  const { data: savedWorkspaceResp } = useWorkspaceCampfires("saved", { enabled: !!authState.userId });

  const startCampfire = useStartCampfire();
  const restartCampfire = useRestartCampfire();
  const deleteCampfire = useDeleteCampfire();
  const toggleReminder = useToggleReminder();

  // ==========================================
  // States
  // ==========================================
  const [campfires, setCampfires] = useState<CampfireRoom[]>([]);

  useEffect(() => {
    if (allDiscoveryResp?.items) {
      const mapped: CampfireRoom[] = allDiscoveryResp.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || "",
        hostName: item.hostName || "Host",
        hostAvatar: item.hostAvatar || null,
        participantsCount: item.currentListeners || 0,
        speakers: [{ id: item.hostId, name: item.hostName || "Host", avatar: item.hostAvatar || null, role: "host" as const }],
        listeners: [],
        energyLevel: (item.energyLevel || "Active") as any,
        energyScore: item.energyScore || 65,
        category: (item.category || "Adventure") as any,
        mood: (item.mood || "Storytelling") as any,
        isPrivate: item.visibility === "PRIVATE",
        password: item.settings?.password,
        duration: "Live",
        x: 300,
        y: 200,
        size: "medium" as const,
        status: item.status || "Live"
      }));
      setCampfires(mapped);
    } else {
      setCampfires([]);
    }
  }, [allDiscoveryResp]);

  useEffect(() => {
    const socket = connectSocket();

    const handleCampfireEvent = (eventData: any) => {
      queryClient.setQueryData(
        QUERY_KEYS.CAMPFIRES.SEARCH({ status: "ACTIVE", limit: 100 }), 
        (oldData: any) => {
          if (!oldData || !oldData.items) return oldData;
          let items = [...oldData.items];
          
        if (eventData.status === "DELETED" || eventData.status === "ENDED" || eventData.status === "ARCHIVED" || eventData.status === "ENDING" || eventData.type === "DELETED" || eventData.type === "ENDED") {
          const removeId = eventData.id || eventData.data?.id;
          items = items.filter(c => c.id !== removeId);
        } else if (eventData.status === "LIVE" || eventData.status === "ACTIVE" || eventData.type === "STARTED" || eventData.type === "RESTARTED") {
          const dataObj = eventData.data || eventData;
          const index = items.findIndex(c => c.id === dataObj.id);
          if (index > -1) {
            items[index] = { ...items[index], ...dataObj };
          } else {
            items.unshift(dataObj);
          }
        }
        return { ...oldData, items };
      });
      // Invalidate the entire campfire query domain to ensure all workspace lists, counts, and search results refetch automatically
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    };
    
    const events = [
      "campfire:created",
      "campfire:scheduled",
      "campfire:waiting",
      "campfire:started",
      "campfire:ending",
      "campfire:ended",
      "campfire:archived",
      "campfire:updated",
      "room_ended",
      "CAMPFIRE_CREATED",
      "CAMPFIRE_STARTED",
      "CAMPFIRE_ENDED",
      "CAMPFIRE_RESTARTED",
      "CAMPFIRE_DELETED",
      "DISCOVERY_FEED_UPDATED"
    ];

    events.forEach(event => socket.on(event, handleCampfireEvent));

    return () => {
      events.forEach(event => socket.off(event, handleCampfireEvent));
    };
  }, [queryClient]);

  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Navigation & Room Flow
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [joiningRoom, setJoiningRoom] = useState<CampfireRoom | null>(null);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [remindedEvents, setRemindedEvents] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const myWorkspaceRef = useRef<HTMLDivElement>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    triggerToast(`Campfire ID "${id}" copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRoomSlug = (room: CampfireRoom) => {
    const cleanTitle = room.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `${room.id}--${cleanTitle}`;
  };

  const handleRemindMe = async (eventId: string, title: string) => {
    try {
      const res = await toggleReminder.mutateAsync(eventId);
      if (res.reminded) {
        setRemindedEvents(prev => ({ ...prev, [eventId]: true }));
        triggerToast(`Reminder set! You will be notified when "${title}" starts.`);
      } else {
        setRemindedEvents(prev => ({ ...prev, [eventId]: false }));
        triggerToast(`Cancelled reminder for "${title}"`);
      }
    } catch (err) {
      const isAlreadyReminded = remindedEvents[eventId];
      setRemindedEvents(prev => ({ ...prev, [eventId]: !isAlreadyReminded }));
      triggerToast(!isAlreadyReminded ? `Reminder set for "${title}"` : `Cancelled reminder for "${title}"`);
    }
  };


  useEffect(() => {
    if (joiningRoom) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [joiningRoom]);

  // Dashboard Workspace sub-states (hosted, joined, saved, blocked)
  const [myCampfiresTab, setMyCampfiresTab] = useState<"hosted" | "joined" | "saved" | "blocked">("joined");
  const [workspacePage, setWorkspacePage] = useState(1);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);
  const hostedRooms = useMemo(() => {
    if (!searchResults?.items) return [];
    return searchResults.items;
  }, [searchResults]);

  const featuredEventsList = useMemo(() => {
    if (scheduledResp?.items && scheduledResp.items.length > 0) {
      return scheduledResp.items.map((s: any) => ({
        id: s.id,
        tag: "SCHEDULED CAMPFIRE",
        tagBg: "bg-brand-cyan",
        time: s.scheduledStartAt ? new Date(s.scheduledStartAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Upcoming",
        title: s.title,
        description: s.description || "",
        hostName: s.hostName || "Host",
        hostAvatar: s.hostAvatar || null,
        remindersCount: s.participantIds?.length || 0,
        gradientFrom: "from-brand-cyan/20",
        gradientTo: "to-blue-600/10",
      }));
    }
    return [];
  }, [scheduledResp]);

  // Featured Events Active Slide Index (Mobile Only)
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const handlePrevEvent = () => {
    setActiveEventIndex(prev => (prev === 0 ? featuredEventsList.length - 1 : prev - 1));
  };
  const handleNextEvent = () => {
    setActiveEventIndex(prev => (prev === featuredEventsList.length - 1 ? 0 : prev + 1));
  };

  // Voice Room States
  const [isMuted, setIsMuted] = useState(true);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [listenersList, setListenersList] = useState<Listener[]>([]);
  const [activeSpeakersMap, setActiveSpeakersMap] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; avatar: string; text: string; time: string }[]>([
    { id: "msg-1", sender: "Ang Doma", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", text: "The wind is getting high up there!", time: "10:14 PM" },
    { id: "msg-2", sender: "Sarah J.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", text: "Stunning story Tenzing! Thanks for sharing.", time: "10:15 PM" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [roomEnergyState, setRoomEnergyState] = useState<"Quiet" | "Active" | "Exciting" | "Legendary">("Active");



  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset page when tab changes
  useEffect(() => {
    setWorkspacePage(1);
  }, [myCampfiresTab]);

  // ==========================================
  // Effects & Simulations
  // ==========================================

  // Simulate active speaker voice waves and energy pulses inside the voice room
  useEffect(() => {
    if (!joinedRoomId) return;

    const interval = setInterval(() => {
      const speakingMap: Record<string, boolean> = {};
      const activeJoinedRoom = campfires.find(c => c.id === joinedRoomId) || hostedRooms.find(c => c.id === joinedRoomId);
      if (!activeJoinedRoom) return;

      if (Math.random() > 0.6) {
        speakingMap["host"] = true;
      }

      speakersList.forEach((spk) => {
        if (Math.random() > 0.7) {
          speakingMap[spk.id] = true;
        }
      });

      if (!isMuted && Math.random() > 0.5) {
        speakingMap["user"] = true;
      }

      setActiveSpeakersMap(speakingMap);

      const speakCount = Object.keys(speakingMap).length;
      if (speakCount === 0) setRoomEnergyState("Quiet");
      else if (speakCount === 1) setRoomEnergyState("Active");
      else if (speakCount === 2) setRoomEnergyState("Exciting");
      else setRoomEnergyState("Legendary");

    }, 2500);

    return () => clearInterval(interval);
  }, [joinedRoomId, speakersList, isMuted, campfires, hostedRooms]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, joinedRoomId]);

  // Clean emoji particles after duration
  useEffect(() => {
    if (floatingEmojis.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingEmojis(prev => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [floatingEmojis]);

  // Fetch the selected room info when joinedRoomId updates
  const activeRoom = useMemo(() => {
    return campfires.find(c => c.id === joinedRoomId) || hostedRooms.find(c => c.id === joinedRoomId) || null;
  }, [joinedRoomId, campfires, hostedRooms]);

  // Initialize room participants when joining
  const handleJoinRoom = (room: CampfireRoom) => {
    if (activeSessionId && activeSessionId !== room.id && authState?.userId) {
      leaveRoom(activeSessionId, authState.userId);
    }

    if (room.isPrivate) {
      setJoiningRoom(room);
      setPasscodeInput("");
      setPasscodeError(false);
      return;
    }

    router.push(`/profile/campfires/${getRoomSlug(room)}`);
  };

  const handlePasswordSubmit = () => {
    if (joiningRoom && passcodeInput === joiningRoom.password) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`authorized_campfire_${joiningRoom.id}`, "true");
      }
      setJoiningRoom(null);
      setPasscodeInput("");
      setPasscodeError(false);
      router.push(`/profile/campfires/${getRoomSlug(joiningRoom)}`);
    } else {
      setPasscodeError(true);
      setPasscodeInput("");
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  const handleLeaveRoom = () => {
    setJoinedRoomId(null);
  };

  // Add emoji reaction
  const triggerEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const x = 50 + (Math.random() * 80 - 40); // center scattered
    const y = -100; // float upwards
    setFloatingEmojis(prev => [...prev, { id, emoji, x, y }]);
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        text: chatInput,
        time: timeStr
      }
    ]);
    setChatInput("");
  };




  // Delete Hosted Room
  const handleDeleteHosted = async (id: string) => {
    try {
      await deleteCampfire.mutateAsync(id);
      triggerToast("Campfire deleted successfully.");
    } catch (e) {
      triggerToast("Failed to delete campfire.");
    }
  };

  // Discovery Filtered Campfires
  const filteredCampfires = useMemo(() => {
    return campfires.filter(c => {
      if ((c as any).status === "ENDED" || (c as any).status === "ARCHIVED" || (c as any).status === "DELETED" || (c as any).duration === "Ended") {
        return false;
      }
      const matchQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === "all" || c.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchQuery && matchCategory;
    });
  }, [campfires, searchQuery, selectedCategory]);

  // Paginated Items calculations for the workspace section
  const currentItems = useMemo(() => {
    if (myCampfiresTab === "hosted") return hostedRooms;
    if (myCampfiresTab === "joined") return (joinedWorkspaceResp as any) || WORKSPACE_JOINED;
    if (myCampfiresTab === "blocked") return WORKSPACE_BLOCKED;
    return (savedWorkspaceResp as any) || WORKSPACE_SAVED;
  }, [myCampfiresTab, hostedRooms, joinedWorkspaceResp, savedWorkspaceResp]);


  const itemsPerPage = 3;

  const totalPages = useMemo(() => {
    return Math.ceil(currentItems.length / itemsPerPage) || 1;
  }, [currentItems]);

  const paginatedItems = useMemo(() => {
    const startIdx = (workspacePage - 1) * itemsPerPage;
    return currentItems.slice(startIdx, startIdx + itemsPerPage);
  }, [currentItems, workspacePage]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 text-white">
      <AnimatePresence mode="wait">
        {/* =======================================================
            VIEW A: IMMERSIVE ACTIVE VOICE ROOM EXPERIENCE
            ======================================================= */}
        {joinedRoomId && activeRoom ? (
          <motion.div
            key="voice-room"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full flex flex-col gap-6"
          >
            {/* Header Area */}
            <div className="flex items-center justify-between glass-panel p-4 rounded-2xl glass-glow-indigo">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-zinc-950/80 border border-white/10 shrink-0">
                  <Flame className="h-6 w-6 text-brand-amber animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl bg-brand-amber blur-md opacity-25" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan">
                      {activeRoom.category} Campfire
                    </span>
                    {(('visibility' in activeRoom && activeRoom.visibility === "PRIVATE") || ('isPrivate' in activeRoom && activeRoom.isPrivate)) && (
                      <span className="flex items-center gap-1 text-[9px] bg-brand-purple/20 text-brand-purple px-1.5 py-0.5 rounded-full border border-brand-purple/30">
                        <Lock className="h-2.5 w-2.5" /> Private
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1">
                    {activeRoom.title}
                  </h1>
                </div>
              </div>

              {/* Status & Settings */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400">
                  <Activity className="h-3.5 w-3.5 text-brand-emerald" />
                  <span>Energy:</span>
                  <span className="font-bold text-white">{roomEnergyState}</span>
                </div>
                <button
                  onClick={handleLeaveRoom}
                  className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Leave Campfire
                </button>
              </div>
            </div>

            {/* Layout Grid: Centered Ring + Chat Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[580px]">

              {/* Circular Campfire Core Area */}
              <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden min-h-[500px]">
                {/* Space Coordinates Background Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.06),transparent_70%)] pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Subtitle / Topic Description Banner */}
                {activeRoom.description && activeRoom.description.trim() !== "" && activeRoom.description.trim() !== "No description provided." && activeRoom.description.trim() !== "Join us for an exciting conversation around the digital fire." && (
                  <div className="text-center z-10 max-w-lg mx-auto bg-black/40 border border-white/5 backdrop-blur-md px-4 py-2 rounded-2xl">
                    <p className="text-xs text-zinc-300 italic line-clamp-2">
                      "{activeRoom.description.trim()}"
                    </p>
                  </div>
                )}

                {/* THE SOCIAL CIRCLE GRAPH CONTAINER */}
                <div className="relative flex-1 flex items-center justify-center min-h-[360px] w-full">

                  {/* Central Campfire Core */}
                  <div className="relative z-10 flex flex-col items-center justify-center">

                    {/* Pulsing Backglow circles */}
                    <div className={`absolute h-48 w-48 rounded-full blur-3xl transition-all duration-1000 ${roomEnergyState === "Quiet" ? "bg-brand-amber/10 opacity-30" :
                      roomEnergyState === "Active" ? "bg-brand-amber/20 opacity-50" :
                        roomEnergyState === "Exciting" ? "bg-brand-amber/35 opacity-70" :
                          "bg-brand-purple/40 opacity-90"
                      }`} />

                    {/* SVG Glowing Fire Core */}
                    <motion.div
                      animate={{
                        scale: roomEnergyState === "Quiet" ? 0.95 :
                          roomEnergyState === "Active" ? 1.05 :
                            roomEnergyState === "Exciting" ? 1.2 :
                              1.35
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      className="relative h-28 w-28 flex items-center justify-center cursor-pointer"
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                        {/* Outer fire layer */}
                        <motion.path
                          d="M50 15 C30 45, 20 65, 20 80 C20 95, 80 95, 80 80 C80 65, 70 45, 50 15 Z"
                          fill="url(#fireGradientOuter)"
                          animate={{
                            d: [
                              "M50 15 C30 45, 20 65, 20 80 C20 95, 80 95, 80 80 C80 65, 70 45, 50 15 Z",
                              "M50 12 C28 47, 18 63, 18 80 C18 97, 82 97, 82 80 C82 63, 72 47, 50 12 Z",
                              "M50 17 C32 43, 22 67, 22 80 C22 93, 78 93, 78 80 C78 67, 68 43, 50 17 Z"
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        />
                        {/* Middle fire layer */}
                        <motion.path
                          d="M50 30 C38 52, 30 68, 30 80 C30 90, 70 90, 70 80 C70 68, 62 52, 50 30 Z"
                          fill="url(#fireGradientMiddle)"
                          animate={{
                            d: [
                              "M50 30 C38 52, 30 68, 30 80 C30 90, 70 90, 70 80 C70 68, 62 52, 50 30 Z",
                              "M50 26 C36 55, 28 66, 28 80 C28 92, 72 92, 72 80 C72 66, 64 55, 50 26 Z",
                              "M50 32 C40 50, 32 70, 32 80 C32 88, 68 88, 68 80 C68 70, 60 50, 50 32 Z"
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                        />
                        {/* Inner hot core */}
                        <motion.path
                          d="M50 48 C44 62, 38 72, 38 80 C38 86, 62 86, 62 80 C62 72, 56 62, 50 48 Z"
                          fill="url(#fireGradientInner)"
                          animate={{
                            d: [
                              "M50 48 C44 62, 38 72, 38 80 C38 86, 62 86, 62 80 C62 72, 56 62, 50 48 Z",
                              "M50 45 C42 64, 36 70, 36 80 C36 88, 64 88, 64 80 C64 70, 58 64, 50 45 Z",
                              "M50 50 C45 60, 40 73, 40 80 C40 85, 60 85, 60 80 C60 73, 55 60, 50 50 Z"
                            ]
                          }}
                          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut", delay: 0.4 }}
                        />

                        <defs>
                          <linearGradient id="fireGradientOuter" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#DC2626" />
                            <stop offset="40%" stopColor="#EA580C" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="fireGradientMiddle" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#EA580C" />
                            <stop offset="60%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="fireGradientInner" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="50%" stopColor="#FDE047" />
                            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Floating fire embers */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[1, 2, 3, 4].map((n) => (
                          <motion.div
                            key={n}
                            className="absolute bg-brand-amber rounded-full"
                            style={{
                              width: Math.random() * 5 + 3,
                              height: Math.random() * 5 + 3,
                              bottom: "20%",
                              left: `${35 + Math.random() * 30}%`,
                            }}
                            animate={{
                              y: [-10, -80 - Math.random() * 40],
                              x: [0, (Math.random() - 0.5) * 30],
                              opacity: [0.8, 0],
                              scale: [1, 0.4]
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5 + Math.random() * 1.5,
                              delay: n * 0.4,
                              ease: "easeOut"
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Campfire logs */}
                    <div className="w-16 h-3 bg-amber-950/90 rounded-md border-b-2 border-stone-900/60 shadow-lg relative -mt-1 flex items-center justify-between px-1">
                      <div className="w-8 h-2 bg-stone-800 rotate-12 rounded-sm origin-center" />
                      <div className="w-8 h-2 bg-stone-850 -rotate-12 rounded-sm origin-center" />
                    </div>
                  </div>

                  {/* RINGS AND PARTICIPANTS */}
                  {/* Outer Orbit Path Guide */}
                  <div className="absolute border border-white/5 rounded-full w-[200px] h-[200px] pointer-events-none" />
                  <div className="absolute border border-white/[0.02] rounded-full w-[360px] h-[360px] pointer-events-none" />

                  {/* HOST (Always top center, e.g. radius=100, angle=270deg) */}
                  <div
                    className="absolute z-20 transition-all duration-300"
                    style={{
                      transform: "translate(-50%, -50%)",
                      top: "calc(50% - 105px)",
                      left: "50%"
                    }}
                  >
                    {(() => {
                      const isUserHostRoom = activeRoom && ('hostId' in activeRoom ? activeRoom.hostId === authState?.userId : false);
                      const hostFallbackName = isUserHostRoom ? (currentUserProfile?.displayName || authState?.name || "You (Host)") : "Host";
                      const hostFallbackAvatar = isUserHostRoom ? (currentUserProfile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80") : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                      const finalHostName = (isUserHostRoom && currentUserProfile?.displayName) ? currentUserProfile.displayName : ((activeRoom.hostName && activeRoom.hostName !== "Wanderer" && activeRoom.hostName !== "Host") ? activeRoom.hostName : hostFallbackName);
                      const finalHostAvatar = (isUserHostRoom && currentUserProfile?.avatarUrl) ? currentUserProfile.avatarUrl : (activeRoom.hostAvatar || hostFallbackAvatar);

                      return (
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            {/* Audio Wave Glow if Speaking */}
                            {activeSpeakersMap["host"] && (
                              <div className="absolute -inset-2 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 animate-ping" />
                            )}
                            <div
                              onClick={() => setZoomedAvatar({ url: finalHostAvatar, name: finalHostName })}
                              className={`h-16 w-16 rounded-full border-2 cursor-pointer hover:scale-105 active:scale-95 shrink-0 overflow-hidden select-none ${
                                activeSpeakersMap["host"] ? "border-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.6)]" : "border-brand-purple"
                              }`}
                            >
                              <CompanionAvatar
                                avatar={finalHostAvatar}
                                name={finalHostName}
                                className="h-full w-full text-2xl"
                              />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-brand-purple text-[8px] uppercase tracking-wider font-extrabold px-1 py-0.5 rounded border border-zinc-950">
                              Host
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-300 mt-2 font-bold max-w-[80px] truncate text-center bg-black/40 px-1.5 py-0.5 rounded">
                            {finalHostName}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SPEAKERS (Inner Ring, radius=100px) */}
                  {speakersList.filter(s => s.role !== "host" && s.id !== "user").map((speaker, index, arr) => {
                    const count = arr.length;
                    const baseAngle = 180 / (count + 1);
                    const angle = 180 + (index + 1) * baseAngle; // degrees
                    const rad = (angle * Math.PI) / 180;
                    const radius = 100;
                    const x = Math.cos(rad) * radius;
                    const y = Math.sin(rad) * radius;

                    const isSpeaking = activeSpeakersMap[speaker.id];

                    return (
                      <div
                        key={speaker.id}
                        className="absolute z-20 transition-all duration-300"
                        style={{
                          transform: "translate(-50%, -50%)",
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            {isSpeaking && (
                              <div className="absolute -inset-1.5 rounded-full bg-brand-cyan/25 border border-brand-cyan/30 animate-pulse" />
                            )}
                            <div
                              onClick={() => setZoomedAvatar({ url: speaker.avatar, name: speaker.name })}
                              className={`h-12 w-12 rounded-full border-2 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden shrink-0 select-none ${
                                isSpeaking ? "border-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "border-white/20"
                              }`}
                            >
                              <CompanionAvatar
                                avatar={speaker.avatar}
                                name={speaker.name}
                                className="h-full w-full text-lg"
                              />
                            </div>
                            {isSpeaking && (
                              <div className="absolute -bottom-1 -right-1 bg-brand-cyan text-white p-0.5 rounded-full">
                                <Volume2 className="h-3 w-3 animate-bounce" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-300 mt-1 font-semibold max-w-[70px] truncate text-center bg-black/30 px-1 py-0.5 rounded">
                            {speaker.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* USER (Active Speaker in Inner Ring, e.g. at angle=0deg, radius=100) */}
                  <div
                    className="absolute z-20 transition-all duration-300"
                    style={{
                      transform: "translate(-50%, -50%)",
                      left: "calc(50% + 100px)",
                      top: "50%"
                    }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        {activeSpeakersMap["user"] && (
                          <div className="absolute -inset-1.5 rounded-full bg-brand-cyan/25 border border-brand-cyan/30 animate-pulse" />
                        )}
                        <div
                          onClick={() => setZoomedAvatar({ url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", name: "You" })}
                          className={`h-12 w-12 rounded-full border-2 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden shrink-0 select-none ${
                            !isMuted ? "border-brand-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]" : "border-white/10"
                          }`}
                        >
                          <CompanionAvatar
                            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                            name="You"
                            className="h-full w-full text-lg"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-zinc-950/80 p-0.5 rounded-full border border-white/10">
                          {isMuted ? (
                            <MicOff className="h-3 w-3 text-rose-400" />
                          ) : (
                            <Mic className="h-3 w-3 text-brand-emerald" />
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-brand-cyan mt-1 font-bold bg-black/40 px-1 py-0.5 rounded">
                        You
                      </span>
                    </div>
                  </div>

                  {/* LISTENERS (Outer Ring, radius=180px) */}
                  {listenersList.map((listener, index) => {
                    const count = listenersList.length;
                    const baseAngle = 360 / count;
                    const angle = index * baseAngle + 45; // stagger angle
                    const rad = (angle * Math.PI) / 180;
                    const radius = 180;
                    const x = Math.cos(rad) * radius;
                    const y = Math.sin(rad) * radius;

                    return (
                      <div
                        key={listener.id}
                        className="absolute z-10 transition-all duration-300"
                        style={{
                          transform: "translate(-50%, -50%)",
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`
                        }}
                      >
                        <div className="flex flex-col items-center">
                          <div className="relative">
                            <div
                              onClick={() => setZoomedAvatar({ url: listener.avatar, name: listener.name })}
                              className="h-9 w-9 rounded-full border border-white/5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:scale-105 active:scale-95 overflow-hidden shrink-0 select-none"
                            >
                              <CompanionAvatar
                                avatar={listener.avatar}
                                name={listener.name}
                                className="h-full w-full text-sm"
                              />
                            </div>
                            {listener.hasHandRaised && (
                              <div className="absolute -top-1 -right-1 bg-brand-amber text-[8px] p-0.5 rounded-full font-bold">
                                ✋
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 max-w-[60px] truncate text-center bg-black/10 px-1 rounded">
                            {listener.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* FLOATING EMOJIS LAYER */}
                  <div className="absolute inset-0 pointer-events-none z-30">
                    <AnimatePresence>
                      {floatingEmojis.map((e) => (
                        <motion.div
                          key={e.id}
                          initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
                          animate={{
                            opacity: [1, 1, 0],
                            scale: [0.8, 1.4, 1],
                            y: -220,
                            x: e.x
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.8, ease: "easeOut" }}
                          className="absolute text-3xl"
                          style={{
                            left: "calc(50% - 15px)",
                            top: "calc(50% - 15px)"
                          }}
                        >
                          {e.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* BOTTOM CONTROL PANEL */}
                <div className="z-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-950/70 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
                  {/* Left Side: Mic Action */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${isMuted
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                        : "bg-brand-emerald hover:bg-brand-emerald/90 text-white shadow-lg shadow-brand-emerald/20"
                        }`}
                    >
                      {isMuted ? (
                        <>
                          <MicOff className="h-4 w-4" /> Muted (Click to talk)
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" /> Speaking Live
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setHasRaisedHand(!hasRaisedHand)}
                      className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${hasRaisedHand
                        ? "bg-brand-amber/20 border-brand-amber text-brand-amber"
                        : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                        }`}
                      title="Request to speak"
                    >
                      <span className="text-lg">✋</span>
                    </button>
                  </div>

                  {/* Middle: Floating Reactions Toolbar */}
                  <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5">
                    {["🔥", "👏", "😂", "❤️", "😮"].map((emo) => (
                      <button
                        key={emo}
                        onClick={() => triggerEmoji(emo)}
                        className="h-8 w-8 text-lg rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>

                  {/* Right Side: Host Utility Panel Demo */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      Host Tools:
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-lg bg-white/[0.02] border border-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Invite Friends">
                        <UserPlus className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.02] border border-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Mute All Speakers">
                        <VolumeX className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.02] border border-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Room Locks">
                        <LockKeyhole className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat & Logs Drawer Right */}
              <div className="glass-panel rounded-3xl p-5 flex flex-col justify-between overflow-hidden min-h-[500px] border border-white/5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-brand-cyan" />
                    <span className="text-sm font-bold text-white">Campfire Chat</span>
                  </div>
                  <span className="text-[10px] bg-brand-cyan/15 text-brand-cyan px-2 py-0.5 rounded-full font-bold">
                    {chatMessages.length} Messages
                  </span>
                </div>

                {/* Message list container */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 max-h-[360px]">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3 text-xs">
                      {msg.sender === "Campfire Keeper" ? (
                        <div className="bg-brand-purple/10 border border-brand-purple/20 p-2.5 rounded-xl w-full text-zinc-300">
                          <p className="font-semibold text-brand-purple mb-0.5 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> System Log
                          </p>
                          <p>{msg.text}</p>
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={() => setZoomedAvatar({ url: msg.avatar, name: msg.sender })}
                            className="h-8 w-8 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                          >
                            <CompanionAvatar
                              avatar={msg.avatar}
                              name={msg.sender}
                              className="h-full w-full text-xs"
                            />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-200">{msg.sender}</span>
                              <span className="text-[9px] text-zinc-500">{msg.time}</span>
                            </div>
                            <p className="text-zinc-400 bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-xl break-all">
                              {msg.text}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type campfire thoughts..."
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-purple/50 text-white placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    className="h-9 w-9 bg-brand-purple hover:bg-brand-purple/90 rounded-xl flex items-center justify-center transition-colors cursor-pointer text-white"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          /* =======================================================
              VIEW B: COMPREHENSIVE VOICE DASHBOARD & COMMAND HUB
              ======================================================= */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Page Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    Digital Campfires
                  </h1>
                  <span className="text-[10px] md:text-xs font-semibold bg-brand-purple/20 border border-brand-purple/40 text-brand-purple px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Radio className="h-3 w-3 animate-pulse" /> Live Voice Rooms
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Wandercall story circles, adventure gatherings, and real-time community sharing. Gather round the digital fire.
                </p>
              </div>

              {/* Host CTA */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMyCampfiresTab("hosted");
                    myWorkspaceRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:border-white/20 transition-all cursor-pointer"
                >
                  <Radio className="h-4 w-4 text-brand-cyan animate-pulse" /> My Campfires
                </button>
                <button
                  onClick={() => router.push("/profile/campfires/create")}
                  className="flex items-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-brand-indigo/20 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Light a Campfire
                </button>
              </div>
            </div>

            {/* SECTION 1: CAMPFIRE COMMAND CENTER (Unified strip) */}
            <div className="glass-panel rounded-2xl p-4 md:p-6 glass-glow-indigo">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/5 gap-4 md:gap-0">

                {/* Metric 1 */}
                <div className="flex flex-col justify-center items-center md:items-start md:px-6 py-2 md:py-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Radio className="h-3 w-3 text-brand-cyan" /> Live Universe
                  </span>
                  <span className="text-2xl font-black text-white mt-1">
                    {campfires.length} Rooms
                  </span>
                  <span className="text-[9px] text-brand-cyan/80 mt-0.5">
                    54 explorers active
                  </span>
                </div>

                {/* Metric 2 */}
                <div className="flex flex-col justify-center items-center md:items-start md:px-6 py-2 md:py-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Users className="h-3 w-3 text-brand-purple" /> Friends Active
                  </span>
                  <span className="text-2xl font-black text-white mt-1">
                    8 Online
                  </span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">
                    4 in "Under Himalayan Stars"
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="flex flex-col justify-center items-center md:items-start md:px-6 py-2 md:py-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <BookmarkCheck className="h-3.5 w-3.5 text-brand-emerald" /> Rooms Joined
                  </span>
                  <span className="text-2xl font-black text-white mt-1">
                    42 Circles
                  </span>
                  <span className="text-[9px] text-brand-emerald/80 mt-0.5">
                    +3 this week
                  </span>
                </div>

                {/* Metric 4 */}
                <div className="flex flex-col justify-center items-center md:items-start md:px-6 py-2 md:py-0">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-brand-amber" /> Stories Shared
                  </span>
                  <span className="text-2xl font-black text-white mt-1">
                    18 Stories
                  </span>
                  <span className="text-[9px] text-brand-amber/80 mt-0.5">
                    4 legendary badges
                  </span>
                </div>

                {/* Metric 5 */}
                <div className="flex flex-col justify-center items-center md:items-start md:px-6 py-2 md:py-0 col-span-2 md:col-span-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-rose-400" /> Voice Rank
                  </span>
                  <span className="text-2xl font-black text-white mt-1">
                    Guide Lvl 4
                  </span>
                  <span className="text-[9px] text-rose-400/80 mt-0.5">
                    Next level at 900 XP
                  </span>
                </div>

              </div>
            </div>

            {/* SECTION 3: FEATURED CAMPFIRES (Immersive Carousel) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-brand-purple" /> Featured Scheduled Events
                  </h2>
                  <p className="text-[10px] text-zinc-500">
                    Host stories, epic adventures, and live community panels you shouldn't miss.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevEvent}
                    className="p-1 rounded bg-white/[0.02] border border-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextEvent}
                    className="p-1 rounded bg-white/[0.02] border border-white/5 text-zinc-500 hover:text-white transition-colors cursor-pointer active:scale-95"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Carousel Container */}
              {featuredEventsList.length === 0 ? (
                <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-8 text-center text-zinc-500">
                  <Compass className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
                  <p className="text-sm font-semibold text-zinc-400">No scheduled campfires upcoming</p>
                  <p className="text-xs text-zinc-500 mt-1">Be the first to schedule a campfire session for the community!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile View: Shows one card at a time with full width */}
                  <div className="block md:hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeEventIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`w-full glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[190px] bg-gradient-to-br from-zinc-950/60 ${(featuredEventsList[activeEventIndex] || featuredEventsList[0]).gradientTo}`}
                      >
                        <div className={`absolute top-0 right-0 ${(featuredEventsList[activeEventIndex] || featuredEventsList[0]).tagBg} text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-bl-2xl`}>
                          {(featuredEventsList[activeEventIndex] || featuredEventsList[0]).tag}
                        </div>

                        <div className="space-y-4">
                          <div className="text-[9px] text-brand-cyan uppercase tracking-widest font-bold">
                            {(featuredEventsList[activeEventIndex] || featuredEventsList[0]).time}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white line-clamp-1">
                              {(featuredEventsList[activeEventIndex] || featuredEventsList[0]).title}
                            </h3>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">
                              {(featuredEventsList[activeEventIndex] || featuredEventsList[0]).description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() => setZoomedAvatar({ url: (featuredEventsList[activeEventIndex] || featuredEventsList[0]).hostAvatar, name: (featuredEventsList[activeEventIndex] || featuredEventsList[0]).hostName })}
                              className="h-8 w-8 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                            >
                              <CompanionAvatar
                                avatar={(featuredEventsList[activeEventIndex] || featuredEventsList[0]).hostAvatar}
                                name={(featuredEventsList[activeEventIndex] || featuredEventsList[0]).hostName}
                                className="h-full w-full text-xs"
                              />
                            </div>
                            <div>
                              <p className="text-[8px] text-zinc-500">Host</p>
                              <p className="text-[10px] font-bold text-white">{(featuredEventsList[activeEventIndex] || featuredEventsList[0]).hostName}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemindMe((featuredEventsList[activeEventIndex] || featuredEventsList[0]).id, (featuredEventsList[activeEventIndex] || featuredEventsList[0]).title)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center border ${
                              remindedEvents[(featuredEventsList[activeEventIndex] || featuredEventsList[0]).id]
                                ? "bg-brand-cyan/15 hover:bg-brand-cyan/20 text-brand-cyan border-brand-cyan/35"
                                : "bg-white/5 hover:bg-white/15 text-white border-white/10"
                            }`}
                          >
                            {remindedEvents[(featuredEventsList[activeEventIndex] || featuredEventsList[0]).id] && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                            {remindedEvents[(featuredEventsList[activeEventIndex] || featuredEventsList[0]).id] ? "Reminded" : "Remind Me"}
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Desktop View: Shows all cards in scrolling container */}
                  <div className="hidden md:flex items-stretch gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                    {featuredEventsList.map((event) => (
                      <div
                        key={event.id}
                        className={`snap-start min-w-[340px] max-w-[340px] glass-panel rounded-3xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-zinc-950/60 ${event.gradientTo}`}
                      >
                        <div className={`absolute top-0 right-0 ${event.tagBg} text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-bl-2xl`}>
                          {event.tag}
                        </div>

                        <div className="space-y-4">
                          <div className="text-[9px] text-brand-cyan uppercase tracking-widest font-bold">
                            {event.time}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white line-clamp-1">
                              {event.title}
                            </h3>
                            <p className="text-[11px] text-zinc-400 line-clamp-2">
                              {event.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() => setZoomedAvatar({ url: event.hostAvatar, name: event.hostName })}
                              className="h-8 w-8 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                            >
                              <CompanionAvatar
                                avatar={event.hostAvatar}
                                name={event.hostName}
                                className="h-full w-full text-xs"
                              />
                            </div>
                            <div>
                              <p className="text-[8px] text-zinc-500">Host</p>
                              <p className="text-[10px] font-bold text-white">{event.hostName}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemindMe(event.id, event.title)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center border ${
                              remindedEvents[event.id]
                                ? "bg-brand-cyan/15 hover:bg-brand-cyan/20 text-brand-cyan border-brand-cyan/35"
                                : "bg-white/5 hover:bg-white/15 text-white border-white/10"
                            }`}
                          >
                            {remindedEvents[event.id] && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                            {remindedEvents[event.id] ? "Reminded" : "Remind Me"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: CAMPFIRE DISCOVERY (Modern Search + Category filter tags) */}
            <div className="space-y-4">
              <div>
                <h2 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                  <Search className="h-4 w-4 text-brand-cyan" /> Discover Live Campfires
                </h2>
                <p className="text-[10px] text-zinc-500">
                  Search by title, host, adventure theme, or filter by specific explorer categories.
                </p>
              </div>

              {/* Search input ribbon */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by topic, host, language, or adventure category..."
                    className="w-full bg-zinc-950 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filters tags */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${selectedCategory === cat.id
                      ? "bg-brand-cyan text-zinc-950 border-brand-cyan shadow-sm shadow-brand-cyan/15"
                      : "bg-white/[0.02] text-zinc-400 border-white/5 hover:text-white hover:border-white/10"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Discovery results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampfires.length > 0 ? (
                  filteredCampfires.map((room) => {
                    const cardStyle = getCardStyle(room.id);
                    return (
                      <div
                        key={room.id}
                        className={`rounded-3xl p-5 border border-white/5 flex flex-col justify-between transition-all group shine-card ${cardStyle.bg} ${cardStyle.hover}`}
                      >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan bg-brand-cyan/15 px-2 py-0.5 rounded-full">
                              {room.category}
                            </span>
                            <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                              room.isPrivate
                                ? "bg-rose-500/10 text-rose-450 border-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-450 border-emerald-500/20"
                            }`}>
                              {room.isPrivate ? (
                                <>
                                  <Lock className="h-2 w-2" /> Private
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-2 w-2" /> Public
                                </>
                              )}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-brand-purple" /> {room.duration}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-white group-hover:text-brand-cyan transition-colors line-clamp-1">
                            {room.title}
                          </h3>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {room.description}
                          </p>
                        </div>

                        {/* Copyable ID Tag */}
                        <div className="flex items-center justify-between gap-2 text-[10px] text-zinc-400 font-mono bg-zinc-950/40 border border-white/5 hover:border-white/10 px-3 py-1.5 rounded-xl transition-all">
                          <div className="flex items-center gap-1 text-zinc-500">
                            <span>ID:</span>
                            <span className="font-bold text-zinc-300 select-all">{room.id}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(e, room.id)}
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy Campfire ID"
                          >
                            {copiedId === room.id ? (
                              <Check className="h-3 w-3 text-brand-emerald" />
                            ) : (
                              <Copy className="h-3 w-3 text-zinc-400" />
                            )}
                          </button>
                        </div>

                        {/* Gathered Users */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 bg-black/20 p-2 rounded-xl border border-white/5">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-zinc-400" /> {room.participantsCount} online
                          </span>
                          <span className="text-brand-amber font-bold flex items-center gap-1">
                            🔥 {room.energyLevel}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setZoomedAvatar({ url: room.hostAvatar, name: room.hostName });
                            }}
                            className="h-8 w-8 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                          >
                            <CompanionAvatar
                              avatar={room.hostAvatar}
                              name={room.hostName}
                              className="h-full w-full text-xs"
                            />
                          </div>
                          <div>
                            <p className="text-[8px] text-zinc-500">Host</p>
                            <p className="text-[10px] font-bold text-white">{room.hostName}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (activeSessionId === room.id) {
                              router.push(`/profile/campfires/${getRoomSlug(room)}`);
                            } else {
                              handleJoinRoom(room);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                            activeSessionId === room.id 
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border-emerald-500/30" 
                              : "bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border-brand-cyan/20"
                          }`}
                        >
                          {room.isPrivate && <Lock className="h-3.5 w-3.5" />} 
                          {activeSessionId === room.id ? "Joined" : "Join Circle"}
                        </button>
                      </div>
                    </div>
                  );
                })
                ) : (
                  <div className="col-span-full bg-white/[0.01] border border-white/5 rounded-3xl p-12 text-center text-zinc-500">
                    <Compass className="h-10 w-10 mx-auto text-zinc-650 mb-3" />
                    <p className="text-sm font-semibold text-zinc-400">No live campfires matching your filter</p>
                    <p className="text-xs text-zinc-500 mt-1">Try selecting another topic or clear the search query.</p>
                  </div>
                )}
              </div>
            </div>

            {/* TWO SECTION GRID: MY CAMPFIRES + REPLAYS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

              {/* SECTION 8: MY CAMPFIRES WORKSPACE (Redesigned 2-panel Layout with Pagination) */}
              <div ref={myWorkspaceRef} className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between min-h-[410px]">
                <div className="space-y-4 flex-1 flex flex-col">

                  {/* Title & Subtitle */}
                  <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                    <div>
                      <h2 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                        <BookmarkCheck className="h-4 w-4 text-brand-emerald" /> My Campfires Workspace
                      </h2>
                      <p className="text-[10px] text-zinc-500">
                        Manage your hosted rooms, joined histories, and saved wishlist.
                      </p>
                    </div>

                    {/* Pulsing indicator */}
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
                    </span>
                  </div>

                  {/* 2-Panel Content Layout */}
                  <div className="flex flex-col md:flex-row gap-5 items-stretch flex-1">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                      @media (min-width: 768px) {
                        .workspace-left-panel {
                          width: 130px !important;
                          min-width: 130px !important;
                          max-width: 130px !important;
                          border-bottom-width: 0px !important;
                          border-right-width: 1px !important;
                          padding-bottom: 0px !important;
                          padding-right: 16px !important;
                        }
                        .workspace-right-panel {
                          min-width: 0px !important;
                          flex: 1 1 0% !important;
                        }
                      }
                      .workspace-action-btn {
                        padding-left: 20px !important;
                        padding-right: 20px !important;
                        height: 32px !important;
                        display: inline-flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        white-space: nowrap !important;
                      }
                    `}} />

                    {/* Left Panel: Navigation buttons (hosted, joined, saved, blocked) */}
                    <div className="workspace-left-panel w-full flex flex-row md:flex-col gap-1 md:gap-1.5 shrink-0 border-b border-white/5 pb-3">
                      {(["hosted", "joined", "saved", "blocked"] as const).map((tab) => {
                        const count =
                          tab === "hosted" ? hostedRooms.length :
                            tab === "joined" ? ((joinedWorkspaceResp as any[])?.length || 0) :
                              tab === "saved" ? ((savedWorkspaceResp as any[])?.length || 0) :
                                WORKSPACE_BLOCKED.length;

                        const Icon =
                          tab === "hosted" ? Radio :
                            tab === "joined" ? Compass :
                              tab === "saved" ? Bookmark :
                                ShieldAlert;

                        const isTabActive = myCampfiresTab === tab;

                        return (
                          <button
                            key={tab}
                            onClick={() => setMyCampfiresTab(tab)}
                            className={`flex items-center justify-between flex-1 md:w-full px-1 py-1 md:px-2 md:py-1 rounded-xl capitalize font-bold text-[9px] md:text-[11px] transition-all cursor-pointer min-w-0 group ${isTabActive
                              ? "bg-brand-emerald text-zinc-950 border border-brand-emerald/20 shadow-md shadow-brand-emerald/10 scale-102"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                              }`}
                          >
                            <div className="flex items-center gap-1 md:gap-1.5 min-w-0">
                              <Icon className={`h-3 w-3 shrink-0 ${isTabActive ? "text-zinc-950" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                              <span className="truncate">{tab}</span>
                            </div>
                            <span className={`text-[7px] md:text-[8px] font-mono px-1 py-0.2 rounded font-bold shrink-0 ${isTabActive ? "bg-zinc-950/20 text-zinc-950" : "bg-white/5 text-zinc-500 border border-white/5"
                              }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}

                      {/* Left panel extra: Reputation badge */}
                      <div className="hidden md:flex flex-col gap-1 mt-auto bg-white/[0.01] border border-white/5 p-2 rounded-xl text-[9px] text-zinc-500">
                        <span className="uppercase tracking-widest font-bold">Reputation</span>
                        <span className="font-bold text-zinc-300">Voice Guide Lvl 4</span>
                      </div>
                    </div>

                    {/* Right Panel: Result Panel with Pagination */}
                    <div className="workspace-right-panel flex-1 flex flex-col justify-between min-h-[270px]">

                      {/* Paginated List */}
                      <div className="space-y-3 flex-1">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${myCampfiresTab}-${workspacePage}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                          >
                            {paginatedItems.length > 0 ? (
                              paginatedItems.map((item: any) => {
                                if (myCampfiresTab === "hosted") {
                                  return (
                                    <div
                                      key={item.id}
                                      className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4 transition-all group scale-100 hover:scale-[1.01]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shrink-0 relative">
                                          <CompanionAvatar
                                            avatar={item.hostAvatar || (item.hostId === authState.userId ? currentUserProfile?.avatarUrl : null)}
                                            name={item.hostName || item.title || "Wanderer"}
                                            className="h-full w-full text-xs font-bold"
                                          />
                                          {(item.status === "ACTIVE" || item.status === "LIVE") && (
                                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-zinc-250 truncate group-hover:text-brand-cyan transition-colors">{item.title}</h4>
                                          <p className="text-[9px] text-zinc-500 mt-0.5">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0">
                                        {item.status === "ACTIVE" || item.status === "LIVE" ? (
                                          <button
                                            onClick={() => handleJoinRoom(item)}
                                            className="workspace-action-btn bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/30 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 px-3 py-1.5 shadow-sm shadow-emerald-500/20"
                                          >
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Active (Resume)
                                          </button>
                                        ) : item.status === "SCHEDULED" ? (
                                          <button
                                            onClick={async () => {
                                              try {
                                                await startCampfire.mutateAsync(item.id);
                                                triggerToast(`Started live session for "${item.title}"!`);
                                                handleJoinRoom({ ...item, status: "LIVE" });
                                              } catch (e) {
                                                triggerToast("Failed to start campfire.");
                                              }
                                            }}
                                            className="workspace-action-btn bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer px-3 py-1.5"
                                          >
                                            Start
                                          </button>
                                        ) : (
                                          <button
                                            onClick={async () => {
                                              try {
                                                await restartCampfire.mutateAsync(item.id);
                                                triggerToast(`Restarted live session for "${item.title}"!`);
                                                handleJoinRoom({ ...item, status: "LIVE" });
                                              } catch (e) {
                                                triggerToast("Failed to restart campfire.");
                                              }
                                            }}
                                            className="workspace-action-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer px-3 py-1.5"
                                          >
                                            Restart
                                          </button>
                                        )}

                                        <button
                                          onClick={() => handleDeleteHosted(item.id)}
                                          className="p-1 rounded-lg bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-350 border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer flex items-center justify-center h-7 w-7"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                } else if (myCampfiresTab === "joined") {
                                  return (
                                    <div
                                      key={item.id}
                                      className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4 transition-all group scale-100 hover:scale-[1.01]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div
                                          onClick={() => setZoomedAvatar({ url: item.avatar || item.hostAvatar, name: item.hostName })}
                                          className="h-9 w-9 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                                        >
                                          <CompanionAvatar avatar={item.avatar || item.hostAvatar} name={item.hostName} className="h-full w-full text-xs" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                                          <p className="text-[9px] text-zinc-500 mt-0.5">{item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent')} • Host: {item.hostName}</p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          if (item.status !== "ACTIVE" && item.status !== "LIVE") {
                                            triggerToast("This campfire is currently not live. Waiting for the host to start it again.");
                                            return;
                                          }
                                          handleJoinRoom(item);
                                        }}
                                        className="workspace-action-btn bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shrink-0"
                                      >
                                        Join Again
                                      </button>
                                    </div>
                                  );
                                } else if (myCampfiresTab === "saved") {
                                  // Saved items
                                  return (
                                    <div
                                      key={item.id}
                                      className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4 transition-all group scale-100 hover:scale-[1.01]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shrink-0 relative">
                                          <img src={item.cover} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                                          <p className="text-[9px] text-zinc-500 mt-0.5">{item.info} ({item.category})</p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => triggerToast(`Room slot "${item.title}" is saved. You will receive notification warnings at start time.`)}
                                        className="workspace-action-btn bg-brand-purple/20 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shrink-0"
                                      >
                                        Reminder
                                      </button>
                                    </div>
                                  );
                                } else {
                                  // Blocked items
                                  return (
                                    <div
                                      key={item.id}
                                      className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-3 rounded-2xl flex items-center justify-between gap-4 transition-all group scale-100 hover:scale-[1.01]"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div
                                          onClick={() => setZoomedAvatar({ url: item.avatar, name: item.name })}
                                          className="h-9 w-9 rounded-full border border-white/10 shrink-0 cursor-pointer hover:scale-105 active:scale-95 overflow-hidden select-none"
                                        >
                                          <CompanionAvatar avatar={item.avatar} name={item.name} className="h-full w-full text-xs" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                                          <p className="text-[9px] text-zinc-500 mt-0.5">{item.blockedAt} • Reason: {item.reason}</p>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => {
                                          triggerToast(`${item.name} has been unblocked from your voice rooms.`);
                                        }}
                                        className="workspace-action-btn bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer shrink-0"
                                      >
                                        Unblock
                                      </button>
                                    </div>
                                  );
                                }
                              })
                            ) : (
                              <div className="text-center py-8 text-zinc-500 text-[11px]">
                                No items found in this section.
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                          <span className="text-[9px] text-zinc-500 font-mono">
                            Showing {((workspacePage - 1) * itemsPerPage) + 1}-{Math.min(workspacePage * itemsPerPage, currentItems.length)} of {currentItems.length}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setWorkspacePage(prev => Math.max(prev - 1, 1))}
                              disabled={workspacePage === 1}
                              className={`h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center transition-all ${workspacePage === 1
                                ? "text-zinc-600 cursor-not-allowed opacity-50 bg-white/[0.01]"
                                : "text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer"
                                }`}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>

                            <span className="text-[9px] text-zinc-400 font-mono">
                              Page {workspacePage} of {totalPages}
                            </span>

                            <button
                              onClick={() => setWorkspacePage(prev => Math.min(prev + 1, totalPages))}
                              disabled={workspacePage === totalPages}
                              className={`h-7 w-7 rounded-lg border border-white/10 flex items-center justify-center transition-all ${workspacePage === totalPages
                                ? "text-zinc-600 cursor-not-allowed opacity-50 bg-white/[0.01]"
                                : "text-zinc-300 hover:text-white hover:bg-white/5 active:scale-95 cursor-pointer"
                                }`}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 text-right">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">
                    Reputation Sync Status: Secured
                  </span>
                </div>
              </div>

              {/* SECTION 9: CAMPFIRE REPLAYS & AI SUMMARIES */}
              <div className="glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-white/5">
                    <h2 className="text-md font-bold tracking-tight text-white flex items-center gap-2">
                      <Play className="h-4 w-4 text-brand-cyan" /> Campfire Replays (AI Logs)
                    </h2>
                    <p className="text-[10px] text-zinc-500">
                      Listen to past recordings and read AI-generated summary transcripts.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {REPLAY_LOGS.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-2xl space-y-2 transition-all group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200 group-hover:text-brand-cyan transition-colors line-clamp-1">
                              {rep.title}
                            </h4>
                            <p className="text-[9px] text-zinc-500">
                              Hosted by {rep.hostName} • {rep.date}
                            </p>
                          </div>
                          <button
                            onClick={() => triggerToast(`Playing replay: ${rep.title}...`)}
                            className="h-7 w-7 rounded-full bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            title="Play Replay"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                          </button>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2">
                          {rep.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 mt-4">
                  <button
                    onClick={() => triggerToast("Replays repository coming soon.")}
                    className="w-full text-center text-[10px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Browse All Replays
                  </button>
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>



      {/* =======================================================
          MODAL B: SECURE PASSWORD INPUT OVERLAY FOR PRIVATE ROOMS
          ======================================================= */}
      <AnimatePresence>
        {joiningRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJoiningRoom(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Password verification container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl text-center space-y-6 outline-none"
              onClick={() => inputRef.current?.focus()}
              tabIndex={-1}
            >
              {/* Hidden text input to support system keypads & physical keyboards */}
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={passcodeInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                  setPasscodeInput(val);
                }}
                onKeyDown={(e) => {
                  setPressedKey(e.key);
                  if (e.key === "Enter" && passcodeInput.length === 6) {
                    handlePasswordSubmit();
                  }
                }}
                onKeyUp={() => {
                  setPressedKey(null);
                }}
                className="absolute inset-0 opacity-0 cursor-default w-full h-full z-0"
                style={{ caretColor: "transparent" }}
              />

              <div className="space-y-2 relative z-10">
                <div className="h-12 w-12 bg-brand-purple/20 border border-brand-purple/35 text-brand-purple rounded-2xl flex items-center justify-center mx-auto">
                  <Lock className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-md font-bold text-white">Private Campfire</h3>
                <p className="text-[11px] text-zinc-400">
                  "{joiningRoom.title}" requires a secure passcode.
                </p>
              </div>

              {/* Passcode indicators (dots) */}
              <div className="flex justify-center gap-3 relative z-10">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-3.5 w-3.5 rounded-full border transition-all ${passcodeInput.length >= i
                      ? "bg-brand-purple border-brand-purple shadow-sm shadow-brand-purple/50 scale-110"
                      : "bg-white/[0.02] border-white/10"
                      }`}
                  />
                ))}
              </div>

              {/* Error indicator */}
              <div className="h-4 relative z-10">
                <AnimatePresence>
                  {passcodeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-rose-400 font-bold"
                    >
                      ❌ Incorrect Passcode. Try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Virtual Keypad (Very Premium!) */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto relative z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  const isHighlighted = pressedKey === String(num);
                  return (
                    <button
                      key={num}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (passcodeInput.length < 6) setPasscodeInput(p => p + num);
                        inputRef.current?.focus();
                      }}
                      className={`h-12 w-12 rounded-full bg-white/5 border text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer mx-auto relative z-10 ${
                        isHighlighted ? "border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "border-white/5"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}

                {/* Clear */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPasscodeInput("");
                    inputRef.current?.focus();
                  }}
                  className={`h-12 w-12 rounded-full border text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 transition-all flex items-center justify-center cursor-pointer mx-auto relative z-10 ${
                    (pressedKey === "Backspace" || pressedKey === "Delete") ? "border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.6)] text-white bg-white/5" : "border-transparent"
                  }`}
                >
                  Clear
                </button>

                {/* 0 */}
                <button
                  key={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (passcodeInput.length < 6) setPasscodeInput(p => p + "0");
                    inputRef.current?.focus();
                  }}
                  className={`h-12 w-12 rounded-full bg-white/5 border text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer mx-auto relative z-10 ${
                    pressedKey === "0" ? "border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.6)]" : "border-white/5"
                  }`}
                >
                  0
                </button>

                {/* Enter */}
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    handlePasswordSubmit();
                    inputRef.current?.focus();
                  }}
                  className={`h-12 w-12 rounded-full border text-[10px] uppercase font-bold text-brand-purple hover:text-brand-purple/80 transition-all flex items-center justify-center cursor-pointer mx-auto relative z-10 ${
                    pressedKey === "Enter" ? "border-brand-purple shadow-[0_0_10px_rgba(139,92,246,0.6)] bg-brand-purple/10" : "border-transparent"
                  }`}
                >
                  Enter
                </button>
              </div>

              {/* Cancel Button */}
              <div className="pt-2 relative z-10">
                <button
                  onClick={() => setJoiningRoom(null)}
                  className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Cancel Joining
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Alert Notification popup */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 bg-zinc-950 border border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toastMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoomed Avatar Modal */}
      <AnimatePresence>
        {zoomedAvatar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-none">
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

              <div className="text-center w-full">
                <h4 className="text-sm font-black text-white">{zoomedAvatar.name}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Campfire Participant Photo</p>
                <button
                  onClick={() => {
                    setZoomedAvatar(null);
                    const usernameSlug = getProfileUsername(zoomedAvatar.name);
                    if (usernameSlug) {
                      router.push(`/profile/${usernameSlug}`);
                    } else {
                      router.push("/profile");
                    }
                  }}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-zinc-950 hover:text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md select-none flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Visit Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
