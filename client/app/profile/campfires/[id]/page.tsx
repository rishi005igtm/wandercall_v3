"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCampfire, useTransitionCampfireLifecycle, useDeleteCampfire, useJoinSession, useEndCampfire } from "../../../../hooks/api/useCampfire";
import { campfireApi, CampfireStatus } from "../../../../lib/api/campfire";
import { useUserProfileQuery } from "../../../../hooks/api/useUserQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../../../../lib/store/store";
import { useCampfireSessionManager } from "../../../../providers/CampfireSessionProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChatContainer } from "./components/chat/ChatContainer";
import { useCampfirePresenceQueue } from "./hooks/useCampfirePresenceQueue";
import { useCampfireVoice } from "../../../../providers/CampfireVoiceProvider";
import { useParticipants, useLocalParticipant, useConnectionState } from "@livekit/components-react";
import { CampfirePresenceToast } from "./components/presence/CampfirePresenceToast";
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
  Power,
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
  MoreVertical,
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
  Check,
  RefreshCw
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

  const { data: activeRoom, isLoading } = useCampfire(roomId);
  const deleteCampfire = useDeleteCampfire();
  const transitionLifecycle = useTransitionCampfireLifecycle(roomId);
  const joinSessionMutation = useJoinSession();
  const endCampfire = useEndCampfire();
  const { socket, joinRoom, leaveRoom, isSessionTerminated } = useCampfireSessionManager();
  const { activeToasts, enqueueToast, dismissToast } = useCampfirePresenceQueue();
  const { livekitToken, connectVoice, disconnectVoice } = useCampfireVoice();

  const queryClient = useQueryClient();
  const authState = useAppSelector((state) => state.auth);
  const { data: currentUserProfile } = useUserProfileQuery(authState?.userId || null);

  const isUserHost = useMemo(() => {
    if (!activeRoom || !authState?.userId) return false;
    return activeRoom.hostId === authState.userId;
  }, [activeRoom, authState.userId]);

  const activeRoomRef = useRef<any>(activeRoom);
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  const [authorized, setAuthorized] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Immersive room states
  const [isMuted, setIsMuted] = useState(true);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const roomState = useConnectionState();
  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [speakersList, setSpeakersList] = useState<Speaker[]>([]);
  const [listenersList, setListenersList] = useState<Listener[]>([]);
  const [activeSpeakersMap, setActiveSpeakersMap] = useState<Record<string, boolean>>({});
  const [roomEnergyState, setRoomEnergyState] = useState<"Quiet" | "Active" | "Exciting" | "Legendary">("Active");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);
  const [isHostOnline, setIsHostOnline] = useState<boolean>(
    activeRoom ? ((activeRoom as any).isHostOnline ?? (activeRoom.hostId === authState?.userId)) : false
  );

  useEffect(() => {
    if (!activeRoom) return;
    if (activeRoom.hostId === authState?.userId) {
      setIsHostOnline(true);
    } else if (typeof (activeRoom as any).isHostOnline === 'boolean') {
      setIsHostOnline((activeRoom as any).isHostOnline);
    }
  }, [(activeRoom as any)?.isHostOnline, activeRoom?.hostId, authState?.userId]);

  // Seat indexes: Seat 0 = Host (always filled when host online). Seats 1-5 = Empty, User, or Guest speakers.
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);
  const [globalSeatOccupants, setGlobalSeatOccupants] = useState<Record<number, any>>({});

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Positions of 6 seats around the fire core (radius = 125)
  // Angles: 270 (Top), 330 (Top-Right), 30 (Bottom-Right), 90 (Bottom), 150 (Bottom-Left), 210 (Top-Left)
  const SEAT_ANGLES = [270, 330, 30, 90, 150, 210];
  const seatPositions = useMemo(() => {
    return SEAT_ANGLES.map(angle => {
      const rad = (angle * Math.PI) / 180;
      const radius = 125;
      return {
        x: Math.round(Math.cos(rad) * radius),
        y: Math.round(Math.sin(rad) * radius)
      };
    });
  }, []);

  // Load room data
  useEffect(() => {
    if (isSessionTerminated || !activeRoom) return;

    const currentStatus = activeRoom.status as string;
    if (currentStatus === 'ENDED' || currentStatus === 'CLOSED' || currentStatus === 'DELETED' || currentStatus === 'ARCHIVED') {
      triggerToast("This campfire has ended. Redirecting to campfires...");
      router.push("/profile/campfires");
      return;
    }

    // Use actual speakers and listeners length later, for now we will just populate empty
    setSpeakersList([]);
    setListenersList([]);

    // Check authorization for private rooms
    if (activeRoom.visibility === 'PRIVATE') {
      const isAuth = sessionStorage.getItem(`authorized_campfire_${activeRoom.id}`) === "true";
      setAuthorized(isAuth);
      if (!isAuth) {
        setTimeout(() => inputRef.current?.focus(), 250);
      }
    } else {
      setAuthorized(true);
    }
  }, [activeRoom, router, isSessionTerminated]);

  // Session Integration
  useEffect(() => {
    if (!activeRoom || !authorized || !authState?.userId || livekitToken) return;

    joinSessionMutation.mutate(activeRoom.id, {
      onSuccess: (data) => {
        connectVoice(data.wsUrl, data.token);
      },
      onError: () => {
        triggerToast("Failed to join campfire. It might be full or ended.");
        router.push("/profile/campfires");
      }
    });
  }, [activeRoom?.id, authorized, authState?.userId, livekitToken]);

  // Host auto-publish mic upon successful connection and permission grant
  const hasAutoPublishedRef = useRef(false);

  // Host auto-publish mic upon successful connection and permission grant
  useEffect(() => {
    if (isUserHost && roomState === 'connected' && localParticipant && isMuted && !hasAutoPublishedRef.current) {
      if (localParticipant.permissions?.canPublish) {
        hasAutoPublishedRef.current = true;
        localParticipant.setMicrophoneEnabled(true).then(() => {
          setIsMuted(false);
        }).catch((e: any) => {
          console.error("[Campfire] Could not auto-publish host mic:", e);
          if (e.name === 'NotAllowedError') {
            triggerToast("Microphone permission denied. Please allow mic access to speak.");
          }
        });
      }
    }
  }, [roomState, isUserHost, localParticipant, isMuted, localParticipant?.permissions?.canPublish]);

  const enqueueToastRef = useRef(enqueueToast);
  const queryClientRef = useRef(queryClient);
  const authStateRef = useRef(authState);

  // Intent to publish
  const [isIntentToPublish, setIsIntentToPublish] = useState(false);

  const localParticipantRef = useRef(localParticipant);
  useEffect(() => {
    localParticipantRef.current = localParticipant;
  }, [localParticipant]);

  // Effect to handle intent to publish and auto-publishing when seat is granted
  useEffect(() => {
    if (isIntentToPublish && localParticipant?.permissions?.canPublish) {
      setIsIntentToPublish(false);
      localParticipant.setMicrophoneEnabled(true).then(() => {
        setIsMuted(false);
        triggerToast("Speaking live!");
      }).catch(e => {
        console.error("Failed to enable mic:", e);
      });
    }
  }, [isIntentToPublish, localParticipant, localParticipant?.permissions?.canPublish]);



  useEffect(() => {
    enqueueToastRef.current = enqueueToast;
    queryClientRef.current = queryClient;
    authStateRef.current = authState;
  }, [enqueueToast, queryClient, authState]);

  // Socket.IO Integration (Presence & UI Events Only)
  useEffect(() => {
    if (!activeRoom?.id || !authState?.userId || !socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    const userProfile = {
      name: currentUserProfile?.displayName || authState.name || (isUserHost ? activeRoomRef.current?.hostName : "Guest") || "Explorer",
      avatar: currentUserProfile?.avatarUrl || (isUserHost ? activeRoomRef.current?.hostAvatar : null) || null,
      role: isUserHost ? "HOST" : (currentUserProfile?.role || "LISTENER"),
      userId: authState.userId,
      hostId: activeRoom.hostId
    };

    joinRoom(activeRoom.id, authState.userId, userProfile);

    const checkIsHost = (targetUserId?: string, targetRole?: string, targetName?: string) => {
      const room = activeRoomRef.current;
      if (!room) return false;
      if (targetUserId && targetUserId === room.hostId) return true;
      if (targetRole && (targetRole.toUpperCase() === 'HOST' || targetRole === 'host')) return true;
      if (targetName && targetName === room.hostName && targetName !== 'Wanderer' && targetName !== 'Explorer') return true;
      return false;
    };

    const handleShowPresenceToast = (targetUserId: string, displayName: string, avatar: string, role: string, action: 'JOINED' | 'LEFT') => {
      if (!targetUserId || targetUserId === authStateRef.current?.userId || targetUserId === socket.id) return;
      enqueueToastRef.current({
        userId: targetUserId,
        displayName: displayName || "Explorer",
        avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: role || "LISTENER",
        action,
        timestamp: new Date().toISOString(),
      });
    };

    const onParticipantJoined = (payload: any) => {
      handleShowPresenceToast(payload.userId, payload.displayName, payload.avatar, payload.role, 'JOINED');
      setListenersList(prev => [...prev.filter(l => l.id !== payload.userId), { id: payload.userId, name: payload.displayName, avatar: payload.avatar }]);
      if (checkIsHost(payload.userId, payload.role, payload.displayName)) {
        setIsHostOnline(true);
      }
      queryClientRef.current.invalidateQueries({ queryKey: ['campfires', 'detail', activeRoom.id] });
    };

    const onParticipantLeft = (payload: any) => {
      handleShowPresenceToast(payload.userId, payload.displayName, payload.avatar, payload.role, 'LEFT');
      setListenersList(prev => prev.filter(l => l.id !== payload.userId));
      setSpeakersList(prev => prev.filter(s => s.id !== payload.userId));
      if (checkIsHost(payload.userId, payload.role, payload.displayName)) {
        setIsHostOnline(false);
      }
      queryClientRef.current.invalidateQueries({ queryKey: ['campfires', 'detail', activeRoom.id] });
    };

    const onUserJoined = (data: any) => {
      if (data.userId && data.userId !== socket.id) {
        handleShowPresenceToast(data.userId, data.userProfile?.name, data.userProfile?.avatar, data.userProfile?.role, 'JOINED');
        setListenersList(prev => [...prev.filter(l => l.id !== data.userId), { id: data.userId, name: data.userProfile?.name || "Explorer", avatar: data.userProfile?.avatar || null }]);
        if (checkIsHost(data.userId, data.userProfile?.role, data.userProfile?.name)) {
          setIsHostOnline(true);
        }
      }
    };

    const onProfileUpdated = (data: any) => {
      if (!data.userProfile) return;
      setListenersList(prev => prev.map(l => l.id === data.userId ? { ...l, name: data.userProfile.name, avatar: data.userProfile.avatar } : l));
      setSpeakersList(prev => prev.map(s => s.id === data.userId ? { ...s, name: data.userProfile.name, avatar: data.userProfile.avatar } : s));
    };

    const onRoomStatsUpdate = (data: any) => {
      queryClientRef.current.setQueryData(['campfires', 'detail', activeRoom.id], (old: any) => {
        if (!old) return old;
        return { 
          ...old, 
          currentParticipants: data.participantsCount, 
          participantsCount: data.participantsCount,
          currentListeners: Math.max(0, data.participantsCount - (old.speakers?.length || 1)) 
        };
      });
    };

    const onUserLeft = (data: any) => {
      if (data.userId && data.userId !== socket.id) {
        handleShowPresenceToast(data.userId, data.userProfile?.name, data.userProfile?.avatar, data.userProfile?.role, 'LEFT');
        setListenersList(prev => prev.filter(l => l.id !== data.userId));
        setSpeakersList(prev => prev.filter(s => s.id !== data.userId));
        if (checkIsHost(data.userId, data.userProfile?.role, data.userProfile?.name)) {
          setIsHostOnline(false);
        }
      }
    };

    const onNewReaction = (reaction: any) => {
      setFloatingEmojis(prev => [...prev, reaction]);
    };

    const onPresenceSnapshot = (snapshot: any) => {
      if (snapshot && typeof snapshot.isHostOnline === 'boolean') {
        setIsHostOnline(snapshot.isHostOnline);
      }
    };

    const onRoomSeatsSnapshot = (snapshot: Record<number, { userId: string, profile?: any } | null>) => {
      // snapshot is {1: {userId, profile}, 2: null, ...}
      setGlobalSeatOccupants(prev => {
        const next = { ...prev };
        for (const [seatStr, data] of Object.entries(snapshot)) {
          const idx = parseInt(seatStr);
          if (data === null || !data.userId) {
            delete next[idx];
          } else {
            next[idx] = { userId: data.userId, profile: data.profile };
          }
        }
        return next;
      });
      
      // Update local userSeatIndex if we are in the snapshot
      let foundSeat: number | null = null;
      for (const [seatStr, data] of Object.entries(snapshot)) {
        if (data && data.userId === authState.userId) {
          foundSeat = parseInt(seatStr);
          break;
        }
      }
      setUserSeatIndex(foundSeat);
      if (foundSeat !== null) setIsMuted(false);
    };

    const onSeatTaken = (data: { userId: string; seatIndex: number; userProfile: any }) => {
      setGlobalSeatOccupants(prev => ({ ...prev, [data.seatIndex]: { userId: data.userId, profile: data.userProfile } }));
      if (data.userId === authState.userId) {
        setUserSeatIndex(data.seatIndex);
        setIsMuted(false);
        triggerToast("You joined the speaking circle. Talk live!");
      } else {
        triggerToast(`${data.userProfile?.name || "Someone"} took a seat.`);
      }
    };

    const onSeatLeft = (data: { userId: string }) => {
      setGlobalSeatOccupants(prev => {
        const next = { ...prev };
        let vacatedSeat: number | null = null;
        for (const [idxStr, occ] of Object.entries(next)) {
          if (occ.userId === data.userId) {
            vacatedSeat = parseInt(idxStr);
            delete next[vacatedSeat];
          }
        }
        if (vacatedSeat !== null && data.userId === authState.userId) {
          setUserSeatIndex(null);
          setIsMuted(true);
          triggerToast("You left the speaking circle.");
        }
        return next;
      });
    };

    socket.on("CAMPFIRE_PARTICIPANT_JOINED", onParticipantJoined);
    socket.on("CAMPFIRE_PARTICIPANT_LEFT", onParticipantLeft);
    socket.on("user_joined", onUserJoined);
    socket.on("profile_updated", onProfileUpdated);
    socket.on("room_stats_update", onRoomStatsUpdate);
    socket.on("user_left", onUserLeft);
    socket.on("campfire:new_reaction", onNewReaction);
    socket.on("room_presence_snapshot", onPresenceSnapshot);
    socket.on("room_seats_snapshot", onRoomSeatsSnapshot);
    socket.on("seat_taken", onSeatTaken);
    socket.on("seat_left", onSeatLeft);

    return () => {
      socket.off("CAMPFIRE_PARTICIPANT_JOINED", onParticipantJoined);
      socket.off("CAMPFIRE_PARTICIPANT_LEFT", onParticipantLeft);
      socket.off("user_joined", onUserJoined);
      socket.off("profile_updated", onProfileUpdated);
      socket.off("room_stats_update", onRoomStatsUpdate);
      socket.off("user_left", onUserLeft);
      socket.off("campfire:new_reaction", onNewReaction);
      socket.off("room_presence_snapshot", onPresenceSnapshot);
      socket.off("room_seats_snapshot", onRoomSeatsSnapshot);
      socket.off("seat_taken", onSeatTaken);
      socket.off("seat_left", onSeatLeft);
    };
  }, [activeRoom?.id, authState?.userId, socket, joinRoom, leaveRoom]);

  // Keypad submit
  const handlePasswordSubmit = () => {
    if (activeRoom && passcodeInput === "123456") {
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

  // LiveKit active speaker integration
  const participants = useParticipants();
  
  useEffect(() => {
    if (!authorized || !activeRoom) return;

    const speakingMap: Record<string, boolean> = {};
    let speakCount = 0;
    
    participants.forEach((p) => {
      if (p.isSpeaking) {
        // p.identity maps to userId
        speakingMap[p.identity] = true;
        speakCount++;
      }
    });

    setActiveSpeakersMap(speakingMap);

    if (speakCount === 0) setRoomEnergyState("Quiet");
    else if (speakCount === 1) setRoomEnergyState("Active");
    else if (speakCount === 2) setRoomEnergyState("Exciting");
    else setRoomEnergyState("Legendary");
  }, [authorized, activeRoom, participants]);

  // Clean emoji particles
  useEffect(() => {
    if (floatingEmojis.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingEmojis(prev => prev.slice(1));
    }, 2000);
    return () => clearTimeout(timer);
  }, [floatingEmojis]);

  // Auto-focus hidden input on private room prompt
  useEffect(() => {
    if (activeRoom?.visibility === 'PRIVATE' && !authorized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [activeRoom, authorized]);

  // Interactive seats computation
  const seatOccupants = useMemo(() => {
    if (!activeRoom) return Array(6).fill(null);
    const occupants = Array(6).fill(null);

    // Seat 0: Host (Exclusively reserved for Host; cleared in real time when Host leaves)
    const hostFallbackName = isUserHost ? (currentUserProfile?.displayName || authState?.name || "You (Host)") : "Host";
    const hostFallbackAvatar = isUserHost ? (currentUserProfile?.avatarUrl || null) : null;

    if (isUserHost || isHostOnline) {
      occupants[0] = {
        type: "host",
        name: (isUserHost && currentUserProfile?.displayName) ? currentUserProfile.displayName : ((activeRoom.hostName && activeRoom.hostName !== "Wanderer" && activeRoom.hostName !== "Host") ? activeRoom.hostName : hostFallbackName),
        avatar: (isUserHost && currentUserProfile?.avatarUrl) ? currentUserProfile.avatarUrl : (activeRoom.hostAvatar || hostFallbackAvatar),
        isSpeaking: activeSpeakersMap["host"]
      };
    } else {
      occupants[0] = null;
    }

    // Remaining guests from room speakers list
    const roomSpeakers = speakersList.filter(s => s.role !== "host" && s.id !== "user");
    const roomSpeakersMap = new Map(roomSpeakers.map(s => [s.id, s]));
    const roomListenersMap = new Map(listenersList.map(s => [s.id, s]));

    // Fill remaining vacant seats with global state
    for (let i = 1; i < 6; i++) {
      const globalOcc = globalSeatOccupants[i];
      if (globalOcc) {
        const isMe = globalOcc.userId === authState?.userId;
        const mappedProfile = globalOcc.profile || roomSpeakersMap.get(globalOcc.userId) || roomListenersMap.get(globalOcc.userId);
        occupants[i] = {
          type: isMe ? "user" : "speaker",
          id: globalOcc.userId,
          name: isMe ? (currentUserProfile?.displayName || authState?.name || "You") : (mappedProfile?.name || "Speaker"),
          avatar: isMe ? (currentUserProfile?.avatarUrl || null) : (mappedProfile?.avatar || null),
          isSpeaking: activeSpeakersMap[globalOcc.userId] || (isMe && !isMuted)
        };
      }
    }

    return occupants;
  }, [activeRoom, globalSeatOccupants, speakersList, listenersList, userSeatIndex, activeSpeakersMap, isMuted, isHostOnline, isUserHost, currentUserProfile, authState]);

  // Handlers for taking and leaving seats
  const handleTakeSeat = (index: number) => {
    if (index === 0 && !isUserHost) {
      triggerToast("Top circle seat is exclusively reserved for the Host!");
      return;
    }
    if (isUserHost) {
      triggerToast("As the Host, you are already permanently seated at the top circle seat!");
      return;
    }
    if (userSeatIndex !== null) {
      triggerToast("You are already seated! Click 'Leave Seat' before taking another seat.");
      return;
    }
    
    setIsIntentToPublish(true); // Intend to publish once seated
    
    // Emit to backend instead of local mutate
    socket?.emit("campfire:take_seat", {
      roomId: activeRoom?.id,
      userId: authState.userId,
      seatIndex: index,
      userProfile: {
        name: currentUserProfile?.displayName || authState.name || "Guest",
        avatar: currentUserProfile?.avatarUrl || null,
        role: "Speaker"
      }
    });
  };

  const handleLeaveSeat = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    socket?.emit("campfire:leave_seat", {
      roomId: activeRoom?.id,
      userId: authState.userId
    });
    setIsMuted(true);
    try { await localParticipant?.setMicrophoneEnabled(false); } catch(e){}
    triggerToast("You left the speaking circle and returned to listeners.");
  };

  // Mic toggle handler
  const handleMicToggle = async () => {
    if (isMuted) {
      // If host, unmute immediately (already seated at top)
      if (isUserHost) {
        setIsMuted(false);
        try { await localParticipant?.setMicrophoneEnabled(true); } catch(e){}
        triggerToast("Host speaking live!");
        return;
      }
      // Unmuting: Must sit down
      if (userSeatIndex === null) {
        // Find first empty seat slot
        const emptyIdx = seatOccupants.findIndex((occ, idx) => idx > 0 && occ === null);
        if (emptyIdx !== -1) {
          handleTakeSeat(emptyIdx);
          triggerToast("Requesting seat...");
          // isIntentToPublish is set by handleTakeSeat, so the effect will auto-publish when permissions arrive.
        } else {
          triggerToast("All speaking seats are full! Wait for a seat to empty.");
        }
      } else {
        setIsMuted(false);
        try { await localParticipant?.setMicrophoneEnabled(true); } catch(e){}
        triggerToast("Speaking live!");
      }
    } else {
      setIsMuted(true);
      try { await localParticipant?.setMicrophoneEnabled(false); } catch(e){}
      triggerToast("Muted.");
    }
  };

  const triggerEmoji = (emoji: string) => {
    if (activeRoom && authState?.userId && socket) {
      socket.emit("campfire:send_reaction", { roomId: activeRoom.id, emoji });
    }
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
  if (activeRoom.visibility === 'PRIVATE' && !authorized) {
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

  if (isSessionTerminated || !activeRoom) return null;

  // Active Voice Room Rendering
  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 py-2 text-white relative h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <CampfirePresenceToast activeToasts={activeToasts} onDismiss={dismissToast} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex flex-col"
      >
        <div className="flex flex-col md:grid md:grid-cols-[1fr_380px] gap-4 md:gap-6 w-full h-full min-h-0 pb-2 md:pb-0">
          
          {/* Campfire Visual Core Area */}
          <div className="glass-panel rounded-3xl p-2.5 md:p-6 relative flex flex-col justify-between overflow-hidden h-[48vh] shrink-0 md:h-full border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.06),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Mobile Menu Button */}
            <div className="absolute top-4 left-4 z-30 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-8 w-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center transition-all text-white backdrop-blur-md shadow-lg"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, transformOrigin: "top left" }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-14 left-4 z-40 bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl w-[260px] flex flex-col gap-4 md:hidden"
                >
                  <div>
                    <h3 className="text-white font-bold text-sm mb-2">{activeRoom.title}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan bg-brand-cyan/10 px-2 py-1 rounded-full">{activeRoom.category}</span>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-brand-purple bg-brand-purple/10 px-2 py-1 rounded-full">{activeRoom.mood}</span>
                    </div>
                    {activeRoom.description && (
                      <p className="text-[10px] text-zinc-400 italic mb-4 pb-4 border-b border-white/10">"{activeRoom.description}"</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeRoom.id);
                        triggerToast("Campfire ID copied!");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left p-2 text-xs font-bold text-zinc-300 hover:bg-white/5 rounded-lg flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4 text-brand-cyan" /> Copy Campfire ID
                    </button>
                    <button onClick={() => router.push("/profile/campfires")} className="w-full text-left p-2 text-xs font-bold text-zinc-300 hover:bg-white/5 rounded-lg flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Leave Campfire
                    </button>
                    {isUserHost && (
                      <>
                        <button onClick={() => { if(confirm("End session?")) endCampfire.mutate(activeRoom.id); }} className="w-full text-left p-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2">
                          <Power className="h-4 w-4" /> End Session
                        </button>
                        <button onClick={() => { if(confirm("Delete campfire?")) deleteCampfire.mutate(activeRoom.id); }} className="w-full text-left p-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2">
                          <Trash2 className="h-4 w-4" /> Delete Campfire
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Right Copy Button (Same size on both phone & desktop) */}
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-40 block">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeRoom.id);
                  triggerToast("Campfire ID copied!");
                }}
                className="h-10 w-10 rounded-full bg-black/60 border border-white/15 hover:bg-white/20 hover:border-white/30 flex items-center justify-center transition-all cursor-pointer text-zinc-200 hover:text-white shadow-xl backdrop-blur-md"
                title="Copy Campfire ID"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            {/* Top Left Tags */}
            <div className="absolute top-4 left-4 hidden md:flex flex-col gap-1.5 z-20 pointer-events-none">
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-1 rounded-full w-max backdrop-blur-md shadow-sm">
                {activeRoom.category}
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-1 rounded-full w-max backdrop-blur-md shadow-sm">
                {activeRoom.mood}
              </span>
            </div>

            {/* Top Center Title */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 z-20 pointer-events-none w-max max-w-[45%]">
              <div className="flex items-center justify-center gap-2 bg-black/50 border border-white/5 backdrop-blur-lg px-4 py-1.5 rounded-full shadow-lg">
                <h1 className="text-xs font-bold tracking-tight text-white line-clamp-1">
                  {activeRoom.title}
                </h1>
                <div className="w-px h-3 bg-white/20 mx-1"></div>
                {activeRoom.visibility === 'PRIVATE' ? (
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-brand-purple shrink-0">
                    <Lock className="h-2.5 w-2.5" /> Private
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-emerald-400 shrink-0">
                    <Unlock className="h-2.5 w-2.5" /> Public
                  </span>
                )}
              </div>
            </div>

            {/* THE Campfire CIRCLE GRAPH CONTAINER */}
            <div className="relative flex-1 flex items-center justify-center min-h-[150px] w-full select-none overflow-hidden my-auto">
              <div className="relative flex items-center justify-center w-[310px] h-[310px] scale-[0.66] md:scale-100 transition-transform origin-center shrink-0">
                
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
              <div className="absolute border border-white/5 rounded-full w-[240px] h-[240px] pointer-events-none" />

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
                      transform: `translate(-50%, -50%)`,
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
                    ) : idx === 0 ? (
                      <div
                        onClick={() => triggerToast("The Host has temporarily stepped away. This top seat is strictly reserved and will auto-seat the Host immediately upon return.")}
                        className="flex flex-col items-center justify-center h-14 w-14 rounded-full border-2 border-dashed border-purple-500/30 bg-purple-500/5 transition-all cursor-not-allowed relative shrink-0 aspect-square select-none group"
                        style={{ width: "56px", height: "56px", minWidth: "56px", minHeight: "56px" }}
                        title="Reserved exclusively for the Host"
                      >
                        <div className="h-5 w-5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-inner">
                          <span className="text-xs text-purple-400 font-black">👑</span>
                        </div>
                        <span className="absolute -bottom-5 text-[7px] font-extrabold text-purple-300 uppercase tracking-widest scale-85 select-none bg-zinc-950/95 px-1.5 py-0.5 rounded border border-purple-500/40 shadow-lg whitespace-nowrap">
                          Host Away
                        </span>
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
          </div>

            {/* Bottom Controls Wrapper (holds Rule + Tools) */}
            <div className="z-20 flex flex-col gap-1.5 mt-auto shrink-0 pt-1 pb-0.5">
              
              {/* Bottom Center Rule/Description in normal flow */}
              {activeRoom.description && activeRoom.description.trim() !== "" && activeRoom.description.trim() !== "No description provided." && (
                <div className="hidden md:flex justify-center w-full max-w-[80%] mx-auto pointer-events-none">
                  <div className="bg-black/50 border border-white/5 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl text-center inline-block">
                    <p className="text-[11px] text-zinc-300 italic">
                      "{activeRoom.description.trim()}"
                    </p>
                  </div>
                </div>
              )}

              {/* BOTTOM CONTROL PANEL */}
              <div className="flex flex-row items-center justify-center flex-wrap gap-2 md:gap-4 bg-zinc-950/80 border border-white/5 px-3 py-2 md:p-4 rounded-2xl backdrop-blur-md self-center mx-auto mb-0 w-max max-w-full">
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={handleMicToggle}
                    className={`h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer relative group shrink-0 ${
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
                      <MicOff className="h-4 w-4 md:h-4.5 md:w-4.5 transition-transform group-hover:scale-110" />
                    ) : (
                      <Mic className="h-4 w-4 md:h-4.5 md:w-4.5 transition-transform group-hover:scale-110" />
                    )}
                  </button>

                  {userSeatIndex !== null && (
                    <button
                      onClick={handleLeaveSeat}
                      className="h-9 px-3 md:h-11 md:px-4 rounded-xl text-[10px] md:text-xs font-bold bg-white/5 border border-white/10 text-rose-400 hover:bg-white/10 hover:text-rose-350 cursor-pointer transition-all"
                    >
                      Leave Seat
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setHasRaisedHand(!hasRaisedHand);
                      if(!hasRaisedHand) triggerToast("Hand raised!");
                    }}
                    className={`h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      hasRaisedHand
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-500 hover:bg-amber-500/30"
                      : "bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white"
                    }`}
                    title="Request to speak"
                  >
                    <span className="text-sm md:text-lg">✋</span>
                  </button>
                  
                  {/* Floating Reactions Emoji Button */}
                  <div className="relative">
                    <button
                      onClick={() => setIsEmojiMenuOpen(!isEmojiMenuOpen)}
                      className="h-9 w-9 md:h-11 md:w-11 rounded-xl flex items-center justify-center bg-white/[0.02] border border-white/10 transition-all cursor-pointer shrink-0 hover:bg-white/10 text-sm md:text-lg"
                      title="React"
                    >
                      😀
                    </button>
                    <AnimatePresence>
                      {isEmojiMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1.5 bg-zinc-900 p-2 rounded-xl border border-white/10 shadow-2xl z-50"
                        >
                          {["🔥", "👏", "😂", "❤️", "😮"].map((emo) => (
                            <button
                              key={emo}
                              onClick={() => { triggerEmoji(emo); setIsEmojiMenuOpen(false); }}
                              className="h-8 w-8 text-lg rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                            >
                              {emo}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-1">
                    TOOLS:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => {
                        leaveRoom(activeRoom.id, authState.userId!);
                        disconnectVoice();
                        router.push("/profile/campfires");
                      }}
                      className="p-2 rounded-lg bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 hover:text-white hover:bg-zinc-500/20 transition-all shadow-sm cursor-pointer" 
                      title="Leave Campfire"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>

                    {isUserHost && (
                      <>
                        <div className="w-px h-5 bg-white/10 mx-1"></div>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to end this session for everyone?")) {
                              endCampfire.mutate(activeRoom.id, {
                                onSuccess: () => {
                                  triggerToast("Session Ended");
                                  leaveRoom(activeRoom.id, authState.userId!);
                                  disconnectVoice();
                                  router.push("/profile/campfires");
                                }
                              });
                            }
                          }}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-all shadow-sm cursor-pointer" 
                          title="End Session"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this campfire?")) {
                              deleteCampfire.mutate(activeRoom.id, {
                                onSuccess: () => {
                                  triggerToast("Campfire deleted.");
                                  router.push('/profile/campfires');
                                }
                              });
                            }
                          }}
                          className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:text-red-400 hover:bg-red-500/20 transition-all shadow-sm cursor-pointer" 
                          title="Delete Campfire"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Panel Right */}
          <ChatContainer 
            roomId={activeRoom.id}
            socket={socket}
            campfireTitle={activeRoom.title} 
            participantCount={Math.max(((activeRoom.currentSpeakers || 0) + (activeRoom.currentListeners || 0)) || 1, seatOccupants.filter(Boolean).length + listenersList.length)}
            currentUser={{
              id: authState.userId!,
              fullName: currentUserProfile?.displayName || authState.name || "Guest",
              role: isUserHost ? "Host" : (userSeatIndex !== null ? "Speaker" : "Listener"),
              avatar: currentUserProfile?.avatarUrl || null
            }} 
          />
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
