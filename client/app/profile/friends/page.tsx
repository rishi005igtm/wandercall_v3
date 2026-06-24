'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Flame
} from "lucide-react";

// ==========================================
// Mock Data Definition
// ==========================================

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

const COMPANIONS: Companion[] = [
  {
    id: "f-1",
    name: "Arjun Mehta",
    username: "@arjun_m",
    avatar: "🏔️",
    status: "Exploring",
    compatibility: 92,
    sharedDNA: "Explorer",
    mutualExperiences: 8,
    mutualCommunities: 5,
    bio: "Summit bagger & dive master. Lives in the water. Trekking the Western Ghats this weekend.",
    location: "Bangalore, India",
    tags: ["High Altitude", "Scuba", "Adrenaline"],
    isFavorite: true,
    isAdventurePartner: true,
    lastActive: "Active now"
  },
  {
    id: "f-2",
    name: "Sara Khan",
    username: "@sara_k",
    avatar: "📸",
    status: "Available",
    compatibility: 88,
    sharedDNA: "Creative",
    mutualExperiences: 5,
    mutualCommunities: 3,
    bio: "Landscape photographer & twilight stargazer. Documenting heritage cafes and old roads.",
    location: "Mumbai, India",
    tags: ["Astro Photo", "Culinary", "Road Trips"],
    isFavorite: true,
    isAdventurePartner: false,
    lastActive: "Active 5m ago"
  },
  {
    id: "f-3",
    name: "Divya Kapoor",
    username: "@divya_k",
    avatar: "🖋️",
    status: "In Campfire",
    compatibility: 76,
    sharedDNA: "Storyteller",
    mutualExperiences: 3,
    mutualCommunities: 4,
    bio: "Backpacker across Southeast Asia. Hosting campfire chatrooms on local folklore and myths.",
    location: "Delhi, India",
    tags: ["Journaling", "History", "Folklore"],
    isFavorite: false,
    isAdventurePartner: true,
    lastActive: "Active now"
  },
  {
    id: "f-4",
    name: "Karan Johar",
    username: "@karan_j",
    avatar: "🎒",
    status: "Hosting",
    compatibility: 84,
    sharedDNA: "Learner",
    mutualExperiences: 4,
    mutualCommunities: 6,
    bio: "Ecology researcher and off-grid pathfinder. Passionate about forest biodiversity preservation.",
    location: "Coorg, India",
    tags: ["Forestry", "Biodiversity", "Mapping"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 15m ago"
  },
  {
    id: "f-5",
    name: "Neha Nair",
    username: "@neha_n",
    avatar: "⛺",
    status: "Busy",
    compatibility: 72,
    sharedDNA: "Explorer",
    mutualExperiences: 2,
    mutualCommunities: 3,
    bio: "Hammock camper and solo highway rider. Always searching for lakeside campsites and starry skies.",
    location: "Kochi, India",
    tags: ["Solo Camp", "Motorcycling", "Stargazing"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 2h ago"
  },
  {
    id: "f-6",
    name: "Rohan Das",
    username: "@rohan_d",
    avatar: "🌊",
    status: "Offline",
    compatibility: 68,
    sharedDNA: "Creative",
    mutualExperiences: 1,
    mutualCommunities: 2,
    bio: "Marine conservation volunteer. Surfer, diver, and underwater video creator.",
    location: "Goa, India",
    tags: ["Conservation", "Surfing", "Vlogging"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 1d ago"
  }
];

const PENDING_INCOMING = [
  {
    id: "pi-1",
    name: "Vikram Malhotra",
    username: "@vikram_m",
    avatar: "🧗",
    compatibility: 91,
    mutualFriends: 4,
    bio: "Free soloist climber and paragliding enthusiast. Looking for Coorg trail companions.",
    status: "Incoming"
  },
  {
    id: "pi-2",
    name: "Ananya Iyer",
    username: "@ananya_i",
    avatar: "🎨",
    compatibility: 83,
    mutualFriends: 3,
    bio: "Travel sketcher and visual storyteller mapping ancient temple sculptures.",
    status: "Incoming"
  },
  {
    id: "pi-3",
    name: "Devendra Patil",
    username: "@devendra_p",
    avatar: "🎒",
    compatibility: 87,
    mutualFriends: 2,
    bio: "Motorcyclist and off-road trail finder. Mapping forest routes.",
    status: "Incoming"
  },
  {
    id: "pi-4",
    name: "Meera Sen",
    username: "@meera_s",
    avatar: "📷",
    compatibility: 79,
    mutualFriends: 5,
    bio: "Landscape and wildlife photographer documenting river streams.",
    status: "Incoming"
  },
  {
    id: "pi-5",
    name: "Aditya Roy",
    username: "@aditya_r",
    avatar: "🚲",
    compatibility: 82,
    mutualFriends: 1,
    bio: "Long distance cyclist and coordinate mapping contributor.",
    status: "Incoming"
  },
  {
    id: "pi-6",
    name: "Tara Choudhury",
    username: "@tara_c",
    avatar: "⛺",
    compatibility: 90,
    mutualFriends: 3,
    bio: "Hammock camper and solo wilderness trail guide.",
    status: "Incoming"
  },
  {
    id: "pi-7",
    name: "Kabir Sen",
    username: "@kabir_s",
    avatar: "🎒",
    compatibility: 85,
    mutualFriends: 2,
    bio: "Solo trekker across North India trails.",
    status: "Incoming"
  },
  {
    id: "pi-8",
    name: "Zoya Ali",
    username: "@zoya_a",
    avatar: "🌅",
    compatibility: 89,
    mutualFriends: 4,
    bio: "Sunset photography and nature travel writer.",
    status: "Incoming"
  },
  {
    id: "pi-9",
    name: "Rahul Verma",
    username: "@rahul_v",
    avatar: "🧗",
    compatibility: 86,
    mutualFriends: 3,
    bio: "Lead climber & gear specialist. Preparing for an upcoming expedition.",
    status: "Incoming"
  },
  {
    id: "pi-10",
    name: "Isha Malhotra",
    username: "@isha_m",
    avatar: "🎨",
    compatibility: 91,
    mutualFriends: 5,
    bio: "Nature painter and mapmaker. Mapping hidden water pools.",
    status: "Incoming"
  }
];

const PENDING_OUTGOING = [
  {
    id: "po-1",
    name: "Cody Fisher",
    username: "@cody_f",
    avatar: "🏄",
    compatibility: 79,
    status: "Pending Sent"
  },
  {
    id: "po-2",
    name: "Sneha Reddy",
    username: "@sneha_r",
    avatar: "🚲",
    compatibility: 85,
    status: "Pending Sent"
  },
  {
    id: "po-3",
    name: "Arjun Sharma",
    username: "@arjun_s",
    avatar: "⛺",
    compatibility: 92,
    status: "Pending Sent"
  },
  {
    id: "po-4",
    name: "Rohan Mehta",
    username: "@rohan_m",
    avatar: "🧗",
    compatibility: 76,
    status: "Pending Sent"
  },
  {
    id: "po-5",
    name: "Nisha Patel",
    username: "@nisha_p",
    avatar: "🎨",
    compatibility: 88,
    status: "Pending Sent"
  },
  {
    id: "po-6",
    name: "Dinesh Kumar",
    username: "@dinesh_k",
    avatar: "🚲",
    compatibility: 78,
    status: "Pending Sent"
  },
  {
    id: "po-7",
    name: "Riya Verma",
    username: "@riya_v",
    avatar: "⛺",
    compatibility: 84,
    status: "Pending Sent"
  },
  {
    id: "po-8",
    name: "Karan Gupta",
    username: "@karan_g",
    avatar: "🏄",
    compatibility: 81,
    status: "Pending Sent"
  },
  {
    id: "po-9",
    name: "Siddharth Sen",
    username: "@sid_s",
    avatar: "🧗",
    compatibility: 89,
    status: "Pending Sent"
  },
  {
    id: "po-10",
    name: "Pooja Sharma",
    username: "@pooja_s",
    avatar: "⛺",
    compatibility: 90,
    status: "Pending Sent"
  }
];

const SUGGESTED_EXPLORERS = [
  {
    id: "s-1",
    name: "Aria Sharma",
    username: "@aria_s",
    avatar: "💫",
    compatibility: 95,
    sharedDNA: "Explorer",
    reason: "You both joined 6 adventure communities and completed 4 identical trek quests."
  },
  {
    id: "s-2",
    name: "Kabir Mehta",
    username: "@kabir_m",
    avatar: "🚲",
    compatibility: 89,
    sharedDNA: "Learner",
    reason: "Attended the same campfire 'Summiting Mount Everest Solo' and maps cycling routes."
  },
  {
    id: "s-3",
    name: "Zoe Chen",
    username: "@zoe_c",
    avatar: "🌅",
    compatibility: 87,
    sharedDNA: "Creative",
    reason: "Shares interest in twilight photography and has 12 mutual explorer connections."
  }
];

const BLOCKED_USERS = [
  {
    id: "b-1",
    name: "Dianne Russell",
    username: "@dianne_r",
    avatar: "👤",
    reason: "Disruptive microphone noise in voice campfire.",
    blockedAt: "Blocked June 22, 2026",
    status: "Blocked"
  },
  {
    id: "b-2",
    name: "Cody Fisher",
    username: "@cody_f",
    avatar: "👤",
    reason: "Spamming commercial links in community chat board.",
    blockedAt: "Blocked June 18, 2026",
    status: "Blocked"
  },
  {
    id: "b-3",
    name: "Devon Lane",
    username: "@devon_l",
    avatar: "👤",
    reason: "Harassment in private chat coordinates.",
    blockedAt: "Blocked June 15, 2026",
    status: "Blocked"
  },
  {
    id: "b-4",
    name: "Ronald Richards",
    username: "@ronald_r",
    avatar: "👤",
    reason: "Unsolicited promotional messages.",
    blockedAt: "Blocked June 12, 2026",
    status: "Blocked"
  },
  {
    id: "b-5",
    name: "Albert Flores",
    username: "@albert_f",
    avatar: "👤",
    reason: "Spoofing GPS location on community maps.",
    blockedAt: "Blocked June 10, 2026",
    status: "Blocked"
  },
  {
    id: "b-6",
    name: "Eleanor Pena",
    username: "@eleanor_p",
    avatar: "👤",
    reason: "Inappropriate language in campfire lobby.",
    blockedAt: "Blocked June 08, 2026",
    status: "Blocked"
  },
  {
    id: "b-7",
    name: "Savannah Nguyen",
    username: "@savannah_n",
    avatar: "👤",
    reason: "Sharing fake coordinate map safety logs.",
    blockedAt: "Blocked June 05, 2026",
    status: "Blocked"
  },
  {
    id: "b-8",
    name: "Kristin Watson",
    username: "@kristin_w",
    avatar: "👤",
    reason: "Disruptive voice chat behaviors.",
    blockedAt: "Blocked June 03, 2026",
    status: "Blocked"
  },
  {
    id: "b-9",
    name: "Jane Cooper",
    username: "@jane_c",
    avatar: "👤",
    reason: "Spamming join requests to private campfire squad.",
    blockedAt: "Blocked May 30, 2026",
    status: "Blocked"
  },
  {
    id: "b-10",
    name: "Leslie Alexander",
    username: "@leslie_a",
    avatar: "👤",
    reason: "Using automated bots to crawl explorer lists.",
    blockedAt: "Blocked May 28, 2026",
    status: "Blocked"
  },
  {
    id: "b-11",
    name: "Guy Hawkins",
    username: "@guy_h",
    avatar: "👤",
    reason: "Disruptive microphone noise in audio campfires.",
    blockedAt: "Blocked May 25, 2026",
    status: "Blocked"
  },
  {
    id: "b-12",
    name: "Theresa Webb",
    username: "@theresa_w",
    avatar: "👤",
    reason: "Repeated coordinate map spamming.",
    blockedAt: "Blocked May 22, 2026",
    status: "Blocked"
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

export default function FriendsPage() {
  const companionListRef = useNestedScroll();
  const chatStreamRef = useNestedScroll();
  const pendingViewRef = useNestedScroll();
  const blockedViewRef = useNestedScroll();
  const suggestedViewRef = useNestedScroll();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "favorites" | "partners" | "online" | "pending" | "blocked" | "suggested" | "recent"
  >("all");

  const [activeFriendId, setActiveFriendId] = useState<string>("f-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMobileView, setActiveMobileView] = useState<"rail" | "chat" | "inspector">("rail");

  // Local state for mutations
  const [companions, setCompanions] = useState<Companion[]>(COMPANIONS);
  const [incomingRequests, setIncomingRequests] = useState(PENDING_INCOMING);
  const [outgoingRequests, setOutgoingRequests] = useState(PENDING_OUTGOING);
  const [suggestedExplorers, setSuggestedExplorers] = useState(SUGGESTED_EXPLORERS);
  const [blockedUsers, setBlockedUsers] = useState(BLOCKED_USERS);
  const [chatMessages, setChatMessages] = useState<Record<string, any[]>>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");

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

  // Auto scroll chat to bottom
  useEffect(() => {
    const container = chatStreamRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [chatMessages, activeFriendId]);

  // Find active selected friend profile
  const activeFriend = useMemo(() => {
    return companions.find(f => f.id === activeFriendId) || companions[0];
  }, [companions, activeFriendId]);

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
  const filteredListCompanions = useMemo(() => {
    return companions.filter(f => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === "favorites") return f.isFavorite;
      if (selectedCategory === "partners") return f.isAdventurePartner;
      if (selectedCategory === "online") return f.status !== "Offline";

      return true; // "all" and others
    });
  }, [companions, selectedCategory, searchQuery]);

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
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `m-custom-${Date.now()}`,
      sender: "me",
      text: chatInput,
      type: "text",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeFriendId]: [...(prev[activeFriendId] || []), newMsg]
    }));
    setChatInput("");
  };

  const handleSendExperience = () => {
    const newMsg = {
      id: `m-exp-${Date.now()}`,
      sender: "me",
      type: "experience",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        title: "Alpine Cliff Dive Experience",
        host: "Bear G.",
        date: "June 29 at 3:00 PM",
        category: "Adventure",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop"
      }
    };
    setChatMessages(prev => ({
      ...prev,
      [activeFriendId]: [...(prev[activeFriendId] || []), newMsg]
    }));
  };

  const handleSendPlan = () => {
    const newMsg = {
      id: `m-plan-${Date.now()}`,
      sender: "me",
      type: "plan",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        title: "Gokarna Cliff Dive & Coastal Camp",
        date: "July 04-06",
        location: "Gokarna Beach",
        companions: ["Rishiraj", activeFriend.name],
        status: "Planning"
      }
    };
    setChatMessages(prev => ({
      ...prev,
      [activeFriendId]: [...(prev[activeFriendId] || []), newMsg]
    }));
  };

  // Unblock user
  const handleUnblock = (id: string, name: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
    alert(`${name} has been unblocked.`);
  };

  // Accept request
  const handleAcceptRequest = (request: typeof PENDING_INCOMING[0]) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== request.id));

    // Add to companions
    const newCompanion: Companion = {
      id: `f-added-${Date.now()}`,
      name: request.name,
      username: request.username,
      avatar: request.avatar,
      status: "Available",
      compatibility: request.compatibility,
      sharedDNA: "Explorer",
      mutualExperiences: 1,
      mutualCommunities: request.mutualFriends,
      bio: request.bio,
      location: "Unknown",
      tags: ["Trekking", "Companion"],
      isFavorite: false,
      isAdventurePartner: false,
      lastActive: "Active now"
    };

    setCompanions(prev => [...prev, newCompanion]);
    alert(`You are now friends with ${request.name}!`);
  };

  // Decline request
  const handleDeclineRequest = (id: string, name: string) => {
    setIncomingRequests(prev => prev.filter(r => r.id !== id));
    alert(`Friend request from ${name} declined.`);
  };

  // Add friend from discovery
  const handleSendRequest = (suggested: typeof SUGGESTED_EXPLORERS[0]) => {
    setSuggestedExplorers(prev => prev.filter(s => s.id !== suggested.id));
    const newRequest = {
      id: `po-added-${Date.now()}`,
      name: suggested.name,
      username: suggested.username,
      avatar: suggested.avatar,
      compatibility: suggested.compatibility,
      status: "Pending Sent"
    };
    setOutgoingRequests(prev => [...prev, newRequest]);
    alert(`Friend request sent to ${suggested.name}.`);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 text-white flex flex-col gap-6 select-none font-sans overflow-x-hidden">

      {/* 1. FRIENDS COMMAND CENTER (STATUS RIBBON) */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 shadow-md flex items-center justify-between gap-4 w-full shrink-0 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-8 w-full sm:w-auto justify-around sm:justify-start">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Friends</span>
            <span className="text-lg font-black text-white">{companions.length}</span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Partners</span>
            <span className="text-lg font-black text-brand-purple">
              {companions.filter(f => f.isAdventurePartner).length}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Requests</span>
            <span className="text-lg font-black text-brand-cyan">{incomingRequests.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl w-full sm:max-w-[280px]">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search friends & DNA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold"
          />
        </div>
      </div>

      {/* 2. CATEGORY HORIZONTAL SELECTOR MENU BAR */}
      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 w-full p-2 bg-zinc-950/20 border border-white/5 rounded-2xl shrink-0 select-none" data-lenis-prevent>
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
      </div>

      {/* 3. FRIENDS WORKSPACE (OPERATIONAL CONTAINER) */}
      <div className="w-full flex flex-col gap-4 min-h-[500px]">

        {/* Right Side: Active Workspace */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className={`glass-panel rounded-3xl p-5 border border-white/5 flex flex-col justify-between overflow-hidden ${
            selectedCategory === "pending" ? "h-auto min-h-[650px]" : "h-[650px]"
          }`}>

            {/* VIEW A: CHAT WORKSPACE & CONVERSATION */}
            {(["all", "favorites", "partners", "online", "recent"].includes(selectedCategory)) && (
              <div className="flex flex-col lg:flex-row gap-5 items-stretch flex-1 w-full min-w-0 h-full">

                {/* 1. Sub-left Friend Selection List (Hidden on mobile when chat is active) */}
                <div className={`w-full lg:w-[240px] shrink-0 flex flex-col gap-2 lg:border-r lg:border-white/5 lg:pr-4 ${activeMobileView === "chat" || activeMobileView === "inspector" ? "hidden lg:flex" : "flex"
                  }`}>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500 pb-2 border-b border-white/5">
                    Select Companion
                  </div>
                  <div ref={companionListRef} className="flex flex-col gap-1.5 overflow-y-auto flex-1 no-scrollbar pr-1">
                    {filteredListCompanions.map(friend => {
                      const isSelected = activeFriendId === friend.id;
                      return (
                        <div
                          key={friend.id}
                          onClick={() => {
                            if (isMobile) {
                              router.push(`/profile/friends/chat:${friend.id}`);
                            } else {
                              setActiveFriendId(friend.id);
                              setActiveMobileView("chat");
                            }
                          }}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer border transition-all scale-100 hover:scale-[1.01] ${isSelected
                              ? "bg-white/[0.03] border-brand-cyan/20 shadow-md"
                              : "bg-white/[0.01] border-white/5 hover:border-white/10"
                            }`}
                        >
                          <div className="relative shrink-0">
                            <span className="text-xl">{friend.avatar}</span>
                            <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ${getStatusColor(friend.status)} border-2 border-zinc-950`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-zinc-200 truncate">{friend.name}</h4>
                              <span className="text-[8px] font-mono text-zinc-500 shrink-0">{friend.compatibility}%</span>
                            </div>
                            <p className="text-[9px] text-zinc-500 truncate mt-0.5">{friend.status} • {friend.sharedDNA}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sub-center Conversational Chat (Visible on mobile in chat view) */}
                <div className={`flex-1 flex flex-col justify-between min-h-[380px] lg:border-r lg:border-white/5 lg:pr-4 min-w-0 ${activeMobileView === "chat" ? "flex" : activeMobileView === "inspector" ? "hidden lg:flex" : "hidden lg:flex"
                  }`}>

                  {/* Chat Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mobile back button */}
                      <button
                        onClick={() => setActiveMobileView("rail")}
                        className="lg:hidden p-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="relative">
                        <span className="text-2xl">{activeFriend.avatar}</span>
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(activeFriend.status)} border-2 border-zinc-950`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-white truncate flex items-center gap-1.5">
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
                      <button
                        onClick={() => alert(`Calling ${activeFriend.name}...`)}
                        className="p-2 rounded-xl bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Voice Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => alert(`Inviting ${activeFriend.name} to a campfire lobby...`)}
                        className="p-2 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                        title="Invite to Campfire"
                      >
                        <Flame className="h-3.5 w-3.5" /> Invite
                      </button>

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
                    className="flex-1 py-4 overflow-y-auto custom-scrollbar pr-2"
                  >
                    {(chatMessages[activeFriendId] || []).length > 0 ? (
                      <div className="space-y-3">
                        {(chatMessages[activeFriendId] || []).map((msg) => {
                          const isMe = msg.sender === "me";

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                            >
                              {msg.type === "text" && (
                                <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${isMe
                                    ? "bg-brand-cyan text-zinc-950 rounded-tr-none font-semibold shadow-md shadow-brand-cyan/5"
                                    : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/5"
                                  }`}>
                                  {msg.text}
                                </div>
                              )}

                              {msg.type === "audio" && (
                                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-3 w-64">
                                  <button
                                    onClick={() => alert("Playing audio note...")}
                                    className="h-8 w-8 rounded-full bg-brand-cyan text-zinc-950 flex items-center justify-center shrink-0 cursor-pointer"
                                  >
                                    <Compass className="h-4 w-4 fill-zinc-950" />
                                  </button>
                                  <div className="flex-1 flex items-center gap-1">
                                    {msg.metadata.waves.map((h: number, i: number) => (
                                      <span
                                        key={i}
                                        className="h-3 bg-zinc-650 flex-1 rounded-full"
                                        style={{ height: `${h * 0.4}px` }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[9px] font-mono text-zinc-500 shrink-0">{msg.metadata.duration}</span>
                                </div>
                              )}

                              {msg.type === "experience" && (
                                <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-lg w-64 text-left">
                                  <div className="h-28 w-full relative">
                                    <img src={msg.metadata.image} className="h-full w-full object-cover opacity-80" alt="" />
                                    <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full">
                                      {msg.metadata.category}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-2">
                                    <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                                    <p className="text-[9px] text-zinc-500">{msg.metadata.date} • Host: {msg.metadata.host}</p>
                                    <button
                                      onClick={() => alert(`Booking slot for ${msg.metadata.title}...`)}
                                      className="w-full py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                                    >
                                      Request Slot
                                    </button>
                                  </div>
                                </div>
                              )}

                              {msg.type === "plan" && (
                                <div className="glass-panel border border-white/10 p-3.5 rounded-2xl shadow-lg w-64 text-left space-y-3">
                                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                                    <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-purple text-white px-2 py-0.5 rounded-full">
                                      Adventure Plan
                                    </span>
                                    <span className="text-[8px] font-mono text-brand-cyan font-bold">{msg.metadata.status}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                                    <p className="text-[9px] text-zinc-500 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-zinc-400" /> {msg.metadata.location}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 font-mono">Date: {msg.metadata.date}</p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {msg.metadata.companions.map((name: string, i: number) => (
                                      <span key={i} className="h-5 px-2 bg-white/5 border border-white/5 text-[8px] font-bold rounded-md text-zinc-300">
                                        {name.split(" ")[0]}
                                      </span>
                                    ))}
                                    <button
                                      onClick={() => alert("Added to adventure plan cohort!")}
                                      className="h-5 w-5 bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white rounded-md flex items-center justify-center text-[10px] transition-all cursor-pointer"
                                      title="Join plan"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              )}

                              <span className="text-[8px] text-zinc-650 mt-1 font-mono">{msg.timestamp}</span>
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
                          {getIcebreakers(activeFriend).map((prompt, idx) => (
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

                  {/* Chat Input controls */}
                  <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
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
                        onClick={() => alert("Simulating mic trigger...")}
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
                </div>

                {/* 3. Sub-right Friend Inspector / Insights (Visible on mobile in inspector view) */}
                <div className={`w-full lg:w-[260px] shrink-0 flex flex-col justify-between min-h-[380px] min-w-0 ${activeMobileView === "inspector" ? "flex" : "hidden lg:flex"
                  }`}>
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
                        <span className="text-3xl">{activeFriend.avatar}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{activeFriend.name}</h4>
                          <span className="text-[9px] text-zinc-500">{activeFriend.username}</span>
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
                        onClick={() => alert(`User reported.`)}
                        className="w-full py-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Flag className="h-3 w-3" /> Report Explorer
                      </button>
                      <button
                        onClick={() => {
                          const updated = companions.map(f => f.id === activeFriend.id ? { ...f, isFavorite: !f.isFavorite } : f);
                          setCompanions(updated);
                          alert(activeFriend.isFavorite ? "Removed from Favorites" : "Added to Favorites");
                        }}
                        className="w-full py-1.5 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Heart className="h-3 w-3" /> {activeFriend.isFavorite ? "Unfavorite" : "Favorite"}
                      </button>
                      <button
                        onClick={() => {
                          const isBlocked = blockedUsers.some(u => u.id === activeFriend.id);
                          if (isBlocked) {
                            alert(`${activeFriend.name} is already blocked.`);
                            return;
                          }
                          const newBlocked = {
                            id: activeFriend.id,
                            name: activeFriend.name,
                            username: activeFriend.username,
                            avatar: activeFriend.avatar,
                            reason: "Blocked by user from explorer details panel",
                            blockedAt: `Blocked ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
                            status: "Blocked" as const
                          };
                          setBlockedUsers(prev => [...prev, newBlocked]);
                          setCompanions(prev => prev.filter(c => c.id !== activeFriend.id));
                          alert(`${activeFriend.name} has been blocked.`);
                        }}
                        className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="h-3 w-3" /> Block Explorer
                      </button>
                    </div>
                  </div>
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
                <div ref={pendingViewRef} className="space-y-6 flex-1 w-full text-left overflow-visible">

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
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{req.avatar}</span>
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
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{req.avatar}</span>
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
                            <span className="text-xl px-2 py-1.5 rounded-full bg-white/5 shrink-0">👤</span>
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
                            <span className="text-2xl">{explorer.avatar}</span>
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
