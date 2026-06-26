"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

// Interfaces
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
  energyScore: number;
  category: "Adventure" | "Food" | "Photography" | "Storytelling" | "Travel" | "Learning";
  mood: "Adventure" | "Deep Discussion" | "Storytelling" | "Learning" | "Casual" | "Travel";
  isPrivate: boolean;
  password?: string;
  duration: string;
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  status?: "Live" | "Ended" | "Scheduled";
  coverUrl?: string;
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

const INITIAL_CAMPFIRES: CampfireRoom[] = [
  {
    id: "camp-himalayas",
    title: "Under the Himalayan Stars",
    description: "Sharing stories about trekking around Everest, scaling high altitudes, and the spiritual aura of Nepal's peaks. Join our Sherpa stories.",
    hostName: "Tenzing Norgay",
    hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    participantsCount: 18,
    speakers: [
      { id: "spk-1", name: "Tenzing N.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", role: "host" },
      { id: "spk-2", name: "Ang Doma", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", role: "speaker" },
      { id: "spk-3", name: "Alex Honnold", avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80", role: "speaker" }
    ],
    listeners: [
      { id: "lis-1", name: "Sarah J.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-2", name: "Rishi R.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-3", name: "Keiko T.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-4", name: "Omar S.", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" }
    ],
    energyLevel: "Legendary",
    energyScore: 92,
    category: "Adventure",
    mood: "Deep Discussion",
    isPrivate: false,
    duration: "1h 45m",
    x: 220,
    y: 130,
    size: "large"
  },
  {
    id: "camp-penang",
    title: "Street Food Secrets of Penang",
    description: "A culinary exploration of George Town's heritage cafes, Char Kway Teow, and night food markets. Virtual taste buds unite!",
    hostName: "Mei Ling",
    hostAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    participantsCount: 29,
    speakers: [
      { id: "spk-4", name: "Mei Ling", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", role: "host" },
      { id: "spk-5", name: "Chef David", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80", role: "speaker" }
    ],
    listeners: [
      { id: "lis-5", name: "Marcus", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-6", name: "Elena R.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80" }
    ],
    energyLevel: "Exciting",
    energyScore: 78,
    category: "Food",
    mood: "Casual",
    isPrivate: false,
    duration: "42m",
    x: 580,
    y: 110,
    size: "large"
  },
  {
    id: "camp-backpacking",
    title: "Solo Backpacking Europe 101",
    description: "Eurail hacks, cheap hostels, meeting locals, and avoiding tourist traps in Spain, Italy, and Hungary. Secret passwords inside.",
    hostName: "Lucas Green",
    hostAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    participantsCount: 9,
    speakers: [
      { id: "spk-6", name: "Lucas Green", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80", role: "host" },
      { id: "spk-7", name: "Emma Watson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80", role: "speaker" }
    ],
    listeners: [
      { id: "lis-7", name: "Carlos", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" }
    ],
    energyLevel: "Active",
    energyScore: 54,
    category: "Travel",
    mood: "Storytelling",
    isPrivate: true,
    password: "123456",
    duration: "15m",
    x: 390,
    y: 290,
    size: "medium"
  },
  {
    id: "camp-astrophoto",
    title: "Astro-photography Basics & Gear",
    description: "Capturing the Milky Way. We talk exposure times, lens distortion, star trackers, and dark sky sanctuaries around the globe.",
    hostName: "Elena Rostova",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    participantsCount: 6,
    speakers: [
      { id: "spk-8", name: "Elena R.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", role: "host" }
    ],
    listeners: [
      { id: "lis-8", name: "Kenji", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-9", name: "Sophie", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80" }
    ],
    energyLevel: "Quiet",
    energyScore: 32,
    category: "Photography",
    mood: "Learning",
    isPrivate: false,
    duration: "1h 10m",
    x: 130,
    y: 270,
    size: "small"
  },
  {
    id: "camp-wilderness",
    title: "Wilderness Survival Stories",
    description: "From encounters with grizzly bears to purifying swamp water. Learn primitive fire building and emergency signaling.",
    hostName: "Bear Grylls",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    participantsCount: 46,
    speakers: [
      { id: "spk-9", name: "Bear G.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", role: "host" },
      { id: "spk-10", name: "Survival Dave", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80", role: "speaker" },
      { id: "spk-11", name: "Cody L.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80", role: "speaker" }
    ],
    listeners: [
      { id: "lis-10", name: "Mike", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" },
      { id: "lis-11", name: "Jasmine", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80" }
    ],
    energyLevel: "Legendary",
    energyScore: 98,
    category: "Adventure",
    mood: "Storytelling",
    isPrivate: true,
    password: "987654",
    duration: "2h 5m",
    x: 690,
    y: 250,
    size: "large"
  }
];

const INITIAL_HOSTED_ROOMS: CampfireRoom[] = [
  {
    id: "hosted-1",
    title: "Alpine Winter Gear Choices",
    description: "My personal review of synthetic vs down jackets, double-wall tents, and heating canisters for high-altitude trekking.",
    hostName: "You",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    participantsCount: 14,
    speakers: [{ id: "user", name: "You (Host)", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", role: "host" }],
    listeners: [],
    energyLevel: "Active",
    energyScore: 60,
    category: "Adventure",
    mood: "Learning",
    isPrivate: false,
    duration: "45m",
    x: 100,
    y: 100,
    size: "medium",
    status: "Live",
    coverUrl: "https://images.unsplash.com/photo-1518098268026-4e43a1a009de?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "hosted-2",
    title: "Vlog Sound Design Masterclass",
    description: "Capturing wind buffers, choosing the right lavalier, and layering campfire crackle behind ambient storytelling.",
    hostName: "You",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    participantsCount: 0,
    speakers: [],
    listeners: [],
    energyLevel: "Quiet",
    energyScore: 0,
    category: "Photography",
    mood: "Learning",
    isPrivate: false,
    duration: "1h 15m",
    x: 200,
    y: 200,
    size: "small",
    status: "Ended",
    coverUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "hosted-3",
    title: "Backpacking across Spiti Valley",
    description: "How to survive high passes, find shared homestays, and handle lack of network signals in Key and Kaza.",
    hostName: "You",
    hostAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    participantsCount: 0,
    speakers: [],
    listeners: [],
    energyLevel: "Quiet",
    energyScore: 0,
    category: "Travel",
    mood: "Adventure",
    isPrivate: true,
    password: "555555",
    duration: "2h 0m",
    x: 300,
    y: 300,
    size: "medium",
    status: "Scheduled",
    coverUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&auto=format&fit=crop&q=80"
  }
];

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

export default function CampfireRoomPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const roomId = rawId ? rawId.split('--')[0] : '';

  const [activeRoom, setActiveRoom] = useState<CampfireRoom | null>(null);
  const isUserHost = useMemo(() => {
    if (!activeRoom) return false;
    return activeRoom.hostName?.toLowerCase() === "you";
  }, [activeRoom]);
  const [authorized, setAuthorized] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Immersive room states
  const [isMuted, setIsMuted] = useState(true);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [listenersList, setListenersList] = useState<Listener[]>([]);
  const [activeSpeakersMap, setActiveSpeakersMap] = useState<Record<string, boolean>>({});
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; avatar: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [roomEnergyState, setRoomEnergyState] = useState<"Quiet" | "Active" | "Exciting" | "Legendary">("Active");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);

  // Seat indexes: Seat 0 = Host (always filled). Seats 1-5 = Empty, User, or Guest speakers.
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Positions of 6 seats around the fire core (radius = 125)
  // Angles: 270 (Top), 330 (Top-Right), 30 (Bottom-Right), 90 (Bottom), 150 (Bottom-Left), 210 (Top-Left)
  const SEAT_ANGLES = [270, 330, 30, 90, 150, 210];
  const seatPositions = useMemo(() => {
    const radius = 125;
    return SEAT_ANGLES.map((angle) => {
      const rad = (angle * Math.PI) / 180;
      return {
        x: Math.round(Math.cos(rad) * radius),
        y: Math.round(Math.sin(rad) * radius)
      };
    });
  }, []);

  // Load room data
  useEffect(() => {
    if (!roomId) return;

    let room: CampfireRoom | undefined;

    // Load from local custom hosted rooms first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("wandercall_hosted_campfires");
      if (stored) {
        try {
          const customRooms: CampfireRoom[] = JSON.parse(stored);
          room = customRooms.find(r => r.id === roomId);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Load from INITIAL_CAMPFIRES if not in custom hosted
    if (!room) {
      room = INITIAL_CAMPFIRES.find(r => r.id === roomId);
    }
    // Load from INITIAL_HOSTED_ROOMS if not in either
    if (!room) {
      room = INITIAL_HOSTED_ROOMS.find(r => r.id === roomId);
    }

    if (!room) {
      return;
    }

    setActiveRoom(room);
    setSpeakersList(room.speakers);
    setListenersList(room.listeners);
    setChatMessages([
      { id: "msg-init", sender: "Campfire Keeper", avatar: "/globe", text: `Welcome to "${room.title}"! Gather round the fire and respect the circle.`, time: "Just now" }
    ]);

    // Check authorization for private rooms
    if (room.isPrivate) {
      const isAuth = sessionStorage.getItem(`authorized_campfire_${room.id}`) === "true";
      setAuthorized(isAuth);
      if (!isAuth) {
        setTimeout(() => inputRef.current?.focus(), 250);
      }
    } else {
      setAuthorized(true);
    }
  }, [roomId]);

  // Keypad submit
  const handlePasswordSubmit = () => {
    if (activeRoom && passcodeInput === activeRoom.password) {
      sessionStorage.setItem(`authorized_campfire_${activeRoom.id}`, "true");
      setAuthorized(true);
      setPasscodeInput("");
      setPasscodeError(false);
      triggerToast("Passcode verified! Welcome to the campfire.");
    } else {
      setPasscodeError(true);
      setPasscodeInput("");
      setTimeout(() => setPasscodeError(false), 2000);
    }
  };

  // Simulate active speaker voice waves
  useEffect(() => {
    if (!authorized || !activeRoom) return;

    const interval = setInterval(() => {
      const speakingMap: Record<string, boolean> = {};
      if (Math.random() > 0.6) {
        speakingMap["host"] = true;
      }
      
      const guests = speakersList.filter(s => s.role !== "host" && s.id !== "user");
      guests.forEach((spk) => {
        if (Math.random() > 0.73) {
          speakingMap[spk.id] = true;
        }
      });

      if (!isMuted && userSeatIndex !== null && Math.random() > 0.5) {
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
  }, [authorized, activeRoom, speakersList, isMuted, userSeatIndex]);

  // Clean emoji particles
  useEffect(() => {
    if (floatingEmojis.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingEmojis(prev => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [floatingEmojis]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, authorized]);

  // Auto-focus hidden input on private room prompt
  useEffect(() => {
    if (activeRoom?.isPrivate && !authorized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeRoom, authorized]);

  // Interactive seats computation
  const seatOccupants = useMemo(() => {
    if (!activeRoom) return Array(6).fill(null);
    const occupants = Array(6).fill(null);

    // Seat 0: Host
    occupants[0] = {
      type: "host",
      name: activeRoom.hostName,
      avatar: activeRoom.hostAvatar,
      isSpeaking: activeSpeakersMap["host"]
    };

    // Remaining guests from room speakers list
    const roomSpeakers = speakersList.filter(s => s.role !== "host" && s.id !== "user");

    // Place the user if they sit in a seat
    if (userSeatIndex !== null) {
      occupants[userSeatIndex] = {
        type: "user",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        isSpeaking: activeSpeakersMap["user"] && !isMuted
      };
    }

    // Fill remaining vacant seats with guest speakers
    let guestIdx = 0;
    for (let i = 1; i < 6; i++) {
      if (occupants[i] === null && guestIdx < roomSpeakers.length) {
        const spk = roomSpeakers[guestIdx++];
        occupants[i] = {
          type: "speaker",
          id: spk.id,
          name: spk.name,
          avatar: spk.avatar,
          isSpeaking: activeSpeakersMap[spk.id]
        };
      }
    }

    return occupants;
  }, [activeRoom, speakersList, userSeatIndex, activeSpeakersMap, isMuted]);

  // Handlers for taking and leaving seats
  const handleTakeSeat = (index: number) => {
    setUserSeatIndex(index);
    setIsMuted(false); // Sit down and unmute!
    triggerToast("You joined the speaking circle. Talk live!");
  };

  const handleLeaveSeat = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setUserSeatIndex(null);
    setIsMuted(true); // Leave seat and mute
    triggerToast("You left the speaking circle and returned to listeners.");
  };

  // Mic toggle handler
  const handleMicToggle = () => {
    if (isMuted) {
      // Unmuting: Must sit down
      if (userSeatIndex === null) {
        // Find first empty seat slot
        const emptyIdx = seatOccupants.findIndex((occ, idx) => idx > 0 && occ === null);
        if (emptyIdx !== -1) {
          handleTakeSeat(emptyIdx);
        } else {
          triggerToast("All speaking seats are full! Wait for a seat to empty.");
        }
      } else {
        setIsMuted(false);
        triggerToast("Speaking live!");
      }
    } else {
      setIsMuted(true);
      triggerToast("Muted.");
    }
  };

  const triggerEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const x = 50 + (Math.random() * 80 - 40);
    setFloatingEmojis(prev => [...prev, { id, emoji, x, y: -100 }]);
  };

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

  if (!activeRoom) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[80vh] text-zinc-500 gap-4">
        <Sparkles className="h-10 w-10 text-brand-purple animate-spin-slow" />
        <h2 className="text-md font-bold text-white uppercase tracking-wider">Locating Campfire Coordinates...</h2>
        <button onClick={() => router.push("/profile/campfires")} className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white hover:bg-zinc-800 cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Render Passcode Screen if unauthorized
  if (activeRoom.isPrivate && !authorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md">
        <div 
          onClick={() => inputRef.current?.focus()}
          className="relative z-10 w-full max-w-sm bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-2xl text-center space-y-6 outline-none"
          tabIndex={-1}
        >
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
            <h3 className="text-md font-bold text-white">Private Campfire Access</h3>
            <p className="text-[11px] text-zinc-400">
              "{activeRoom.title}" requires a secure 6-digit passcode.
            </p>
          </div>

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

          <div className="pt-2 relative z-10">
            <button
              onClick={() => router.push("/profile/campfires")}
              className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Cancel Joining
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Voice Room Rendering
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 text-white relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
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
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan">
                  {activeRoom.category} Campfire
                </span>
                {activeRoom.isPrivate ? (
                  <span className="flex items-center gap-1 text-[9px] bg-brand-purple/20 text-brand-purple px-1.5 py-0.5 rounded-full border border-brand-purple/30">
                    <Lock className="h-2.5 w-2.5" /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-450 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    <Unlock className="h-2.5 w-2.5" /> Public
                  </span>
                )}
                <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded-full hover:border-white/15 transition-all">
                  <span className="text-zinc-500 font-bold">ID:</span>
                  <span>{activeRoom.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeRoom.id);
                      triggerToast(`Campfire ID "${activeRoom.id}" copied!`);
                    }}
                    className="hover:text-white transition-colors cursor-pointer ml-1 p-0.5 rounded"
                    title="Copy Campfire ID"
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1 mt-0.5">
                {activeRoom.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-zinc-400">
              <Activity className="h-3.5 w-3.5 text-brand-emerald" />
              <span>Energy:</span>
              <span className="font-bold text-white">{roomEnergyState}</span>
            </div>
            <button
              onClick={() => router.push("/profile/campfires")}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Leave<span className="hidden sm:inline"> Campfire</span></span>
            </button>
          </div>
        </div>

        {/* Layout Grid: Centered Ring + Chat Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[580px]">
          
          {/* Campfire Visual Core Area */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden min-h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.06),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="text-center z-10 max-w-lg mx-auto bg-black/40 border border-white/5 backdrop-blur-md px-4 py-2 rounded-2xl">
              <p className="text-xs text-zinc-300 italic line-clamp-2">
                "{activeRoom.description}"
              </p>
            </div>

            {/* THE Campfire CIRCLE GRAPH CONTAINER */}
            <div className="relative flex-1 flex items-center justify-center min-h-[380px] w-full select-none">
              
              {/* Central Glowing Campfire */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className={`absolute h-44 w-44 rounded-full blur-3xl transition-all duration-1000 ${
                  roomEnergyState === "Quiet" ? "bg-brand-amber/10 opacity-30" :
                  roomEnergyState === "Active" ? "bg-brand-amber/20 opacity-50" :
                  roomEnergyState === "Exciting" ? "bg-brand-amber/35 opacity-70" :
                  "bg-brand-purple/40 opacity-90"
                }`} />

                <motion.div
                  animate={{
                    scale: roomEnergyState === "Quiet" ? 0.95 :
                    roomEnergyState === "Active" ? 1.05 :
                    roomEnergyState === "Exciting" ? 1.2 :
                    1.35
                  }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="relative h-24 w-24 flex items-center justify-center cursor-pointer"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
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

                <div className="w-14 h-2.5 bg-amber-950/90 rounded-md border-b-2 border-stone-900/60 shadow-lg relative -mt-0.5 flex items-center justify-between px-1">
                  <div className="w-6 h-1.5 bg-stone-800 rotate-12 rounded-sm origin-center" />
                  <div className="w-6 h-1.5 bg-stone-850 -rotate-12 rounded-sm origin-center" />
                </div>
              </div>

              {/* Orbit Ring visual guide */}
              <div className="absolute border border-white/5 rounded-full w-[250px] h-[250px] pointer-events-none" />

              {/* RENDER THE 6 SYSTEMATIC SEATS */}
              {seatOccupants.map((occupant, idx) => {
                const pos = seatPositions[idx];
                if (!pos) return null;
                const isSpeaking = occupant?.isSpeaking;

                return (
                  <div
                    key={`seat-${idx}`}
                    className="absolute z-20 transition-all duration-500"
                    style={{
                      transform: "translate(-50%, -50%)",
                      left: `calc(50% + ${pos.x}px)`,
                      top: `calc(50% + ${pos.y}px)`
                    }}
                  >
                    {occupant ? (
                      <div className="flex flex-col items-center group relative">
                        <div className="relative">
                          {isSpeaking && (
                            <div className="absolute -inset-2 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 animate-ping" />
                          )}
                          <div
                            onClick={() => setZoomedAvatar({ url: occupant.avatar, name: occupant.name })}
                            className={`h-14 w-14 rounded-full border-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 shrink-0 aspect-square overflow-hidden select-none ${
                              isSpeaking
                                ? "border-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                                : occupant.type === "host"
                                ? "border-brand-purple"
                                : occupant.type === "user"
                                ? "border-brand-cyan"
                                : "border-white/10"
                            }`}
                            style={{ width: "56px", height: "56px", minWidth: "56px", minHeight: "56px" }}
                          >
                            <CompanionAvatar
                              avatar={occupant.avatar}
                              name={occupant.name}
                              className="h-full w-full text-xl"
                            />
                          </div>
                          {occupant.type === "host" && (
                            <div className="absolute -bottom-1 -right-1 bg-brand-purple text-[7px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-zinc-950 select-none">
                              Host
                            </div>
                          )}
                          {occupant.type === "user" && (
                            <div className="absolute -bottom-1 -right-1 bg-brand-cyan text-zinc-950 text-[7px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border border-zinc-950 select-none">
                              You
                            </div>
                          )}
                          {occupant.type === "user" && isMuted && (
                            <div className="absolute -top-1 -right-1 bg-zinc-950/80 p-0.5 rounded-full border border-white/10">
                              <MicOff className="h-3 w-3 text-rose-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-300 mt-1.5 font-bold max-w-[70px] truncate text-center bg-black/40 px-1.5 py-0.5 rounded select-none">
                          {occupant.name}
                        </span>

                        {occupant.type === "user" && (
                          <button
                            onClick={handleLeaveSeat}
                            className="absolute -top-6 text-[8px] bg-rose-500 hover:bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap z-30"
                          >
                            Leave Seat
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleTakeSeat(idx)}
                        className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-dashed border-white/10 hover:border-brand-cyan/40 bg-white/[0.01] hover:bg-brand-cyan/5 transition-all group cursor-pointer relative shrink-0 aspect-square"
                        style={{ width: "56px", height: "56px", minWidth: "56px", minHeight: "56px" }}
                        title="Take a seat and speak"
                      >
                        <Plus className="h-4 w-4 text-zinc-500 group-hover:text-brand-cyan group-hover:scale-110 transition-all" />
                        <span className="absolute -bottom-5 text-[8px] font-black text-zinc-600 uppercase tracking-widest scale-85 select-none">
                          Seat {idx}
                        </span>
                      </button>
                    )}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMicToggle}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer relative group shrink-0 ${
                    isMuted
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : "bg-gradient-to-br from-brand-emerald to-emerald-600 border-emerald-400/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)]"
                  }`}
                  title={isMuted ? "Muted (Click to speak)" : "Speaking Live (Click to mute)"}
                >
                  {!isMuted && (
                    <>
                      <span className="absolute -inset-1.5 rounded-xl bg-brand-emerald/20 border border-brand-emerald/30 animate-ping opacity-75" />
                      <span className="absolute -inset-3 rounded-xl bg-brand-emerald/5 border border-brand-emerald/10 animate-pulse opacity-50" />
                    </>
                  )}
                  {isMuted ? (
                    <MicOff className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                  ) : (
                    <Mic className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                  )}
                </button>

                {userSeatIndex !== null && (
                  <button
                    onClick={handleLeaveSeat}
                    className="h-11 px-4 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-rose-400 hover:bg-white/10 hover:text-rose-350 cursor-pointer transition-all"
                  >
                    Leave Seat
                  </button>
                )}

                <button
                  onClick={() => setHasRaisedHand(!hasRaisedHand)}
                  className={`h-11 w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    hasRaisedHand
                    ? "bg-brand-amber/20 border-brand-amber text-brand-amber"
                    : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                  }`}
                  title="Request to speak"
                >
                  <span className="text-lg">✋</span>
                </button>
              </div>

              {/* Floating Reactions Toolbar */}
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

              {/* Host Utility Panel Demo */}
              {isUserHost && (
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
              )}
            </div>
          </div>

          {/* Chat Panel Right */}
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
