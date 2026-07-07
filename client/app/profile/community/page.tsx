"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Compass,
  Award,
  Zap,
  Flame,
  Calendar,
  Sparkles,
  MessageSquare,
  Lock,
  CheckCircle2,
  Trophy,
  Volume2,
  Plus,
  ArrowRight,
  Target,
  UserPlus,
  Star,
  Map,
  Search,
  Check,
  Activity,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useExplorerCirclesGraph, useUserSearch, ExplorerCircleNode, SearchUserItem } from "@/hooks/api/useDiscovery";
import { useFollowMutation } from "@/hooks/api/useUserMutations";
import { RelationshipButton } from "@/components/shared/RelationshipButton";
import { useAppSelector, useAppDispatch } from "@/lib/store/store";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { useGalaxy, useDiscoverCommunities, useMyCommunities } from "@/hooks/useCommunity";
import { toggleClusterSelection, setSearchQuery as setDiscoverySearchQuery, setMapLoaded, clearFilters } from "@/lib/store/slices/communityDiscoverySlice";

// Mock Data Interfaces
interface JoinedCommunity {
  id: string;
  name: string;
  avatar: string;
  banner: string;
  members: number;
  liveStatus: "Campfire Active" | "Active Now" | "Idle" | "Event Live";
  unreadCount: number;
  energyScore: "Low Energy" | "Active" | "Thriving" | "Legendary";
  recentActivity: string;
  upcomingEvent?: string;
}

interface CompanionOrbitNode {
  id: string;
  name: string;
  username: string;
  avatar: string;
  compatibility: number;
  sharedDNA: "Explorer" | "Creative" | "Socializer";
  mutualExperiences: number;
  mutualCommunities: number;
  mutualFriends: number;
  bio: string;
  tags: string[];
  communities: string[];
  level?: number;
  reputationScore?: number;
  location?: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  reasons?: string[];
}

interface CommunityTrophy {
  id: string;
  title: string;
  requirement: string;
  unlocked: boolean;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Legendary";
  dateUnlocked?: string;
}

interface CommunityNode {
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  category: string;
  members: number;
  activeEvents: number;
  friendsInside: number;
  description: string;
  energyScore: number; // 0 to 100
}

interface ClusterMeta {
  id: string;
  name: string;
  category: string;
  theme: string;
  color: string;
  glow: string;
  icon: string;
}

// 8 Cluster metadata configurations
const CLUSTER_METADATA: ClusterMeta[] = [
  { id: "c-adventure", name: "Adventure", category: "Adventure", theme: "Trekking, Diving, Surfing", color: "stroke-brand-cyan fill-brand-cyan/20", glow: "rgba(6, 182, 212, 0.4)", icon: "🏔️" },
  { id: "c-food", name: "Food & Eats", category: "Food", theme: "Street Food, Heritage Cafes", color: "stroke-brand-purple fill-brand-purple/20", glow: "rgba(139, 92, 246, 0.4)", icon: "🍛" },
  { id: "c-photography", name: "Photography", category: "Photography", theme: "Landscapes, Wildlife, Street", color: "stroke-brand-emerald fill-brand-emerald/20", glow: "rgba(16, 185, 129, 0.4)", icon: "📸" },
  { id: "c-storytelling", name: "Storytelling", category: "Storytelling", theme: "History Trails, Writing", color: "stroke-brand-amber fill-brand-amber/20", glow: "rgba(245, 158, 11, 0.4)", icon: "🖋️" },
  { id: "c-travel", name: "Travel & Nomads", category: "Travel", theme: "Solo Backpackers, Homestays", color: "stroke-rose-500 fill-rose-500/20", glow: "rgba(244, 63, 94, 0.4)", icon: "✈️" },
  { id: "c-fitness", name: "Fitness & Runs", category: "Fitness", theme: "Trail Runs, Road Cycling", color: "stroke-blue-500 fill-blue-500/20", glow: "rgba(59, 130, 246, 0.4)", icon: "🚴" },
  { id: "c-learning", name: "Learning & Craft", category: "Learning", theme: "Survival Skills, Astro-gazing", color: "stroke-orange-500 fill-orange-500/20", glow: "rgba(249, 115, 22, 0.4)", icon: "🎒" },
  { id: "c-nightlife", name: "Nightlife", category: "Nightlife", theme: "Campfires, Pub Crawls", color: "stroke-pink-500 fill-pink-500/20", glow: "rgba(236, 72, 153, 0.4)", icon: "🌌" }
];

// Comprehensive database of 46 community nodes across 8 categories
const ALL_COMMUNITIES: CommunityNode[] = [
  // Adventure (8 communities)
  { id: "cn-adv1", name: "Cliff Trekkers", avatar: "🏔️", category: "Adventure", members: 1250, activeEvents: 3, friendsInside: 8, description: "Conquer scenic ridge walks and steep trail challenges across South India.", energyScore: 92 },
  { id: "cn-adv2", name: "Netrani Scuba", avatar: "🤿", category: "Adventure", members: 780, activeEvents: 1, friendsInside: 4, description: "A tribe of PADI certified divers explore marine biodiversity in the Arabian Sea.", energyScore: 84 },
  { id: "cn-adv3", name: "Bir Paragliding", avatar: "🪂", category: "Adventure", members: 450, activeEvents: 2, friendsInside: 3, description: "High thermal flights, coordinates tracking, and sky adventure planning.", energyScore: 78 },
  { id: "cn-adv4", name: "Western Hikes", avatar: "🧗", category: "Adventure", members: 620, activeEvents: 1, friendsInside: 5, description: "Weekend trekking and monsoon rainforest exploration cohorts.", energyScore: 68 },
  { id: "cn-adv5", name: "Himalayan Base", avatar: "⛺", category: "Adventure", members: 980, activeEvents: 4, friendsInside: 9, description: "High altitude treks, logistics planning, and base camp coordination.", energyScore: 96 },
  { id: "cn-adv6", name: "Gokarna Surfers", avatar: "🏄", category: "Adventure", members: 540, activeEvents: 0, friendsInside: 2, description: "Surfing, wave-riding, and beach camping cohorts in coastal Karnataka.", energyScore: 54 },
  { id: "cn-adv7", name: "Deoriatal Camps", avatar: "❄️", category: "Adventure", members: 310, activeEvents: 2, friendsInside: 1, description: "Snowy ridge treks, camping, and star trail photography hikes.", energyScore: 80 },
  { id: "cn-adv8", name: "Waterfall Walks", avatar: "🌊", category: "Adventure", members: 420, activeEvents: 1, friendsInside: 3, description: "Shorter hikes, waterfalls walks, and local nature exploration walks.", energyScore: 62 },

  // Food (7 communities)
  { id: "cn-food1", name: "Bangalore Crawl", avatar: "🍛", category: "Food", members: 2150, activeEvents: 3, friendsInside: 18, description: "Masala dosa mapping, traditional filter coffee reviews, and old market crawlers.", energyScore: 98 },
  { id: "cn-food2", name: "Heritage Foodies", avatar: "☕", category: "Food", members: 1640, activeEvents: 4, friendsInside: 12, description: "Discovering 100-year-old local restaurants, historic recipes, and legacy bites.", energyScore: 89 },
  { id: "cn-food3", name: "Street Eats Hub", avatar: "🍡", category: "Food", members: 890, activeEvents: 2, friendsInside: 6, description: "Night market mapping, chaat trails, and street food guides.", energyScore: 74 },
  { id: "cn-food4", name: "Biryani Cohorts", avatar: "🍲", category: "Food", members: 1350, activeEvents: 1, friendsInside: 7, description: "Searching for the perfect Dum Biryani, secret recipes, and history.", energyScore: 82 },
  { id: "cn-food5", name: "Cafe Hoppers", avatar: "🍰", category: "Food", members: 710, activeEvents: 0, friendsInside: 4, description: "Artisan bakeries, specialty coffee, and remote workspaces rating.", energyScore: 50 },
  { id: "cn-food6", name: "Spice Trail Guild", avatar: "🌶️", category: "Food", members: 510, activeEvents: 2, friendsInside: 3, description: "Exploring traditional spices, farm-to-table trails, and organic cooking.", energyScore: 65 },
  { id: "cn-food7", name: "Dessert Lovers", avatar: "🍦", category: "Food", members: 630, activeEvents: 1, friendsInside: 2, description: "Crafting maps for ice-creams, local sweets, and pastry gems.", energyScore: 58 },

  // Photography (4 communities)
  { id: "cn-photo1", name: "Visual Storys", avatar: "📸", category: "Photography", members: 580, activeEvents: 1, friendsInside: 5, description: "Memory visual logs creators, lens craft guidelines, and altitude campers photography.", energyScore: 85 },
  { id: "cn-photo2", name: "Landscape Pics", avatar: "🌅", category: "Photography", members: 920, activeEvents: 2, friendsInside: 7, description: "Golden hour tracking, sunset viewpoints, and tripod setups guides.", energyScore: 79 },
  { id: "cn-photo3", name: "Wildlife Safari", avatar: "🦁", category: "Photography", members: 430, activeEvents: 1, friendsInside: 2, description: "Jungle safaris, bird-watching, and telephoto lens tutorials.", energyScore: 70 },
  { id: "cn-photo4", name: "Street Lens", avatar: "🏙️", category: "Photography", members: 670, activeEvents: 3, friendsInside: 6, description: "Candid urban shots, shadow contrast mapping, and neon signs photography.", energyScore: 91 },

  // Storytelling (6 communities)
  { id: "cn-story1", name: "Heritage Walk", avatar: "🖋️", category: "Storytelling", members: 1640, activeEvents: 4, friendsInside: 12, description: "Historical trail guides, stories writing, and architectural legacy exploration.", energyScore: 90 },
  { id: "cn-story2", name: "Travel Logs", avatar: "📖", category: "Storytelling", members: 1100, activeEvents: 2, friendsInside: 8, description: "Writing visual journals, documenting unexplored villages, and local folklore logs.", energyScore: 81 },
  { id: "cn-story3", name: "Poetry Circle", avatar: "📝", category: "Storytelling", members: 320, activeEvents: 1, friendsInside: 2, description: "Word sketches, campsite verses, and nature inspiration circles.", energyScore: 60 },
  { id: "cn-story4", name: "Village Legends", avatar: "👵", category: "Storytelling", members: 450, activeEvents: 2, friendsInside: 4, description: "Preserving stories of rural craftsmen, weavers, and heritage keepers.", energyScore: 76 },
  { id: "cn-story5", name: "Ghost Settlements", avatar: "🏚️", category: "Storytelling", members: 290, activeEvents: 1, friendsInside: 1, description: "Exploring ruins, historic battlefields, and abandoned heritage settlements.", energyScore: 58 },
  { id: "cn-story6", name: "Campfire Myths", avatar: "🔥", category: "Storytelling", members: 780, activeEvents: 3, friendsInside: 5, description: "Nighttime campfire storytelling, ghost stories, and local myths logs.", energyScore: 88 },

  // Travel (9 communities)
  { id: "cn-trav1", name: "Solo Backpacks", avatar: "🎒", category: "Travel", members: 2450, activeEvents: 6, friendsInside: 22, description: "Unlocking budget hostels, route mapping, and travel meetups worldwide.", energyScore: 97 },
  { id: "cn-trav2", name: "Roadtrip Riders", avatar: "🏍️", category: "Travel", members: 1820, activeEvents: 4, friendsInside: 14, description: "Highway itineraries, fuel stops, scenic detours, and group rides.", energyScore: 93 },
  { id: "cn-trav3", name: "Village Nomads", avatar: "🌾", category: "Travel", members: 760, activeEvents: 2, friendsInside: 5, description: "Slow living, homestays, volunteering in local farms, and community builds.", energyScore: 79 },
  { id: "cn-trav4", name: "Island Lagoons", avatar: "🏝️", category: "Travel", members: 920, activeEvents: 1, friendsInside: 6, description: "Ferry schedules, secret lagoons, beach cleanup squads, and scuba logs.", energyScore: 83 },
  { id: "cn-trav5", name: "Monsoon Chaser", avatar: "🌧️", category: "Travel", members: 1150, activeEvents: 3, friendsInside: 9, description: "Chasing clouds, rain-kissed valleys, and seasonal waterfall treks.", energyScore: 87 },
  { id: "cn-trav6", name: "Train Journeys", avatar: "🚂", category: "Travel", members: 530, activeEvents: 0, friendsInside: 2, description: "Documenting window-seat views, slow rail journeys, and route guidebooks.", energyScore: 48 },
  { id: "cn-trav7", name: "Desert Nights", avatar: "🐫", category: "Travel", members: 390, activeEvents: 1, friendsInside: 1, description: "Sand dune camping, camel treks, oasis walks, and starry nights.", energyScore: 68 },
  { id: "cn-trav8", name: "Offbeat Trails", avatar: "🗺️", category: "Travel", members: 810, activeEvents: 2, friendsInside: 4, description: "Mapping offbeat destinations, non-touristy trails, and local homestays.", energyScore: 76 },
  { id: "cn-trav9", name: "Secret Falls", avatar: "🏞️", category: "Travel", members: 640, activeEvents: 1, friendsInside: 3, description: "Locating deep-forest streams, swimming holes, and river treks.", energyScore: 72 },

  // Fitness (5 communities)
  { id: "cn-fit1", name: "Enduro Cyclists", avatar: "🚴", category: "Fitness", members: 920, activeEvents: 2, friendsInside: 6, description: "Cross-region cycling routes mapping, time challenge cohorts, and safety setups.", energyScore: 85 },
  { id: "cn-fit2", name: "Trail Runners", avatar: "🏃", category: "Fitness", members: 680, activeEvents: 2, friendsInside: 4, description: "Off-road running tracks, elevation gains, and forest running guides.", energyScore: 80 },
  { id: "cn-fit3", name: "Sunrise Yoga", avatar: "🧘", category: "Fitness", members: 540, activeEvents: 1, friendsInside: 3, description: "Sunrise yoga sessions, lakeside meditation, and breathing circles.", energyScore: 74 },
  { id: "cn-fit4", name: "River Kayaking", avatar: "🛶", category: "Fitness", members: 380, activeEvents: 1, friendsInside: 2, description: "River rapids paddling, lake runs, and safety rescue certifications.", energyScore: 66 },
  { id: "cn-fit5", name: "Bouldering Hub", avatar: "🧗", category: "Fitness", members: 490, activeEvents: 2, friendsInside: 4, description: "Bouldering spots, climbing gear checks, and rope routing lessons.", energyScore: 72 },

  // Learning (6 communities)
  { id: "cn-learn1", name: "Survival Campers", avatar: "⛺", category: "Learning", members: 540, activeEvents: 1, friendsInside: 2, description: "Primitive fire building, regional mapping tools, shelter setups, and solo coordinates logs.", energyScore: 82 },
  { id: "cn-learn2", name: "Map Makers", avatar: "🧭", category: "Learning", members: 310, activeEvents: 2, friendsInside: 1, description: "Cartography workshops, path tracking, and GPS coordinate logs.", energyScore: 70 },
  { id: "cn-learn3", name: "Star Gazers", avatar: "🔭", category: "Learning", members: 890, activeEvents: 3, friendsInside: 7, description: "Constellation spotting, telescope setups, and astro-photography workshops.", energyScore: 92 },
  { id: "cn-learn4", name: "Decipher Scripts", avatar: "🪨", category: "Learning", members: 240, activeEvents: 1, friendsInside: 0, description: "Deciphering temple inscriptions, learning historic scripts, and stone script mapping.", energyScore: 52 },
  { id: "cn-learn5", name: "Flora & Fauna", avatar: "🌿", category: "Learning", members: 460, activeEvents: 1, friendsInside: 3, description: "Identifying local medicinal plants, bird calls, and animal track logs.", energyScore: 68 },
  { id: "cn-learn6", name: "Folk Crafts", avatar: "🏺", category: "Learning", members: 380, activeEvents: 2, friendsInside: 2, description: "Learning local painting styles, pottery workshops, and craft tutorials.", energyScore: 75 },

  // Nightlife (4 communities)
  { id: "cn-night1", name: "Midnight Walks", avatar: "🚶", category: "Nightlife", members: 420, activeEvents: 2, friendsInside: 3, description: "Exploring historical cities at night, streetlights photography, and tea hubs.", energyScore: 76 },
  { id: "cn-night2", name: "Acoustic Fire", avatar: "🎸", category: "Nightlife", members: 610, activeEvents: 3, friendsInside: 5, description: "Campfire singing, guitar nights, and campsite music circles.", energyScore: 89 },
  { id: "cn-night3", name: "Pub Crawlers", avatar: "🍻", category: "Nightlife", members: 950, activeEvents: 4, friendsInside: 8, description: "Artisanal breweries rating, live music meetups, and board game nights.", energyScore: 91 },
  { id: "cn-night4", name: "Firefly Walks", avatar: "🪰", category: "Nightlife", members: 310, activeEvents: 1, friendsInside: 1, description: "Exploring nocturnal wildlife, firefly walks, and night forest paths.", energyScore: 80 }
];

// Helper to calculate shape coordinate offsets (inside a cluster)
function getNodeOffsets(shape: string, count: number, radius: number, hasPagination: boolean): { dx: number; dy: number }[] {
  const offsets: { dx: number; dy: number }[] = [];
  if (count <= 0) return offsets;

  switch (shape) {
    case "Triangle": {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
      break;
    }
    case "Diamond": {
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI) / 2;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
      break;
    }
    case "Pentagon": {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
      break;
    }
    case "Cross": {
      if (hasPagination) {
        // Place on the 4 cardinal directions, with the 5th node further out on the bottom arm to form a cross without overlapping the center pagination overlay
        const directions = [
          { dx: 0, dy: -radius }, // Top
          { dx: radius, dy: 0 },  // Right
          { dx: 0, dy: radius },  // Bottom
          { dx: -radius, dy: 0 }, // Left
          { dx: 0, dy: radius * 1.7 } // Bottom outer (forming a Christian cross / sword shape!)
        ];
        for (let i = 0; i < count; i++) {
          offsets.push(directions[i % directions.length]);
        }
      } else {
        offsets.push({ dx: 0, dy: 0 });
        const arms = count - 1;
        for (let i = 0; i < arms; i++) {
          const angle = (i * Math.PI) / 2;
          offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
        }
      }
      break;
    }
    case "Star": {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
        const innerFactor = hasPagination ? 0.6 : 0.45;
        const r = i % 2 === 0 ? radius : radius * innerFactor;
        offsets.push({ dx: r * Math.cos(angle), dy: r * Math.sin(angle) });
      }
      break;
    }
    case "Arc": {
      const startAngle = Math.PI;
      const range = Math.PI;
      for (let i = 0; i < count; i++) {
        const angle = count > 1 ? startAngle + (i * range) / (count - 1) : startAngle + range / 2;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
      break;
    }
    case "Circle": {
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
      break;
    }
    case "V Formation": {
      if (count === 1) {
        offsets.push({ dx: 0, dy: -0.4 * radius });
      } else {
        const half = Math.floor(count / 2);
        const startY = hasPagination ? -0.55 * radius : -0.4 * radius;
        const spacingY = hasPagination ? 1.05 * radius : 0.9 * radius;
        const spacingX = hasPagination ? 0.9 * radius : 0.8 * radius;

        offsets.push({ dx: 0, dy: startY });
        for (let i = 1; i <= half; i++) {
          offsets.push({ dx: -(i / half) * spacingX, dy: startY + (i / half) * spacingY });
          if (offsets.length < count) {
            offsets.push({ dx: (i / half) * spacingX, dy: startY + (i / half) * spacingY });
          }
        }
      }
      break;
    }
    case "Spiral": {
      for (let i = 0; i < count; i++) {
        const factor = hasPagination
          ? 0.55 + 0.45 * (i / (count - 1 || 1))
          : (i + 1) / count;
        const angle = i * 2.2;
        offsets.push({ dx: radius * factor * Math.cos(angle), dy: radius * factor * Math.sin(angle) });
      }
      break;
    }
    case "Hex Pattern": {
      if (hasPagination) {
        // Place on the vertices of a hexagon, leaving center empty for pagination controls
        for (let i = 0; i < count; i++) {
          const angle = (i * Math.PI) / 3;
          offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
        }
      } else {
        offsets.push({ dx: 0, dy: 0 });
        const outerCount = count - 1;
        for (let i = 0; i < outerCount; i++) {
          const angle = (i * Math.PI) / 3;
          offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
        }
      }
      break;
    }
    default: {
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        offsets.push({ dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) });
      }
    }
  }

  return offsets;
}

// Dynamic cluster layout placement engine (collision-free & bounded)
const getClusterLayout = (count: number, gap: number, isMobile: boolean) => {
  // Balanced, premium static coordinates to avoid random cluttering
  if (count === 1) return [{ x: isMobile ? 250 : 400, y: isMobile ? 250 : 250 }];
  if (count === 2) return [{ x: 220, y: 220 }, { x: 580, y: 220 }];
  return [{ x: 180, y: 140 }, { x: 620, y: 140 }, { x: 400, y: 380 }];
};




// Deterministic seeded random utility to avoid hydration mismatches
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export default function CommunitiesPage() {
  const router = useRouter();
  const [hoveredDockItem, setHoveredDockItem] = useState<JoinedCommunity | null>(null);
  const [hoveredDockIndex, setHoveredDockIndex] = useState<number | null>(null);
  const [hoveredDockRow, setHoveredDockRow] = useState<"created" | "joined" | null>(null);
  const [selectedExplorer, setSelectedExplorer] = useState<CompanionOrbitNode | null>(null);
  const { data: circlesGraph, isLoading: isCirclesLoading } = useExplorerCirclesGraph();
  const followMutation = useFollowMutation();
  const dispatch = useAppDispatch();
  const discoveryState = useAppSelector(state => state.communityDiscovery);
  const selectedClusters = discoveryState.selectedClusters;
  const { data: galaxyData, isLoading: isGalaxyLoading } = useGalaxy();
  const authState = useAppSelector((state) => state.auth);
  const { data: currentUser } = useCurrentUserQuery(authState.isAuthenticated);
  const displayName = currentUser?.displayName || authState.name || "Explorer";
  const avatarUrl = currentUser?.avatarUrl;
  const initial = displayName.trim().charAt(0).toUpperCase() || "E";

  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearchLoading } = useUserSearch(searchQuery, "all", 30);

  const companionOrbitNodes: CompanionOrbitNode[] = useMemo(() => {
    const nodesMap = new globalThis.Map<string, CompanionOrbitNode>();

    // 1. First add default circle graph nodes
    if (circlesGraph && circlesGraph.nodes && circlesGraph.nodes.length > 0) {
      circlesGraph.nodes.forEach((node) => {
        nodesMap.set(node.id, node as CompanionOrbitNode);
      });
    }

    // 2. Merge in enterprise search results from database
    if (searchResults && searchResults.pages) {
      searchResults.pages.forEach((page) => {
        if (page && page.items) {
          page.items.forEach((item: SearchUserItem) => {
            if (!nodesMap.has(item.userId)) {
              nodesMap.set(item.userId, {
                id: item.userId,
                name: item.displayName || item.username,
                username: item.username,
                avatar: item.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                compatibility: item.compatibility || 88,
                sharedDNA: "Explorer",
                mutualExperiences: Math.max(1, Math.round((item.compatibility || 80) / 20)),
                mutualCommunities: Math.max(1, Math.round((item.compatibility || 80) / 30)),
                mutualFriends: Math.max(0, Math.round((item.compatibility || 80) / 25) - 1),
                bio: item.bio || "Wandercall explorer in the discovery network.",
                tags: ["Trekking", "Adventure", "Travel"],
                communities: ["Global Explorers", "Wander Tribe"],
                level: item.level || 1,
                reputationScore: item.reputationScore || 150,
                location: item.locationFormatted || "Global",
                isFollowing: false,
                isFriend: false,
                reasons: ["Search Discovery Match"],
              } as CompanionOrbitNode);
            }
          });
        }
      });
    }

    const allNodes = Array.from(nodesMap.values());

    // 3. Priority Sorting: If searching, prioritize matches! Otherwise prioritize compatibility!
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      return allNodes.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const aUser = a.username.toLowerCase();
        const bName = b.name.toLowerCase();
        const bUser = b.username.toLowerCase();

        const aExact = aName === query || aUser === query || aUser === `@${query}`;
        const bExact = bName === query || bUser === query || bUser === `@${query}`;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aPrefix = aName.startsWith(query) || aUser.startsWith(query) || aUser.startsWith(`@${query}`);
        const bPrefix = bName.startsWith(query) || bUser.startsWith(query) || bUser.startsWith(`@${query}`);
        if (aPrefix && !bPrefix) return -1;
        if (!aPrefix && bPrefix) return 1;

        const aIncludes = aName.includes(query) || aUser.includes(query) || (a.bio && a.bio.toLowerCase().includes(query)) || a.tags.some(t => t.toLowerCase().includes(query));
        const bIncludes = bName.includes(query) || bUser.includes(query) || (b.bio && b.bio.toLowerCase().includes(query)) || b.tags.some(t => t.toLowerCase().includes(query));
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;

        return (b.compatibility || 0) - (a.compatibility || 0);
      });
    }

    return allNodes.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
  }, [circlesGraph, searchResults, searchQuery]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { data: myCommunities } = useMyCommunities();
  const [failedExplorerAvatars, setFailedExplorerAvatars] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  const getDnaColor = (dna: string) => {
    if (dna === "Explorer") return "rgba(6, 182, 212, 0.4)";
    if (dna === "Creative") return "rgba(16, 185, 129, 0.4)";
    return "rgba(139, 92, 246, 0.4)";
  };

  // Drag-to-scroll handlers for organic constellation network
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isDownRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDownRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  useEffect(() => {
    // Local storage cleanups if any
  }, []);


  const allDockCommunities = useMemo(() => {
    if (!myCommunities) return [];
    
    return myCommunities.map((c: any) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar || "⛺",
      banner: c.cover || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=300&auto=format&fit=crop",
      members: c.currentMemberCount || 0,
      liveStatus: "Active",
      unreadCount: 0,
      energyScore: "Active",
      recentActivity: c.description || "Community joined",
      upcomingEvent: ""
    }));
  }, [myCommunities]);

  const allGalaxyNodes = useMemo(() => {
    if (galaxyData) {
      // Map real backend galaxy clusters to frontend nodes
      const realNodes: CommunityNode[] = [];
      Object.values(galaxyData).forEach((cluster: any) => {
        cluster.forEach((c: any) => {
          realNodes.push({
            id: c.id,
            name: c.name,
            avatar: c.avatar || "🌌",
            category: c.primaryCategory?.name || "Adventure",
            members: c.currentMemberCount || 0,
            activeEvents: c.isLive ? 1 : 0,
            friendsInside: c.onlineMemberCount || 0,
            description: c.description || "",
            energyScore: c.isLive ? 100 : 75
          });
        });
      });
      return realNodes;
    }

    return [];
  }, [galaxyData]);

  const getCommunityWallpaper = (node: CommunityNode) => {
    if (node.avatar && (node.avatar.startsWith("http") || node.avatar.startsWith("data:"))) {
      return node.avatar;
    }
    const defaultCategoryWallpapers: Record<string, string> = {
      "Adventure": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=150&auto=format&fit=crop",
      "Food": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=150&auto=format&fit=crop",
      "Photography": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150&auto=format&fit=crop",
      "Storytelling": "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=150&auto=format&fit=crop",
      "Travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=150&auto=format&fit=crop",
      "Fitness": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=150&auto=format&fit=crop",
      "Learning": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150&auto=format&fit=crop",
      "Nightlife": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=150&auto=format&fit=crop"
    };
    return defaultCategoryWallpapers[node.category] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=150&auto=format&fit=crop";
  };

  // Responsive design viewport tracking hooks
  const [viewportWidth, setViewportWidth] = useState(1200);
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setViewportWidth(window.innerWidth);
      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Auto-select first explorer on load
  useEffect(() => {
    if (companionOrbitNodes.length > 0 && !selectedExplorer) {
      setSelectedExplorer(companionOrbitNodes[0]);
    }
  }, [companionOrbitNodes, selectedExplorer]);

  // Selected filters (up to 3 categories). Default to first 3.
  // Using Redux state: selectedClusters

  // Active shape preset name mapping per category metadata id
  const [clusterShapes, setClusterShapes] = useState<Record<string, string>>({
    "c-adventure": "Triangle",
    "c-food": "Diamond",
    "c-photography": "Arc",
    "c-storytelling": "Circle",
    "c-travel": "Star",
    "c-fitness": "Pentagon",
    "c-learning": "Cross",
    "c-nightlife": "V Formation"
  });

  // Category ID map pagination pages tracking
  const [clusterPages, setClusterPages] = useState<Record<string, number>>({
    "c-adventure": 0,
    "c-food": 0,
    "c-photography": 0,
    "c-storytelling": 0,
    "c-travel": 0,
    "c-fitness": 0,
    "c-learning": 0,
    "c-nightlife": 0
  });

  // Mobile focused index for single category view carousel swiper
  const [focusedClusterIndex, setFocusedClusterIndex] = useState(0);



  // Hovered cluster tracking state to pause animations
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleFilterToggle = (id: string) => {
    if (selectedClusters.includes(id)) {
      if (selectedClusters.length === 1) {
        triggerToast("At least one category must be selected.");
        return;
      }
      dispatch(toggleClusterSelection(id));
      setFocusedClusterIndex(0);
    } else {
      if (selectedClusters.length >= 3) {
        triggerToast("Maximum 3 clusters can be explored simultaneously.");
        return;
      }
      dispatch(toggleClusterSelection(id));
    }
  };

  const handlePrevPage = (cid: string) => {
    setClusterPages(prev => ({
      ...prev,
      [cid]: Math.max(0, (prev[cid] || 0) - 1)
    }));
  };

  const handleNextPage = (cid: string, totalPages: number) => {
    setClusterPages(prev => ({
      ...prev,
      [cid]: Math.min(totalPages - 1, (prev[cid] || 0) + 1)
    }));
  };

  // Shape rotation interval timer trigger every 5 seconds
  useEffect(() => {
    const SHAPE_PRESETS = ["Triangle", "Diamond", "Pentagon", "Cross", "Star", "Arc", "Circle", "V Formation", "Spiral", "Hex Pattern"];
    const interval = setInterval(() => {
      setClusterShapes(prev => {
        const next = { ...prev };
        selectedClusters.forEach(cid => {
          if (cid === hoveredClusterId) return; // Freeze shape animation if this cluster coordinate is hovered

          const shapes = SHAPE_PRESETS;
          const current = prev[cid] || "Circle";
          let nextShape = current;
          while (nextShape === current) {
            nextShape = shapes[Math.floor(Math.random() * shapes.length)];
          }
          next[cid] = nextShape;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedClusters, hoveredClusterId]);



  // Dynamic layout calculations for coordinate centers
  const clusterCenters = useMemo(() => {
    const count = isMobile ? 1 : isTablet ? Math.min(2, selectedClusters.length) : selectedClusters.length;
    // Spacing gap increased to make coordinates spacing wider
    const gap = isMobile ? 80 : isTablet ? 120 : 180;
    return getClusterLayout(count, gap, isMobile);
  }, [selectedClusters.length, isMobile, isTablet]);

  // Generate background stars in a mathematical Fermat's Spiral (Golden Ratio layout)
  // Generate background stars in a mathematical Fermat's Spiral (Golden Ratio layout)
  const fermatStars = React.useMemo(() => {
    const stars = [];
    const numStars = 280;
    const c = isMobile ? 14 : 22.5; // Scale down star radius factor on mobile to fit the 500x500 box
    const goldenAngle = 137.5 * (Math.PI / 180);
    const starCx = isMobile ? 250 : 400;
    const starCy = isMobile ? 250 : 250;
    const W = isMobile ? 500 : 800;
    const H = isMobile ? 500 : 500;

    for (let i = 1; i <= numStars; i++) {
      const theta = i * goldenAngle;
      const r = c * Math.sqrt(i);
      const x = Math.round((starCx + r * Math.cos(theta)) * 1000) / 1000;
      const y = Math.round((starCy + r * Math.sin(theta)) * 1000) / 1000;

      if (x > 15 && x < W - 15 && y > 15 && y < H - 15) {
        const size = Math.round((0.5 + (i % 3) * 0.35) * 1000) / 1000;
        const opacity = Math.round((0.15 + (i % 5) * 0.12) * 1000) / 1000;
        stars.push({ x, y, size, opacity });
      }
    }
    return stars;
  }, [isMobile]);

  // Mock Datasets
  const commandCenterStats = {
    joinedCount: 8,
    activeCohorts: 3,
    friendsOnline: 37,
    eventsThisMonth: 12,
    reputationPoints: 1420
  };



  const communityTrophies: CommunityTrophy[] = [
    { id: "tr-1", title: "Alps of India", requirement: "Complete 5 mountain treks above 10,000 ft", unlocked: true, tier: "Gold", dateUnlocked: "June 12, 2026" },
    { id: "tr-2", title: "Neptune Guardians", requirement: "Log 3 reef preservation dive experiences", unlocked: true, tier: "Platinum", dateUnlocked: "May 28, 2026" },
    { id: "tr-3", title: "Epic Narrative Guild", requirement: "Write 10 visual guide stories with 50+ likes", unlocked: false, tier: "Legendary" },
    { id: "tr-4", title: "Wander Tribe Captain", requirement: "Organize 3 successful companion cohorts", unlocked: false, tier: "Gold" }
  ];

  // Concentric Priority Orbit calculations with Zero Overlap Guarantee
  const explorerNodesWithCoords = useMemo(() => {
    const W = 1000;
    const H = 380;
    const centerX = 500;
    const centerY = 190;
    const centerR = 50; // User node radius (100px size)
    const minSpacing = 44; // Strict spacing to guarantee zero overlap of avatars and labels
    const padding = 30;

    // For mobile/tablet maintain clean spacing
    const maxNodes = isMobile ? 8 : isTablet ? 12 : 20;
    const baseNodes = companionOrbitNodes.slice(0, maxNodes);
    const placedNodes: { node: CompanionOrbitNode; x: number; y: number; r: number }[] = [];

    baseNodes.forEach((node, index) => {
      // Circle radius based on device and priority
      const desktopRadius = 18 + (node.compatibility - 70) * (12 / 30);
      const r = isMobile ? desktopRadius * 0.85 : desktopRadius;

      // Concentric Priority Orbits: Index 0 (Top search match / highest priority) is VERY CLOSE!
      // Subsequent indices move progressively outward: Very Close -> Little Close -> Far -> Farther
      let targetRadius = centerR + r + 35; // Innermost baseline
      if (index === 0) targetRadius = centerR + r + 38; // Very close (#1 priority match)
      else if (index <= 2) targetRadius = centerR + r + 65 + (index - 1) * 20; // Very close
      else if (index <= 6) targetRadius = centerR + r + 125 + (index - 3) * 22; // Little close
      else if (index <= 11) targetRadius = centerR + r + 210 + (index - 7) * 22; // Far
      else targetRadius = centerR + r + 310 + (index - 12) * 25; // Farther

      // Distribute initial angles using golden ratio (137.5 deg) with prominent placements for top matches
      let baseAngle = (index * 137.5 * Math.PI) / 180;
      if (index === 0) baseAngle = Math.PI * 1.15; // Prominent upper-left placement for #1 search result
      else if (index === 1) baseAngle = Math.PI * 1.85; // Upper-right placement for #2
      else if (index === 2) baseAngle = Math.PI * 0.85; // Lower-left for #3
      else if (index === 3) baseAngle = Math.PI * 0.15; // Lower-right for #4

      let placed = false;
      let x = 0;
      let y = 0;

      // Try angular search (stepping by 12 deg) and radial adjustments (+/- 15px increments)
      for (let rOffset = 0; rOffset <= 250 && !placed; rOffset += 18) {
        for (let aOffset = 0; aOffset < 360 && !placed; aOffset += 12) {
          // Check both clockwise and counter-clockwise
          for (const sign of [1, -1]) {
            if (placed) break;
            const angle = baseAngle + sign * (aOffset * Math.PI) / 180;
            const currentRadius = targetRadius + rOffset;

            // Calculate candidate coordinates
            const cx = Math.round((centerX + currentRadius * Math.cos(angle)) * 10) / 10;
            const cy = Math.round((centerY + currentRadius * Math.sin(angle)) * 10) / 10;

            // Ensure within SVG canvas bounds (with padding for badges/labels)
            if (cx < padding + r || cx > W - padding - r || cy < padding + r || cy > H - padding - r - 20) {
              continue;
            }

            // Check collision against center YOU node
            const distCenter = Math.sqrt((cx - centerX) ** 2 + (cy - centerY) ** 2);
            if (distCenter < centerR + r + minSpacing) {
              continue;
            }

            // Check collision against all placed nodes
            let hasCollision = false;
            for (const existing of placedNodes) {
              const dx = cx - existing.x;
              const dy = cy - existing.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < r + existing.r + minSpacing) {
                hasCollision = true;
                break;
              }
            }

            if (!hasCollision) {
              x = cx;
              y = cy;
              placed = true;
            }
          }
        }
      }

      // Absolute safety fallback
      if (!placed) {
        x = centerX + (targetRadius + 50) * Math.cos(baseAngle);
        y = centerY + (targetRadius + 50) * Math.sin(baseAngle);
      }

      placedNodes.push({ node, x, y, r });
    });

    return placedNodes;
  }, [companionOrbitNodes, isMobile, isTablet]);

  // Handle Constellation Search matches
  const filteredNodes = useMemo(() => {
    if (!searchQuery) {
      return explorerNodesWithCoords.map(item => ({ ...item, isMatched: true }));
    }
    const query = searchQuery.toLowerCase();
    return explorerNodesWithCoords.map(item => {
      const matches =
        item.node.name.toLowerCase().includes(query) ||
        item.node.username.toLowerCase().includes(query) ||
        item.node.sharedDNA.toLowerCase().includes(query) ||
        item.node.tags.some(t => t.toLowerCase().includes(query)) ||
        item.node.communities.some(c => c.toLowerCase().includes(query));
      return { ...item, isMatched: matches };
    });
  }, [explorerNodesWithCoords, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() && filteredNodes.length > 0) {
      const firstMatch = filteredNodes.find((f) => f.isMatched);
      if (firstMatch) {
        setSelectedExplorer(firstMatch.node);
        
        // Scroll horizontally to center the first match
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const containerWidth = container.clientWidth;
          const scrollWidth = container.scrollWidth;
          const ratio = scrollWidth / 1000; // viewBox width is 1000
          
          const targetX = firstMatch.x * ratio;
          
          container.scrollTo({
            left: Math.max(0, targetX - (containerWidth / 2)),
            behavior: "smooth"
          });
        }
      }
    }
  }, [searchQuery, filteredNodes]);


  // Handle keyboard arrow selection accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredNodes.length === 0) return;
    const currentIndex = filteredNodes.findIndex(item => item.node.id === selectedExplorer?.id);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % filteredNodes.length;
      setSelectedExplorer(filteredNodes[nextIndex].node);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + filteredNodes.length) % filteredNodes.length;
      setSelectedExplorer(filteredNodes[prevIndex].node);
    }
  };

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-6 overflow-y-visible relative text-white">

      {/* SECTION 1: COMMUNITY COMMAND CENTER (STATS RIBBON) */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 w-full relative overflow-hidden shadow-xl shrink-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-stretch justify-between w-full border-b border-white/5 pb-4 gap-4 z-10">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full">
              Social Dashboard
            </span>
            <h1 className="text-2xl font-black mt-2 text-white uppercase tracking-tight flex items-center gap-2">
              <Users className="h-6 w-6 text-brand-cyan" /> Experience Communities
            </h1>
          </div>

          <div className="flex items-center gap-4 justify-around md:justify-end bg-zinc-950/40 border border-white/5 p-3 rounded-2xl font-mono">
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Joined</span>
              <span className="text-sm font-black text-white mt-0.5">{allDockCommunities.length} Groups</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Active Cohorts</span>
              <span className="text-sm font-black text-brand-cyan mt-0.5">{commandCenterStats.activeCohorts} Active</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Online Friends</span>
              <span className="text-sm font-black text-brand-amber mt-0.5">{commandCenterStats.friendsOnline} Online</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Reputation Points</span>
              <span className="text-sm font-black text-brand-purple mt-0.5">{commandCenterStats.reputationPoints} pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MY COMMUNITIES DOCK */}
      <section className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col gap-5 w-full relative shadow-md">
        
        {/* Track 1: My Created Coordinates */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-purple flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-brand-purple" /> My Created Coordinates ({myCommunities?.length || 0})
            </h3>
            <span className="text-[8px] font-mono text-zinc-500">
              Coordinates you established and manage
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 w-full min-w-0">
            {allDockCommunities.map((item: any, index: number) => {
              const isActive = item.liveStatus === "Campfire Active" || item.liveStatus === "Event Live" || item.liveStatus === "Active Now";
              return (
                <div
                  key={item.id}
                  className="relative shrink-0 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredDockItem(item);
                    setHoveredDockIndex(index);
                    setHoveredDockRow("created");
                  }}
                  onMouseLeave={() => {
                    setHoveredDockItem(null);
                    setHoveredDockIndex(null);
                    setHoveredDockRow(null);
                  }}
                  onClick={() => router.push(`/community/${item.slug || item.id}`)}
                >
                  {/* Radiation waves (subtle & small) */}
                  {isActive && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-brand-purple/40 pointer-events-none z-0"
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.15 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-xl border border-brand-indigo/35 pointer-events-none z-0"
                        initial={{ opacity: 0.4, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.25 }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.7, ease: "easeOut" }}
                      />
                    </>
                  )}

                  {/* Avatar block (no container scale, inner scale only) */}
                  <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-brand-purple/20 hover:border-brand-purple flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(139,92,246,0.05)] relative z-10 overflow-hidden group">
                    {item.banner || item.avatar.startsWith("http") || item.avatar.startsWith("data:") ? (
                      <img
                        src={item.banner || item.avatar}
                        alt={item.name}
                        className="absolute inset-0 object-cover w-full h-full z-0 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="z-10 group-hover:scale-115 transition-transform duration-300 inline-block select-none">{item.avatar}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Create community button in dock */}
            <button
              onClick={() => router.push("/profile/community/create")}
              className="h-12 w-12 rounded-xl bg-brand-purple/5 border border-brand-purple/20 border-dashed hover:border-brand-purple hover:bg-brand-purple/10 flex items-center justify-center text-brand-purple transition-all shrink-0 cursor-pointer group"
              aria-label="Create Community"
            >
              <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-white/5 w-full" />

        {/* Track 2: Saved Communities of Others */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-cyan flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-brand-cyan" /> Saved Communities ({allDockCommunities.length})
            </h3>
            <span className="text-[8px] font-mono text-zinc-500">
              Communities you joined and explore
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 pt-1 w-full min-w-0">
            {allDockCommunities.map((item: any, index: number) => {
              const isActive = item.liveStatus === "Campfire Active" || item.liveStatus === "Event Live" || item.liveStatus === "Active Now";
              return (
                <div
                  key={item.id}
                  className="relative shrink-0 cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredDockItem(item);
                    setHoveredDockIndex(index);
                    setHoveredDockRow("joined");
                  }}
                  onMouseLeave={() => {
                    setHoveredDockItem(null);
                    setHoveredDockIndex(null);
                    setHoveredDockRow(null);
                  }}
                  onClick={() => router.push(`/community/${item.slug || item.id}`)}
                >
                  {/* Avatar block (no container scale, inner scale only, with active border highlight pulse animation) */}
                  <motion.div
                    animate={isActive ? {
                      borderColor: ["rgba(34, 211, 238, 0.4)", "rgba(59, 130, 246, 0.9)", "rgba(34, 211, 238, 0.4)"],
                      boxShadow: [
                        "0 0 4px rgba(34, 211, 238, 0.15)",
                        "0 0 12px rgba(59, 130, 246, 0.45)",
                        "0 0 4px rgba(34, 211, 238, 0.15)"
                      ]
                    } : {}}
                    transition={isActive ? {
                      repeat: Infinity,
                      duration: 2.2,
                      ease: "easeInOut"
                    } : {}}
                    className={`h-12 w-12 rounded-xl bg-zinc-950 border flex items-center justify-center text-2xl shadow-md relative z-10 overflow-hidden group ${
                      isActive ? "" : "border-white/10 hover:border-brand-cyan"
                    }`}
                  >
                    {item.banner || item.avatar.startsWith("http") || item.avatar.startsWith("data:") ? (
                      <img
                        src={item.banner || item.avatar}
                        alt={item.name}
                        className="absolute inset-0 object-cover w-full h-full z-0 group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="z-10 group-hover:scale-115 transition-transform duration-300 inline-block select-none">{item.avatar}</span>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hover Tooltip Overlay card relative to section */}
        <AnimatePresence>
          {hoveredDockItem && hoveredDockIndex !== null && hoveredDockRow !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="absolute z-50 w-[240px] bg-zinc-950 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none"
              style={{
                top: hoveredDockRow === "created" ? "105px" : "230px",
                left: `${Math.max(16, hoveredDockIndex * 64 + 16)}px`
              }}
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-white truncate">{hoveredDockItem.name}</span>
                <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-zinc-400">
                  <span>{hoveredDockItem.members.toLocaleString()} Members</span>
                  <span>•</span>
                  <span className="text-brand-cyan font-bold">{hoveredDockItem.energyScore}</span>
                </div>
                <div className="h-px bg-white/5 my-1" />
                <div className="flex flex-col gap-1">
                  <span className="text-[7.5px] text-zinc-500 font-black uppercase tracking-wider">Status Update</span>
                  <p className="text-[9px] text-zinc-300 leading-normal">{hoveredDockItem.recentActivity}</p>
                </div>
                {hoveredDockItem.upcomingEvent && (
                  <div className="flex flex-col gap-1 mt-1 bg-white/[0.02] border border-white/5 p-1.5 rounded-lg">
                    <span className="text-[7px] text-brand-amber font-black uppercase tracking-wider flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" /> Next Event
                    </span>
                    <span className="text-[8.5px] text-zinc-300 font-bold truncate">{hoveredDockItem.upcomingEvent}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* SECTION 3: COMMUNITY UNIVERSE (INTERACTIVE LIVING GALAXY SYSTEM) */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Map className="h-4 w-4 text-brand-purple" /> Community Galaxy
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Interactive explorer map. Select coordinate nodes to inspect details in the telescope panel.
            </p>
          </div>

          {/* Control Ribbon: Notion/Linear Multi-Select Dropdown Filter & Auto-Explore */}
          <div className="flex flex-wrap items-center gap-3 z-30">
            {/* Custom Multi-select Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-white transition-all cursor-pointer shadow-md select-none"
              >
                <Compass className="h-3.5 w-3.5 text-brand-cyan" />
                <span>Filter Clusters</span>
                <span className="bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded text-[8.5px] font-black flex items-center justify-center min-w-[16px] h-4">
                  {selectedClusters.length}
                </span>
              </button>

              <AnimatePresence>
                {filterOpen && (
                  <>
                    {/* Overlay Click-Away Shield */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute top-11 left-0 z-50 w-[260px] bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-3.5 flex flex-col gap-2.5 backdrop-blur-xl"
                    >
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg">
                        <Search className="h-3.5 w-3.5 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={filterSearch}
                          onChange={(e) => setFilterSearch(e.target.value)}
                          className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold"
                        />
                      </div>

                      <div 
                        data-lenis-prevent
                        className="flex flex-col gap-1 max-h-[220px] overflow-y-auto no-scrollbar"
                      >
                        {CLUSTER_METADATA.filter(c => c.name.toLowerCase().includes(filterSearch.toLowerCase())).map(item => {
                          const isSelected = selectedClusters.includes(item.id);
                          const communityCount = allGalaxyNodes.filter(c => c.category === item.category).length;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleFilterToggle(item.id)}
                              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-left w-full ${isSelected ? "bg-white/[0.04] text-white" : "hover:bg-white/[0.02] text-zinc-400"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xs shrink-0 select-none">{item.icon}</span>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold truncate text-white">{item.name}</span>
                                  <span className="text-[9px] text-zinc-500 truncate font-medium">{communityCount} Communities</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse" />
                                <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isSelected ? "border-brand-purple bg-brand-purple" : "border-white/10"
                                  }`}>
                                  {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Selected categories tags list overview */}
        <div className="flex flex-wrap gap-2 text-[9px] font-mono text-zinc-500">
          <span>Active Focus:</span>
          {selectedClusters.map(cid => {
            const meta = CLUSTER_METADATA.find(c => c.id === cid);
            return (
              <span key={cid} className="text-zinc-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase font-bold flex items-center gap-1">
                <span>{meta?.icon}</span> {meta?.name}
              </span>
            );
          })}
        </div>

        <div className="w-full min-w-0">
          {/* Living Galaxy Map Canvas */}
          <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
            {/* Mobile Carousel category focused swiper bar */}
            {isMobile && (
              <div className="flex items-center justify-between w-full bg-zinc-900/40 border border-white/5 p-2 rounded-xl mb-4 select-none">
                <button
                  onClick={() => setFocusedClusterIndex(prev => (prev === 0 ? selectedClusters.length - 1 : prev - 1))}
                  className="p-1 text-zinc-400 hover:text-white"
                  aria-label="Previous Focused Cluster"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-black uppercase text-brand-cyan tracking-widest">
                  {CLUSTER_METADATA.find(c => c.id === selectedClusters[focusedClusterIndex % selectedClusters.length])?.name || ""} Cluster
                </span>
                <button
                  onClick={() => setFocusedClusterIndex(prev => prev + 1)}
                  className="p-1 text-zinc-400 hover:text-white"
                  aria-label="Next Focused Cluster"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Ambient background glows */}
            <div className="absolute top-1/4 left-1/4 h-[120px] w-[120px] rounded-full bg-brand-cyan/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-[120px] w-[120px] rounded-full bg-brand-purple/5 blur-2xl pointer-events-none" />

            <div className="w-full relative select-none">
              <svg viewBox={isMobile ? "0 0 500 500" : "0 0 800 500"} className="w-full h-auto z-10 overflow-visible select-none">
                <defs>
                  <radialGradient id="cluster-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Symmetrical Orbit Rings */}
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 35 : 45} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 70 : 90} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 105 : 135} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 140 : 180} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 175 : 225} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 210 : 270} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 245 : 315} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 280 : 360} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />
                <circle cx={isMobile ? 250 : 400} cy={isMobile ? 250 : 250} r={isMobile ? 315 : 400} className="stroke-white/5 fill-none stroke-dashed" strokeWidth="0.5" />

                {/* Fermat's spiral background galaxy stars */}
                {fermatStars.map((star, idx) => (
                  <circle
                    key={`star-${idx}`}
                    cx={star.x}
                    cy={star.y}
                    r={star.size}
                    fill="#ffffff"
                    opacity={star.opacity}
                  />
                ))}

                {/* Main Galaxy SVG Container Group */}
                <g>

                  {/* Render active clusters and nodes */}
                  {selectedClusters
                    .filter((_, idx) => {
                      if (isMobile) {
                        return idx === (focusedClusterIndex % selectedClusters.length);
                      }
                      if (isTablet) {
                        return idx < 2; // only show first 2 on tablets to prevent crowding
                      }
                      return true; // show all (max 3) on desktop
                    })
                    .map((cid, cIndex) => {
                      const clusterMeta = CLUSTER_METADATA.find(c => c.id === cid);
                      if (!clusterMeta) return null;

                      // Retrieve all nodes for this category
                      const allNodes = allGalaxyNodes.filter(n => n.category === clusterMeta.category);

                      // Calculate cluster energy score average
                      const avgEnergy = Math.round(
                        allNodes.reduce((sum, item) => sum + item.energyScore, 0) / (allNodes.length || 1)
                      );

                      // Paginate communities: Max 5 nodes per cluster
                      const pageIdx = clusterPages[cid] || 0;
                      const totalPages = Math.ceil(allNodes.length / 5);
                      const visibleNodes = allNodes.slice(pageIdx * 5, (pageIdx + 1) * 5);

                      // Get layout shape type
                      const activeShape = clusterShapes[cid] || "Circle";

                      // Compute node offsets based on shape type
                      // Spacing increased to 80 on desktop and 110 on mobile to prevent overlaps
                      const layoutRadius = isMobile ? 110 : 80;
                      const offsets = getNodeOffsets(activeShape, visibleNodes.length, layoutRadius, totalPages > 1);

                      // Retrieve center coordinate for this cluster
                      const originalCenter = clusterCenters[cIndex] || { x: 400, y: 250 };
                      const center = { ...originalCenter };

                      // Constrain cluster center mathematically so no node overflows canvas boundaries
                      if (offsets.length > 0) {
                        const safetyMargin = 35; // margin to canvas boundaries
                        const W = isMobile ? 500 : 800;
                        const H = isMobile ? 500 : 500;

                        const dxs = offsets.map(o => o.dx);
                        const dys = offsets.map(o => o.dy);

                        const minDx = Math.min(...dxs);
                        const maxDx = Math.max(...dxs);
                        const minDy = Math.min(...dys);
                        const maxDy = Math.max(...dys);

                        // Clamp center x to guarantee all cluster nodes fit within canvas width
                        const minCx = safetyMargin - minDx;
                        const maxCx = W - safetyMargin - maxDx;
                        center.x = Math.max(minCx, Math.min(maxCx, center.x));

                        // Clamp center y to guarantee all cluster nodes fit within canvas height
                        const minCy = safetyMargin - minDy;
                        const maxCy = H - safetyMargin - maxDy;
                        center.y = Math.max(minCy, Math.min(maxCy, center.y));
                      }

                      // Energy Glow Indicator Class
                      const getEnergyGlowClass = (score: number, isClusterHovered: boolean) => {
                        if (isClusterHovered) {
                          if (score < 35) return "opacity-15 scale-90";
                          if (score < 65) return "opacity-30 scale-100";
                          if (score < 85) return "opacity-55 scale-105";
                          return "opacity-80 scale-110";
                        }
                        if (score < 35) return "opacity-15 scale-90";
                        if (score < 65) return "opacity-30 scale-100";
                        if (score < 85) return "opacity-55 scale-105 animate-pulse";
                        return "opacity-80 scale-110 animate-pulse duration-1000";
                      };

                      return (
                        <g key={cid}>
                          {/* 1. Nebula cluster center background glow */}
                          <circle
                            cx={center.x}
                            cy={center.y}
                            r={95}
                            fill="url(#cluster-glow)"
                            className={`${getEnergyGlowClass(avgEnergy, hoveredClusterId === clusterMeta.id)} pointer-events-none transition-all duration-1000`}
                            style={{ color: clusterMeta.glow }}
                          />

                          {/* 2. Shape connecting lines */}
                          {visibleNodes.map((node, nIdx) => {
                            const nextIdx = (nIdx + 1) % visibleNodes.length;
                            const offset1 = offsets[nIdx];
                            const offset2 = offsets[nextIdx];
                            if (!offset1 || !offset2) return null;

                            return (
                              <line
                                key={`line-${node.id}`}
                                x1={center.x + offset1.dx}
                                y1={center.y + offset1.dy}
                                x2={center.x + offset2.dx}
                                y2={center.y + offset2.dy}
                                className={`${clusterMeta.color} opacity-20`}
                                style={{
                                  transition: "x1 1s ease-in-out, y1 1s ease-in-out, x2 1s ease-in-out, y2 1s ease-in-out"
                                }}
                                strokeWidth="1.5"
                              />
                            );
                          })}

                          {/* 3. Community coordinate nodes */}
                          {visibleNodes.map((node, nIdx) => {
                            const offset = offsets[nIdx];
                            if (!offset) return null;

                            const cx = center.x + offset.dx;
                            const cy = center.y + offset.dy;
                            const nodeR = isMobile ? 22 : 15;
                            const glowR = isMobile ? 32 : 23;
                            const emojiSize = isMobile ? "text-[14px]" : "text-[10px]";
                            const emojiY = isMobile ? 5 : 4;
                            const labelSize = isMobile ? "text-[11px]" : "text-[7.5px]";
                            const labelY = offset.dy < 0 ? (isMobile ? -32 : -22) : (isMobile ? 35 : 25);
                            const isSelected = false;

                            return (
                              <g
                                key={node.id}
                                className="cursor-pointer group"
                                style={{
                                  transform: `translate(${cx}px, ${cy}px)`,
                                  transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)",
                                  transformOrigin: "center"
                                }}
                                onClick={() => router.push(`/community/${node.slug || node.id}`)}
                                onMouseEnter={() => setHoveredClusterId(clusterMeta.id)}
                                onMouseLeave={() => setHoveredClusterId(null)}
                              >
                                {/* Outer pulsing aura glow */}
                                <circle
                                  cx={0}
                                  cy={0}
                                  r={glowR}
                                  fill="transparent"
                                  className="group-hover:fill-current transition-colors duration-300 opacity-20"
                                  style={{ color: clusterMeta.glow }}
                                />

                                {/* Clip path for circular image */}
                                <defs>
                                  <clipPath id={`clip-node-${node.id}`}>
                                    <circle cx={0} cy={0} r={nodeR} />
                                  </clipPath>
                                </defs>

                                {/* Interactive star circle */}
                                <circle
                                  cx={0}
                                  cy={0}
                                  r={nodeR}
                                  className={`${clusterMeta.color} stroke-[1.5px] ${isSelected ? "stroke-white" : "stroke-white/10"
                                    } group-hover:scale-115 transition-transform duration-300`}
                                  style={{ transformOrigin: "0px 0px" }}
                                />

                                {/* Circular Wallpaper Image instead of emoji */}
                                <g 
                                  clipPath={`url(#clip-node-${node.id})`} 
                                  className="group-hover:scale-115 transition-transform duration-300 pointer-events-none"
                                  style={{ transformOrigin: "0px 0px" }}
                                >
                                  <image
                                    href={getCommunityWallpaper(node)}
                                    x={-nodeR}
                                    y={-nodeR}
                                    width={nodeR * 2}
                                    height={nodeR * 2}
                                    preserveAspectRatio="xMidYMid slice"
                                  />
                                </g>

                                {/* Abbreviated static index label */}
                                <text
                                  x={0}
                                  y={labelY}
                                  fill="#ffffff"
                                  className={`font-black ${labelSize} tracking-wider text-zinc-300 drop-shadow-md select-none pointer-events-none`}
                                  textAnchor="middle"
                                >
                                  {node.name.split(" ")[0]}
                                </text>
                              </g>
                            );
                          })}

                          {/* 4. Tiny cluster-center pagination controls overlays */}
                          {totalPages > 1 && (
                            <g transform={`translate(${center.x}, ${center.y})`} className="select-none z-30">
                              <rect
                                x={isMobile ? -32 : -24}
                                y={isMobile ? -12 : -9}
                                width={isMobile ? 64 : 48}
                                height={isMobile ? 24 : 18}
                                rx={isMobile ? 12 : 9}
                                className="fill-zinc-950/80 stroke-white/10 stroke-[0.5px] backdrop-blur-md"
                              />
                              <text
                                x="0"
                                y={isMobile ? 4 : 3}
                                fill="#a1a1aa"
                                className={`font-mono font-bold select-none pointer-events-none ${isMobile ? "text-[11px]" : "text-[7.5px]"}`}
                                textAnchor="middle"
                              >
                                {pageIdx + 1}/{totalPages}
                              </text>
                              {/* Prev Page Button */}
                              <g
                                className="cursor-pointer hover:text-white text-zinc-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevPage(clusterMeta.id);
                                }}
                                transform={`translate(${isMobile ? -22 : -16}, 0)`}
                              >
                                <circle r={isMobile ? 10 : 7} fill="transparent" />
                                <path d="M 1.5 -3 L -1.5 0 L 1.5 3" stroke="currentColor" strokeWidth="1" fill="none" />
                              </g>
                              {/* Next Page Button */}
                              <g
                                className="cursor-pointer hover:text-white text-zinc-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextPage(clusterMeta.id, totalPages);
                                }}
                                transform={`translate(${isMobile ? 22 : 16}, 0)`}
                              >
                                <circle r={isMobile ? 10 : 7} fill="transparent" />
                                <path d="M -1.5 -3 L 1.5 0 L -1.5 3" stroke="currentColor" strokeWidth="1" fill="none" />
                              </g>
                            </g>
                          )}

                          {/* 5. Cluster Name and Layout Shape Labels above the coordinate boundaries */}
                          <text
                            x={center.x}
                            y={isMobile ? center.y - 170 : center.y - 120}
                            fill="#F59E0B"
                            className={`font-black ${isMobile ? "text-[13px]" : "text-[9px]"} uppercase tracking-widest select-none pointer-events-none`}
                            textAnchor="middle"
                          >
                            {clusterMeta.name} Cluster
                          </text>
                        </g>
                      );
                    })}
                </g>
              </svg>


            </div>

            {/* Symmetrical Legend Row displaying energy systems */}
            <div className="flex flex-wrap gap-4 mt-4 border-t border-white/5 pt-4 w-full justify-center">
              {selectedClusters
                .filter((_, idx) => (isMobile ? idx === (focusedClusterIndex % selectedClusters.length) : isTablet ? idx < 2 : true))
                .map(cid => {
                  const meta = CLUSTER_METADATA.find(c => c.id === cid);
                  if (!meta) return null;
                  const comps = allGalaxyNodes.filter(c => c.category === meta.category);
                  const avgEnergy = Math.round(comps.reduce((sum, n) => sum + n.energyScore, 0) / (comps.length || 1));
                  const energyLevel = avgEnergy < 35 ? "Low" : avgEnergy < 65 ? "Medium" : avgEnergy < 85 ? "High" : "Legendary";

                  return (
                    <div key={cid} className="flex items-center gap-2 text-[9px] font-semibold select-none">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.glow.replace("0.4", "1") }} />
                      <span className="text-white uppercase tracking-wider">{meta.name}</span>
                      <span className="text-zinc-500 font-mono">({comps.length})</span>
                      <span className={`text-[7px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${avgEnergy < 35
                        ? "bg-zinc-900 border-white/5 text-zinc-500"
                        : avgEnergy < 65
                          ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
                          : avgEnergy < 85
                            ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                            : "bg-brand-amber/10 border-brand-amber/20 text-brand-amber animate-pulse"
                        }`}>
                        {energyLevel}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </section>



      {/* SECTION 6: EXPLORER CIRCLES (SOCIAL CONSTELLATION SYSTEM) */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand-cyan" /> Explorer Circles
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              A living network of explorers surrounding you based on shared milestones, DNA subclasses, and mutual experiences.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:max-w-[280px]">
            <div className="flex flex-1 items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl focus-within:border-brand-cyan/50 transition-colors">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search explorers..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(inputValue)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold"
              />
            </div>
            <button 
              onClick={() => setSearchQuery(inputValue)}
              className="bg-brand-cyan hover:bg-brand-cyan/80 text-black px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-stretch w-full min-w-0">
          
          {/* Organic Network Canvas */}
          <div 
            className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-center min-h-[300px] relative overflow-hidden select-none outline-none focus:border-brand-cyan/40"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Explorer constellation layout. Use arrow keys to navigate between nodes."
          >
            {/* Scroll/Swipe Support on all viewports */}
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onDragStart={(e) => e.preventDefault()}
              className={`w-full overflow-x-auto no-scrollbar relative select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              data-lenis-prevent
            >
              <div className="min-w-[1000px] w-full relative">
                <svg viewBox="0 0 1000 380" className="w-full h-auto z-10 overflow-visible select-none">
                  {/* Seeded background constellation stars */}
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const x = Math.round((seededRandom(idx * 7 + 10) * 960 + 20) * 10) / 10;
                    const y = Math.round((seededRandom(idx * 13 + 5) * 340 + 20) * 10) / 10;
                    const size = Math.round((0.5 + seededRandom(idx * 3 + 2) * 1.5) * 10) / 10;
                    const opacity = Math.round((0.1 + seededRandom(idx * 17 + 8) * 0.3) * 10) / 10;
                    return (
                      <circle
                        key={`const-star-${idx}`}
                        cx={x}
                        cy={y}
                        r={size}
                        fill="#ffffff"
                        opacity={opacity}
                        className="pointer-events-none"
                      />
                    );
                  })}

                  {/* SVG Real Connecting Graph Edges from AI Discovery Service */}
                  {circlesGraph?.edges && circlesGraph.edges.map((edge, idx) => {
                    const sourceNode = filteredNodes.find(f => f.node.id === edge.source);
                    const targetNode = filteredNodes.find(f => f.node.id === edge.target);
                    if (!sourceNode || !targetNode) return null;
                    if ((!sourceNode.isMatched || !targetNode.isMatched) && searchQuery) return null;

                    const isConnectedToSelected = selectedExplorer && (edge.source === selectedExplorer.id || edge.target === selectedExplorer.id);
                    const strokeClass = edge.relationship === "MUTUAL_FRIEND" 
                      ? (isConnectedToSelected ? "stroke-brand-purple/80 stroke-[2]" : "stroke-brand-purple/30 stroke-[1.5]")
                      : edge.relationship === "FRIEND"
                      ? (isConnectedToSelected ? "stroke-brand-cyan/80 stroke-[2]" : "stroke-brand-cyan/30 stroke-[1.5]")
                      : (isConnectedToSelected ? "stroke-brand-amber/60 stroke-[1.5]" : "stroke-white/10 stroke-[1]");

                    return (
                      <line
                        key={`edge-${idx}-${edge.source}-${edge.target}`}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        className={`${strokeClass} transition-all duration-300`}
                        strokeDasharray={edge.relationship === "RECOMMENDED" ? "4 4" : undefined}
                      />
                    );
                  })}

                  {/* Faint links from all matching nodes to Center User */}
                  {filteredNodes.map(target => {
                    if (!target.isMatched && searchQuery) return null;
                    return (
                      <line
                        key={`center-link-${target.node.id}`}
                        x1={500}
                        y1={190}
                        x2={target.x}
                        y2={target.y}
                        className="stroke-white/[0.03] stroke-[1] pointer-events-none"
                      />
                    );
                  })}

                  {/* Vertical separator wire line */}
                  <line
                    x1={500}
                    y1={0}
                    x2={500}
                    y2={380}
                    stroke="white"
                    strokeOpacity={0.25}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    className="pointer-events-none"
                  />

                  {/* Fixed Center User Node (100px size) */}
                  <g transform="translate(500, 190)">
                    <defs>
                      <clipPath id="clip-center-user-node">
                        <circle cx={0} cy={0} r={50} />
                      </clipPath>
                    </defs>

                    {/* Backlight halo glow */}
                    <circle
                      cx={0}
                      cy={0}
                      r={65}
                      fill="url(#cluster-glow)"
                      className="text-brand-purple pointer-events-none opacity-40 animate-pulse"
                    />
                    
                    {/* Base node circle */}
                    <circle
                      cx={0}
                      cy={0}
                      r={50}
                      fill={avatarUrl ? "#09090b" : "url(#cluster-glow)"}
                      className="stroke-brand-purple/60 stroke-[2px] shadow-2xl transition-all duration-300"
                    />

                    {/* Render inner avatar image or fallback first letter */}
                    {avatarUrl ? (
                      <g clipPath="url(#clip-center-user-node)">
                        <image
                          href={avatarUrl}
                          x={-50}
                          y={-50}
                          width={100}
                          height={100}
                          preserveAspectRatio="xMidYMid slice"
                          className="pointer-events-none select-none"
                        />
                      </g>
                    ) : (
                      <text
                        x={0}
                        y={8}
                        fill="#ffffff"
                        className="font-black text-[32px] select-none pointer-events-none text-center uppercase font-mono shadow-lg"
                        textAnchor="middle"
                      >
                        {initial}
                      </text>
                    )}

                    {/* Floating Pill Label below Center Node */}
                    <g transform="translate(0, 64)">
                      <rect
                        x={-45}
                        y={-10}
                        width={90}
                        height={20}
                        rx={10}
                        className="fill-zinc-950/95 stroke-brand-purple/50 stroke-[1.5px] shadow-lg"
                      />
                      <text
                        x={0}
                        y={4}
                        className="fill-brand-cyan text-[9px] font-black font-mono pointer-events-none select-none text-center tracking-widest uppercase"
                        textAnchor="middle"
                      >
                        YOU
                      </text>
                    </g>
                  </g>

                  {/* Surrounding Explorer Nodes */}
                  {filteredNodes.map((item) => {
                    const isSelected = selectedExplorer?.id === item.node.id;

                    // Handle search queries fading
                    let opacity = 1;
                    if (searchQuery) {
                      opacity = item.isMatched ? 1 : 0.18;
                    }

                    // DNA coloring
                    const getDnaColor = (dna: string) => {
                      if (dna === "Explorer") return "rgba(6, 182, 212, 0.4)";
                      if (dna === "Creative") return "rgba(16, 185, 129, 0.4)";
                      return "rgba(139, 92, 246, 0.4)";
                    };

                    return (
                      <g
                        key={item.node.id}
                        transform={`translate(${item.x}, ${item.y})`}
                        style={{ opacity, transition: "opacity 0.4s ease" }}
                        className="cursor-pointer outline-none"
                        onClick={() => {
                          if (selectedExplorer?.id === item.node.id) {
                            router.push(`/profile/${item.node.username.replace(/^@/, "")}`);
                          } else {
                            setSelectedExplorer(item.node);
                          }
                        }}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (selectedExplorer?.id === item.node.id) {
                              router.push(`/profile/${item.node.username.replace(/^@/, "")}`);
                            } else {
                              setSelectedExplorer(item.node);
                            }
                          }
                        }}
                        aria-label={`${item.node.name}, ${item.node.compatibility}% compatibility match.`}
                      >
                        {/* Selection Halo Indicator */}
                        {isSelected && (
                          <>
                            <circle
                              cx={0}
                              cy={0}
                              r={item.r + 10}
                              className="fill-none stroke-brand-cyan/20 stroke-[1px]"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={0}
                              cy={0}
                              r={item.r + 6}
                              className="fill-none stroke-brand-cyan/45 stroke-[1.5px] animate-pulse"
                            />
                          </>
                        )}

                        {/* Node border color ring */}
                        <circle
                          cx={0}
                          cy={0}
                          r={item.r + 3}
                          fill="transparent"
                          stroke={getDnaColor(item.node.sharedDNA)}
                          strokeWidth={isSelected ? 2 : 1}
                          className="transition-all duration-300"
                        />

                        {/* Clip path for circular image */}
                        <defs>
                          <clipPath id={`clip-explorer-${item.node.id}`}>
                            <circle cx={0} cy={0} r={item.r} />
                          </clipPath>
                        </defs>

                        {/* Base node circle with dynamic fallback bg color if image fails to load */}
                        <circle
                          cx={0}
                          cy={0}
                          r={item.r}
                          fill={(!failedExplorerAvatars[item.node.id] && item.node.avatar?.startsWith("http")) ? "#09090b" : getDnaColor(item.node.sharedDNA).replace("0.4", "0.2")}
                          className="stroke-white/10 hover:stroke-white/30 transition-all duration-300 shadow-xl"
                          strokeWidth={1}
                        />

                        {/* Render inner avatar image or fallback letter */}
                        {!failedExplorerAvatars[item.node.id] && item.node.avatar?.startsWith("http") ? (
                          <g clipPath={`url(#clip-explorer-${item.node.id})`}>
                            <image
                              href={item.node.avatar}
                              x={-item.r}
                              y={-item.r}
                              width={item.r * 2}
                              height={item.r * 2}
                              preserveAspectRatio="xMidYMid slice"
                              className="pointer-events-none select-none"
                              onError={() => {
                                setFailedExplorerAvatars(prev => ({ ...prev, [item.node.id]: true }));
                              }}
                            />
                          </g>
                        ) : (
                          <text
                            x={0}
                            y={isMobile ? 5 : 4}
                            fill="#ffffff"
                            className="font-bold text-[10px] select-none pointer-events-none text-center uppercase font-mono"
                            textAnchor="middle"
                          >
                            {item.node.username ? item.node.username.replace(/^@/, "").charAt(0).toUpperCase() : item.node.name.charAt(0).toUpperCase()}
                          </text>
                        )}

                        {/* Name and Match percentage label under the node */}
                        <text
                          x={0}
                          y={item.r + 14}
                          fill="#ffffff"
                          className="font-bold text-[9px] tracking-wider fill-zinc-300 drop-shadow-md select-none pointer-events-none text-center"
                          textAnchor="middle"
                        >
                          {item.node.name.split(" ")[0]} ({item.node.compatibility}%)
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Explorer Inspector Panel */}
          <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shrink-0 text-left relative min-h-[300px] min-w-0">
            {selectedExplorer ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedExplorer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col gap-4 h-full"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div 
                      onClick={() => router.push(`/profile/${selectedExplorer.username.replace(/^@/, "")}`)}
                      className="flex flex-col min-w-0 cursor-pointer group/inspector-header"
                    >
                      <span className="text-[8px] font-black uppercase tracking-widest text-brand-cyan">
                        {selectedExplorer.sharedDNA} Subclass
                      </span>
                      <h3 className="text-sm font-black text-white uppercase tracking-wider mt-1.5 truncate flex items-center gap-2 group-hover/inspector-header:text-brand-cyan transition-colors">
                        {!failedExplorerAvatars[selectedExplorer.id] && selectedExplorer.avatar?.startsWith("http") ? (
                          <img
                            src={selectedExplorer.avatar}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover shrink-0 border border-white/10"
                            onError={() => {
                              setFailedExplorerAvatars(prev => ({ ...prev, [selectedExplorer.id]: true }));
                            }}
                          />
                        ) : (
                          <div
                            className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 border border-white/10 text-[9px] font-black text-white font-mono"
                            style={{ backgroundColor: getDnaColor(selectedExplorer.sharedDNA) }}
                          >
                            {selectedExplorer.username ? selectedExplorer.username.replace(/^@/, "").charAt(0).toUpperCase() : selectedExplorer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{selectedExplorer.name}</span>
                      </h3>
                      <span className="text-[9px] text-zinc-500 font-mono mt-0.5 group-hover/inspector-header:text-brand-cyan/70 transition-colors">
                        @{selectedExplorer.username}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-brand-cyan shrink-0 bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-1 rounded">
                      {selectedExplorer.compatibility}% Match
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/5 pt-3">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Bio Profile</span>
                      <p className="text-[10px] text-zinc-300 font-semibold mt-1 leading-relaxed">
                        {selectedExplorer.bio}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">AdventureDNA Matches</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedExplorer.tags.map((tag) => (
                          <span key={tag} className="text-[8px] font-bold text-zinc-300 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="flex flex-col bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                        <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Shared Experiences</span>
                        <span className="text-xs font-black text-white mt-0.5">
                          {selectedExplorer.mutualExperiences} Completed
                        </span>
                      </div>
                      <div className="flex flex-col bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                        <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Group Overlaps</span>
                        <span className="text-xs font-black text-white mt-0.5">
                          {selectedExplorer.mutualCommunities} Groups
                        </span>
                      </div>
                      <div className="flex flex-col bg-white/[0.02] border border-white/5 p-2 rounded-xl text-center">
                        <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Mutual Friends</span>
                        <span className="text-xs font-black text-white mt-0.5">
                          {selectedExplorer.mutualFriends} Friends
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-white/5">
                    <button
                      onClick={() => router.push(`/profile/friends/chat:${selectedExplorer.id}`)}
                      className="h-8 rounded-lg bg-zinc-900 border border-white/10 text-[8.5px] font-black uppercase tracking-wider hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center text-white"
                    >
                      Message
                    </button>
                    {selectedExplorer?.username && (
                      <RelationshipButton
                        username={selectedExplorer.username.replace(/^@/, '')}
                        className="h-8 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center shadow-md w-full"
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 my-auto">
                <Compass className="h-8 w-8 text-zinc-700 mb-2 animate-spin-slow" />
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Explorer Inspector</h4>
                <p className="text-[9px] text-zinc-500 mt-1">
                  Select an explorer node from the constellation canvas to inspect compatibility details and send cohort requests.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 7: COMMUNITY ACHIEVEMENTS (TROPHY WALL) */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-brand-amber" /> Ecosystem Achievements
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Earned collective badges and milestone challenges unlocked by community participation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {communityTrophies.map((trophy) => (
            <div
              key={trophy.id}
              className={`bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-3 text-left relative overflow-hidden transition-all hover:scale-101 ${!trophy.unlocked ? "opacity-40" : ""
                }`}
            >
              {/* Backlit glow for unlocked gold/platinum */}
              {trophy.unlocked && trophy.tier === "Platinum" && (
                <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-brand-cyan/10 blur-xl pointer-events-none" />
              )}
              {trophy.unlocked && trophy.tier === "Gold" && (
                <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-brand-amber/10 blur-xl pointer-events-none" />
              )}

              <div className="flex justify-between items-start gap-2">
                <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                  <Trophy className={`h-5 w-5 ${!trophy.unlocked
                    ? "text-zinc-600"
                    : trophy.tier === "Platinum"
                      ? "text-brand-cyan"
                      : trophy.tier === "Legendary"
                        ? "text-brand-purple"
                        : "text-brand-amber"
                    }`} />
                </div>

                <div className="flex flex-col text-right">
                  <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded border w-fit ml-auto ${!trophy.unlocked
                    ? "bg-zinc-900 border-white/5 text-zinc-500"
                    : trophy.tier === "Platinum"
                      ? "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan"
                      : trophy.tier === "Legendary"
                        ? "bg-brand-purple/15 border-brand-purple/20 text-brand-purple"
                        : "bg-brand-amber/15 border-brand-amber/20 text-brand-amber"
                    }`}>
                    {trophy.tier}
                  </span>
                  {trophy.unlocked && trophy.dateUnlocked && (
                    <span className="text-[7px] font-mono text-zinc-500 mt-1">{trophy.dateUnlocked}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-white">
                  {trophy.title}
                </span>
                <p className="text-[8.5px] text-zinc-400 font-semibold leading-normal">
                  {trophy.requirement}
                </p>
              </div>

              {/* Locked overlay lock icon */}
              {!trophy.unlocked && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-zinc-600 text-[8px] font-mono font-bold uppercase tracking-wider">
                  <Lock className="h-3 w-3" /> Locked
                </div>
              )}
            </div>
          ))}
        </div>
      </section>



      {/* Interactivity Toast Alert Notification popup */}
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

    </div>
  );
}
