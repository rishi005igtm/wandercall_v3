"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  UserPlus,
  TrendingUp,
  MessageCircle,
  X
} from "lucide-react";

// ==========================================
// Constellation Companions Data Definition
// ==========================================
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
}

const companionOrbitNodes: CompanionOrbitNode[] = [
  {
    id: "orb-1",
    name: "Sara Khan",
    username: "sara_k",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBvq26wOg0Zi4H-gLYQKJsHN1IhEoteb3j2cn9u__ifA&s=10",
    compatibility: 96,
    sharedDNA: "Explorer",
    mutualExperiences: 5,
    mutualCommunities: 4,
    mutualFriends: 8,
    bio: "High altitude mountaineer & deep-sea reef mapping tracker. Chasing adventure milestones.",
    tags: ["Trekking", "Scuba Diving", "Monsoons"],
    communities: ["Cliff Trekkers", "Netrani Scuba", "Himalayan Base", "Western Hikes"]
  },
  {
    id: "orb-2",
    name: "Arjun Mehta",
    username: "arjun_m",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvZFutcVD1y3r8oyib405OisAEFWrUg8V4jLXEQbaIcw&s=10",
    compatibility: 89,
    sharedDNA: "Explorer",
    mutualExperiences: 3,
    mutualCommunities: 3,
    mutualFriends: 5,
    bio: "Enduro cyclist, road running runner & slow homestay volunteer.",
    tags: ["Cycling", "Running", "Homestays"],
    communities: ["Enduro Cyclists", "Trail Runners", "Roadtrip Riders"]
  },
  {
    id: "orb-3",
    name: "Divya Kapoor",
    username: "divya_k",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx2MPl0cP4JCKyDUZalUI22n5kjPSKM6BUfWmpLaIeeA&s=10",
    compatibility: 84,
    sharedDNA: "Creative",
    mutualExperiences: 4,
    mutualCommunities: 2,
    mutualFriends: 4,
    bio: "Landscape and candid lens photographer capturing rural folklore and temple scripts.",
    tags: ["Landscape", "Street Photo", "Heritage"],
    communities: ["Visual Storys", "Street Lens", "Heritage Walk"]
  },
  {
    id: "orb-4",
    name: "Milind Soman",
    username: "milind_s",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lVIJXtpBDkAYOUPk4jxPhvb9kUDMT7Py9zc_QL9CKg&s=10",
    compatibility: 92,
    sharedDNA: "Explorer",
    mutualExperiences: 6,
    mutualCommunities: 5,
    mutualFriends: 11,
    bio: "Ultra marathon trail runner & campsite storytelling guide. Basecamp safety expert.",
    tags: ["Survival", "Camping", "Trail Runs"],
    communities: ["Trail Runners", "Survival Campers", "Campfire Myths", "Himalayan Base"]
  },
  {
    id: "orb-5",
    name: "Ananya Rao",
    username: "ananya_r",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQkhRGeb01nDVu6PoETV5jzYL75nO9mxPlbihWzbk-2A&s=10",
    compatibility: 78,
    sharedDNA: "Socializer",
    mutualExperiences: 2,
    mutualCommunities: 3,
    mutualFriends: 3,
    bio: "Traditional cafe hopper, filter coffee cartographer, and heritage food market crawler.",
    tags: ["Food Crawls", "Cafes", "Organic"],
    communities: ["Bangalore Crawl", "Heritage Foodies", "Cafe Hoppers"]
  },
  {
    id: "orb-6",
    name: "Rohit Kumar",
    username: "rohit_k",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBvq26wOg0Zi4H-gLYQKJsHN1IhEoteb3j2cn9u__ifA&s=10",
    compatibility: 95,
    sharedDNA: "Explorer",
    mutualExperiences: 8,
    mutualCommunities: 6,
    mutualFriends: 9,
    bio: "PADI dive master and marine reef restoration organizer. Waterfall hiker.",
    tags: ["Scuba", "Reef Mapping", "Waterfalls"],
    communities: ["Netrani Scuba", "Waterfall Walks", "Cliff Trekkers"]
  },
  {
    id: "orb-7",
    name: "Zoe Chen",
    username: "zoe_c",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvZFutcVD1y3r8oyib405OisAEFWrUg8V4jLXEQbaIcw&s=10",
    compatibility: 73,
    sharedDNA: "Socializer",
    mutualExperiences: 3,
    mutualCommunities: 2,
    mutualFriends: 6,
    bio: "Campfire acoustic singer, board game pub night host, and night explorer.",
    tags: ["Music", "Survival", "Pub Crawls"],
    communities: ["Acoustic Fire", "Pub Crawlers", "Midnight Walks"]
  },
  {
    id: "orb-8",
    name: "Kabir Singh",
    username: "kabir_s",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx2MPl0cP4JCKyDUZalUI22n5kjPSKM6BUfWmpLaIeeA&s=10",
    compatibility: 81,
    sharedDNA: "Creative",
    mutualExperiences: 4,
    mutualCommunities: 3,
    mutualFriends: 7,
    bio: "Epigrapher exploring ruins and ghost settlements. Documenting local myths.",
    tags: ["Archaeology", "Ruins", "Folklore"],
    communities: ["Decipher Scripts", "Village Legends", "Heritage Walk"]
  },
  {
    id: "orb-9",
    name: "Priya Sharma",
    username: "priya_s",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lVIJXtpBDkAYOUPk4jxPhvb9kUDMT7Py9zc_QL9CKg&s=10",
    compatibility: 87,
    sharedDNA: "Explorer",
    mutualExperiences: 4,
    mutualCommunities: 3,
    mutualFriends: 6,
    bio: "Backpacking enthusiast and forest camping checklist reviewer.",
    tags: ["Camping", "Forests", "Backpacking"],
    communities: ["Himalayan Base", "Western Hikes", "Deoriatal Camps"]
  },
  {
    id: "orb-10",
    name: "Vikram Malhotra",
    username: "vikram_m",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQkhRGeb01nDVu6PoETV5jzYL75nO9mxPlbihWzbk-2A&s=10",
    compatibility: 76,
    sharedDNA: "Socializer",
    mutualExperiences: 3,
    mutualCommunities: 3,
    mutualFriends: 4,
    bio: "Solo budget trip coordinator and airport lounge mapper.",
    tags: ["Solo Travel", "Nomad Life", "Aviation"],
    communities: ["Solo Backpacks", "Roadtrip Riders", "Offbeat Trails"]
  },
  {
    id: "orb-11",
    name: "Aisha Patel",
    username: "aisha_p",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBvq26wOg0Zi4H-gLYQKJsHN1IhEoteb3j2cn9u__ifA&s=10",
    compatibility: 83,
    sharedDNA: "Creative",
    mutualExperiences: 4,
    mutualCommunities: 2,
    mutualFriends: 5,
    bio: "Travel journal sketch artist documenting local craft workshops.",
    tags: ["Sketching", "Crafts", "Journals"],
    communities: ["Travel Logs", "Folk Crafts", "Poetry Circle"]
  },
  {
    id: "orb-12",
    name: "Rohan Joshi",
    username: "rohan_j",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvZFutcVD1y3r8oyib405OisAEFWrUg8V4jLXEQbaIcw&s=10",
    compatibility: 79,
    sharedDNA: "Explorer",
    mutualExperiences: 2,
    mutualCommunities: 2,
    mutualFriends: 3,
    bio: "Urban skate trail mapper and sunset spot seeker.",
    tags: ["Skating", "Urban Exploring", "Sunset Tracks"],
    communities: ["Midnight Walks", "Bouldering Hub", "Landscape Pics"]
  },
  {
    id: "orb-13",
    name: "Neha Gupta",
    username: "neha_g",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx2MPl0cP4JCKyDUZalUI22n5kjPSKM6BUfWmpLaIeeA&s=10",
    compatibility: 85,
    sharedDNA: "Socializer",
    mutualExperiences: 5,
    mutualCommunities: 4,
    mutualFriends: 7,
    bio: "Night market food crawler and home-style noodle recipe enthusiast.",
    tags: ["Street Food", "Cooking", "Night Crawls"],
    communities: ["Street Eats Hub", "Bangalore Crawl", "Dessert Lovers"]
  },
  {
    id: "orb-14",
    name: "Dev Adams",
    username: "dev_a",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lVIJXtpBDkAYOUPk4jxPhvb9kUDMT7Py9zc_QL9CKg&s=10",
    compatibility: 91,
    sharedDNA: "Explorer",
    mutualExperiences: 7,
    mutualCommunities: 5,
    mutualFriends: 10,
    bio: "Wilderness survival mapper and offbeat route track creator.",
    tags: ["Survival", "Offbeat Routes", "Navigation"],
    communities: ["Survival Campers", "Map Makers", "Himalayan Base"]
  },
  {
    id: "orb-15",
    name: "Tara Sen",
    username: "tara_s",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQkhRGeb01nDVu6PoETV5jzYL75nO9mxPlbihWzbk-2A&s=10",
    compatibility: 88,
    sharedDNA: "Creative",
    mutualExperiences: 5,
    mutualCommunities: 3,
    mutualFriends: 8,
    bio: "Astro-gazer and twilight photography expert mapping dark skies.",
    tags: ["Astronomy", "Night Photo", "Stargazing"],
    communities: ["Star Gazers", "Landscape Pics", "Acoustic Fire"]
  }
];

// ==========================================
// Dynamic Avatar Component with Fallbacks
// ==========================================
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

export default function ExplorerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  // Follower trigger states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersOffset, setFollowersOffset] = useState(0);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Connection list modal & zoom states
  const [zoomedAvatar, setZoomedAvatar] = useState<{ url: string; name: string } | null>(null);
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [connectionsActiveTab, setConnectionsActiveTab] = useState<"followers" | "following">("followers");

  const followersList = useMemo(() => {
    return companionOrbitNodes.filter(n => n.username !== username && n.username !== username.replace(/^@/, "")).slice(0, 6);
  }, [username]);

  const followingList = useMemo(() => {
    return companionOrbitNodes.filter(n => n.username !== username && n.username !== username.replace(/^@/, "")).slice(6, 11);
  }, [username]);

  // Pagination states
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [communityPageIndex, setCommunityPageIndex] = useState(0);
  const [campfirePageIndex, setCampfirePageIndex] = useState(0);
  const [activeDnaTab, setActiveDnaTab] = useState<number | null>(null);

  // Toast Helper
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Find user and construct dynamic profile
  const profile = useMemo(() => {
    const node = companionOrbitNodes.find(
      n => n.username === username || n.username.replace(/^@/, "") === username
    );

    if (node) {
      return {
        name: node.name,
        username: `@${node.username.replace(/^@/, "")}`,
        avatar: node.avatar,
        location: node.sharedDNA === "Explorer" ? "Leh-Ladakh, India" : node.sharedDNA === "Creative" ? "Mumbai, India" : "Bangalore, India",
        joined: "October 2024",
        bio: node.bio || "Avid traveler, explorer, and active member of community constellations.",
        reputation: Math.round(720 + node.compatibility * 2.5),
        level: Math.round(6 + node.compatibility / 12),
        xp: { current: 1840, next: 3000 },
        followersCount: Math.round(850 + node.compatibility * 9),
        followingCount: Math.round(180 + node.compatibility * 2),
        stats: [
          { label: "Adventures Completed", value: node.mutualExperiences + 18, color: "text-brand-cyan" },
          { label: "Communities Joined", value: node.communities.length, color: "text-brand-purple" },
          { label: "Campfires Hosted", value: node.mutualExperiences + 4, color: "text-brand-amber" },
          { label: "Badges Unlocked", value: 12, color: "text-brand-emerald" },
        ],
        dnaStats: [
          { name: "Explorer", value: node.sharedDNA === "Explorer" ? 95 : 70, desc: "Thrives on remote expeditions and pathfinding.", color: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5" },
          { name: "Thrill Seeker", value: 80, desc: "Seeks adrenaline rushes, heights, and speed.", color: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
          { name: "Creator", value: node.sharedDNA === "Creative" ? 95 : 60, desc: "Documents journeys, takes photographs, and logs stories.", color: "text-brand-purple border-brand-purple/20 bg-brand-purple/5" },
          { name: "Learner", value: 75, desc: "Interested in local history, ecology, and heritage.", color: "text-brand-indigo border-brand-indigo/20 bg-brand-indigo/5" },
          { name: "Socializer", value: node.sharedDNA === "Socializer" ? 95 : 80, desc: "Enjoys cohort meetups, campfire sessions, and group treks.", color: "text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5" },
          { name: "Storyteller", value: 70, desc: "Shares travel journals, notes, and hosts campfires.", color: "text-brand-amber border-brand-amber/20 bg-brand-amber/5" },
        ],
        timelineJourney: [
          { 
            date: "June 24, 2026", 
            type: "adventure", 
            title: `Completed ${node.tags[0] || "High Ridge"} Trek`, 
            details: `Explored the remote ridge with a cohort group. Logged GPS tracks and reviewed safety camps.`,
            xp: "+250 XP", 
            meta: node.tags[1] || "Garhwal Range"
          },
          { 
            date: "June 15, 2026", 
            type: "campfire", 
            title: `Hosted Campfire: '${node.tags[1] || "Nomad Trails"} Insights'`, 
            details: `Shared safety protocols and campsite gear listings with 78 listeners.`,
            xp: "+120 XP", 
            meta: "78 listeners • 40m"
          },
          { 
            date: "May 28, 2026", 
            type: "badge", 
            title: `Unlocked '${node.sharedDNA} Subclass' Badge`, 
            details: `Awarded for extreme consistency and milestones inside dynamic group modules.`,
            xp: "+100 XP", 
            meta: "Explorer Star"
          }
        ],
        memoriesList: [
          { 
            id: "mem-1", 
            image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80", 
            title: `Starlit ${node.tags[0] || "Forest"} Camp`, 
            text: "Freezing winds and mirror reflections of snowy ridges under a full moon backdrop.", 
            location: "Himalayas, India", 
            tag: node.tags[0] || "Camping", 
            likes: 124, 
            comments: 18, 
            views: "1.1k" 
          },
          { 
            id: "mem-2", 
            image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80", 
            title: `Hikes around ${node.tags[1] || "Western Valley"}`, 
            text: "Foggy mornings, wet trails, and a warm group tea session at the timberline cottage.", 
            location: "Western Ghats, India", 
            tag: node.tags[1] || "Trekking", 
            likes: 85, 
            comments: 9, 
            views: "640" 
          }
        ],
        communities: node.communities.map((c, i) => ({
          name: c,
          members: `${Math.round(2000 + i * 1500)} members`,
          activeRooms: i % 2 === 0 ? 1 : 0
        })),
        campfires: [
          { 
            id: `camp-${node.username.replace(/^@/, "")}-1`, 
            title: `Exploring ${node.tags[0] || "High Trails"} Secrets`, 
            category: node.sharedDNA === "Explorer" ? "Adventure" : "Learning", 
            hostName: node.name, 
            hostAvatar: node.avatar, 
            participants: 28 
          },
          { 
            id: `camp-${node.username.replace(/^@/, "")}-2`, 
            title: `${node.tags[1] || "Campfire"} Acoustic Stories`, 
            category: "Storytelling", 
            hostName: node.name, 
            hostAvatar: node.avatar, 
            participants: 14 
          },
          { 
            id: `camp-${node.username.replace(/^@/, "")}-3`, 
            title: `Budget Hacks for ${node.tags[2] || "Backpacking"}`, 
            category: "Travel", 
            hostName: node.name, 
            hostAvatar: node.avatar, 
            participants: 39 
          }
        ]
      };
    }

    // Default Fallback profile
    return {
      name: username ? username.charAt(0).toUpperCase() + username.slice(1) : "Priya Sharma",
      username: `@${username || "priya_s"}`,
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lVIJXtpBDkAYOUPk4jxPhvb9kUDMT7Py9zc_QL9CKg&s=10",
      location: "New Delhi, India",
      joined: "September 2024",
      bio: "Backpacking enthusiast, forest camper, and trail gear reviewer. Always mapping new trails.",
      reputation: 815,
      level: 10,
      xp: { current: 1840, next: 3000 },
      followersCount: 1240,
      followingCount: 482,
      stats: [
        { label: "Adventures Completed", value: 29, color: "text-brand-cyan" },
        { label: "Communities Joined", value: 3, color: "text-brand-purple" },
        { label: "Campfires Hosted", value: 7, color: "text-brand-amber" },
        { label: "Badges Unlocked", value: 12, color: "text-brand-emerald" },
      ],
      dnaStats: [
        { name: "Explorer", value: 92, desc: "Thrives on remote expeditions and pathfinding.", color: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5" },
        { name: "Thrill Seeker", value: 75, desc: "Seeks adrenaline rushes, heights, and speed.", color: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
        { name: "Creator", value: 80, desc: "Documents journeys, takes photographs, and logs stories.", color: "text-brand-purple border-brand-purple/20 bg-brand-purple/5" },
        { name: "Learner", value: 85, desc: "Interested in local history, ecology, and heritage.", color: "text-brand-indigo border-brand-indigo/20 bg-brand-indigo/5" },
        { name: "Socializer", value: 70, desc: "Enjoys cohort meetups, campfire sessions, and group treks.", color: "text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5" },
        { name: "Storyteller", value: 88, desc: "Shares travel journals, notes, and hosts campfires.", color: "text-brand-amber border-brand-amber/20 bg-brand-amber/5" },
      ],
      timelineJourney: [
        { date: "June 18, 2026", type: "adventure", title: "Completed Deoriatal Chopta Trek", details: "Trekked 12km through dense rhododendron woods to reach high alpine lake meadows.", xp: "+200 XP", meta: "Chopta, Uttarakhand" },
        { date: "June 10, 2026", type: "campfire", title: "Hosted Campfire: 'Solo Hikes in Garhwal'", details: "Shared trail safety, custom maps, and home-stay guides with 64 listeners.", xp: "+120 XP", meta: "64 listeners • 40m" }
      ],
      memoriesList: [
        { id: "mem-1", image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80", title: "Stargazing at Deoriatal Lake", text: "Freezing winds and mirror reflections of Chaukhamba peaks at midnight.", location: "Uttarakhand, India", tag: "Camping", likes: 148, comments: 24, views: "1.2k" }
      ],
      communities: [
        { name: "Himalayan Base", members: "12,450 members", activeRooms: 3 },
        { name: "Western Hikes", members: "8,920 members", activeRooms: 1 },
        { name: "Deoriatal Camps", members: "2,310 members", activeRooms: 0 }
      ],
      campfires: [
        { id: "camp-himalayas", title: "Under the Himalayan Stars", category: "Adventure", hostName: "Priya Sharma", hostAvatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8lVIJXtpBDkAYOUPk4jxPhvb9kUDMT7Py9zc_QL9CKg&s=10", participants: 42 }
      ]
    };
  }, [username]);

  // Handle follow click toggling
  const handleFollowClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersOffset(0);
      triggerToast(`Unfollowed ${profile.name}`);
    } else {
      setIsFollowing(true);
      setFollowersOffset(1);
      triggerToast(`Following ${profile.name}`);
    }
  };

  // Nav to active chat room
  const handleMessageClick = () => {
    router.push(`/profile/friends`);
    triggerToast(`Connecting secure chat tunnel to ${profile.name}...`);
  };

  const handleShareClick = async () => {
    const cleanUsername = username ? username.replace(/^@/, "") : "";
    const profileUrl = window.location.origin + "/profile/" + cleanUsername;
    const shareData = {
      title: "Wandercall Explorer Passport",
      text: `Check out ${profile.name}'s explorer passport profile on Wandercall!`,
      url: profileUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast("Profile shared successfully!");
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          triggerToast("Failed to share profile.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(profileUrl);
        triggerToast("Profile link copied to clipboard: " + profileUrl);
      } catch (err) {
        triggerToast("Failed to copy link to clipboard.");
      }
    }
  };

  // Achievements & Badges List
  const achievements = [
    { name: "First Adventure", desc: "Completed 1st booking", icon: Map, unlocked: true, date: "May 16, 2026" },
    { name: "Night Owl", desc: "Joined 5 late-night campfires", icon: Radio, unlocked: true, date: "Jun 05, 2026" },
    { name: "Community Leader", desc: "Hosted room with 50+ listeners", icon: Users, unlocked: true, date: "Jun 12, 2026" },
    { name: "Thrill Seeker", desc: "Completed 3 high-intensity quests", icon: Sparkles, unlocked: true, date: "May 28, 2026" },
    { name: "Food Explorer", desc: "Completed 2 culinary journeys", icon: Star, unlocked: false, progress: "1/2" },
    { name: "Adventure Master", desc: "Reach level 15 as an explorer", icon: Shield, unlocked: false, progress: "Lv.12/15" }
  ];

  // Framer-motion animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } }
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
        {/* Cover Landscape */}
        <div className="w-full h-[200px] md:h-[280px] rounded-3xl overflow-hidden relative border border-white/5 shadow-inner">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop" 
            alt="Scenic Snowy Mountains" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        {/* Profile Card Header overlay */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end px-3 md:px-8 -mt-16 md:-mt-20 z-10 gap-6 w-full text-center lg:text-left">
          
          {/* Avatar & Identifiers */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-5 w-full lg:w-auto">
            <div 
              onClick={() => setZoomedAvatar({ url: profile.avatar, name: profile.name })}
              className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-1 border-4 border-zinc-950 shadow-2xl relative overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95 z-20 group/avatar"
            >
              <CompanionAvatar
                avatar={profile.avatar}
                name={profile.name}
                className="h-full w-full text-4xl font-black border-none group-hover/avatar:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{profile.name}</h1>
                <span className="h-5 w-5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[10px] font-bold">
                  <Check className="h-3 w-3" />
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-1 text-xs font-mono text-zinc-400">
                <span>{profile.username}</span>
                <span className="text-zinc-600 font-sans">•</span>
                <div className="flex gap-2">
                  <span 
                    onClick={() => {
                      setConnectionsActiveTab("followers");
                      setShowConnectionsModal(true);
                    }}
                    className="hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <strong className="text-zinc-200 font-sans font-black">{profile.followersCount + followersOffset}</strong> Followers
                  </span>
                  <span className="text-zinc-600 font-sans">•</span>
                  <span 
                    onClick={() => {
                      setConnectionsActiveTab("following");
                      setShowConnectionsModal(true);
                    }}
                    className="hover:text-white transition-colors cursor-pointer select-none"
                  >
                    <strong className="text-zinc-200 font-sans font-black">{profile.followingCount}</strong> Following
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3 text-xs text-zinc-400 font-semibold">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-cyan" /> {profile.location}</span>
                <span className="h-1 w-1 rounded-full bg-white/10 hidden sm:inline" />
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-brand-purple" /> Explorer since {profile.joined}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Follow / Message Action Block */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 w-full lg:w-auto">
            <button 
              onClick={handleFollowClick}
              className={`h-10 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 ${
                isFollowing 
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5" 
                  : "bg-brand-cyan text-zinc-950 hover:brightness-110"
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" /> Follow
                </>
              )}
            </button>
            
            <button 
              onClick={handleMessageClick}
              className="h-10 px-5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5 text-brand-purple" /> Message
            </button>

            <button 
              onClick={handleShareClick}
              className="h-10 w-10 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all cursor-pointer shrink-0" 
              aria-label="Share profile"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bio block */}
        <div className="mt-6 px-3 md:px-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
          <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed">
            {profile.bio}
          </p>
        </div>

        {/* Dynamic counters grid & Explorer Score */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 px-3 md:px-8">
          
          {/* Custom Explorer Score Circular gauge */}
          <div className="col-span-2 md:col-span-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" className="stroke-white/5 stroke-3 fill-transparent" />
                <circle cx="32" cy="32" r="28" className="stroke-brand-cyan stroke-3 fill-transparent transition-all duration-1000" strokeDasharray={175} strokeDashoffset={175 - (175 * profile.reputation) / 1000} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[13px] font-mono font-black text-white">{profile.reputation}</span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-2">Reputation Score</p>
            <p className="text-[8px] text-brand-cyan font-bold tracking-wider uppercase mt-0.5">Top 8% Global</p>
          </div>

          {/* Metric Stats Cards */}
          {profile.stats.map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col justify-center text-left shadow-lg">
              <span className={`text-2xl md:text-3xl font-black font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">{stat.label}</span>
            </div>
          ))}

        </div>
      </motion.section>

      {/* SECTION 2: JOINED COMMUNITIES & HOSTED CAMPFIRES SECTIONS */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Joined Communities (6 Columns) */}
        <div className="lg:col-span-6 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Joined Communities</h2>
              <p className="text-xs text-zinc-400 font-medium">Adventure subgroups and campfire channels this explorer participates in.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => setCommunityPageIndex(prev => Math.max(0, prev - 1))}
                disabled={communityPageIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCommunityPageIndex(prev => Math.min(Math.ceil(profile.communities.length / 3) - 1, prev + 1))}
                disabled={communityPageIndex >= Math.ceil(profile.communities.length / 3) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-h-[180px]">
            {profile.communities.slice(communityPageIndex * 3, communityPageIndex * 3 + 3).map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 hover:translate-x-0.5 duration-200 transition-all cursor-pointer text-left">
                <div>
                  <h3 className="text-xs font-black text-white">{item.name}</h3>
                  <span className="text-[10px] text-zinc-500 font-semibold">{item.members}</span>
                </div>

                {item.activeRooms > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                    <Radio className="h-3 w-3" />
                    {item.activeRooms} Live Campfires
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                    0 Active Rooms
                  </span>
                )}
              </div>
            ))}
            {profile.communities.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">No joined communities found.</div>
            )}
          </div>
        </div>

        {/* Hosted/Active Campfires (6 Columns) */}
        <div className="lg:col-span-6 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Campfires</h2>
              <p className="text-xs text-zinc-400 font-medium">Campfires hosted or co-moderated by this explorer.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => setCampfirePageIndex(prev => Math.max(0, prev - 1))}
                disabled={campfirePageIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCampfirePageIndex(prev => Math.min(Math.ceil(profile.campfires.length / 2) - 1, prev + 1))}
                disabled={campfirePageIndex >= Math.ceil(profile.campfires.length / 2) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-h-[180px]">
            {profile.campfires.slice(campfirePageIndex * 2, campfirePageIndex * 2 + 2).map((room, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 transition-all text-left">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-zinc-950/60 border border-white/10 flex items-center justify-center shrink-0">
                    <Radio className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple mb-1 inline-block">
                      {room.category}
                    </span>
                    <h3 className="text-xs font-black text-white truncate">{room.title}</h3>
                    <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">Host: {room.hostName}</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/profile/campfires/${room.id}--${room.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`)}
                  className="bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shrink-0"
                >
                  Join Circle
                </button>
              </div>
            ))}
            {profile.campfires.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-xs">No campfires found.</div>
            )}
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: JOURNEY TIMELINE */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Timeline Path */}
        <div className="lg:col-span-12 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Journey</h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Chronological vertical passport trail detailing trips completed, medals unlocked, and milestones.</p>
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
                onClick={() => setJourneyIndex(prev => Math.min(Math.ceil(profile.timelineJourney.length / 3) - 1, prev + 1))}
                disabled={journeyIndex >= Math.ceil(profile.timelineJourney.length / 3) - 1}
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
            {profile.timelineJourney.slice(journeyIndex * 3, (journeyIndex + 3)).map((node, i) => {
              const isAdventure = node.type === "adventure";
              const isCampfire = node.type === "campfire";
              const isBadge = node.type === "badge";
              
              const dotColor = isAdventure ? "bg-brand-cyan" : isCampfire ? "bg-brand-purple" : "bg-brand-amber";
              const dotBorder = isAdventure ? "border-brand-cyan/20" : isCampfire ? "border-brand-purple/20" : "border-brand-amber/20";

              return (
                <div key={i} className="relative group">
                  <div className="absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-4 border-zinc-950 flex items-center justify-center shrink-0 z-10">
                    <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${dotColor} group-hover:scale-110 transition-transform`} />
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex flex-col gap-2 hover:border-white/10 transition-all shadow-md group-hover:translate-x-0.5 duration-200 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">{node.date}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${dotColor}/10 ${dotBorder} ${isAdventure ? "text-brand-cyan" : isCampfire ? "text-brand-purple" : "text-brand-amber"}`}>
                          {node.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-cyan font-mono self-start sm:self-center">{node.xp}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white">{node.title}</h3>
                    <p className="text-xs text-zinc-400 font-medium leading-relaxed">{node.details}</p>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                      <MapPin className="h-3 w-3" />
                      {node.meta}
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* SECTION 4: MEMORY BOOK */}
      <motion.section variants={itemVariants} className="bg-white/[0.01] border border-white/5 p-4 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Memory Book</h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">Photographs and experience journals locked in this explorer's travel history.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMemoryIndex(prev => Math.max(0, prev - 1))}
                disabled={memoryIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMemoryIndex(prev => Math.min(Math.ceil(profile.memoriesList.length / 2) - 1, prev + 1))}
                disabled={memoryIndex >= Math.ceil(profile.memoriesList.length / 2) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          key={memoryIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {profile.memoriesList.slice(memoryIndex * 2, (memoryIndex * 2) + 2).map((memory) => (
            <div key={memory.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex flex-col gap-4 hover:border-white/10 hover:scale-[1.01] transition-all duration-200 group">
              <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden relative shadow-inner">
                <img src={memory.image} alt={memory.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                <span className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-zinc-950/80 border border-white/10 px-2 py-0.5 rounded-full text-brand-cyan">
                  {memory.tag}
                </span>
              </div>
              
              <div className="text-left flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-black text-white">{memory.title}</h3>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-medium mt-1">{memory.text}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-semibold text-zinc-400 border-b border-white/5 pb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-purple" />
                    {memory.location}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold mt-1">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group">
                      <Heart className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span>{memory.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group">
                      <MessageSquare className="h-4 w-4 group-hover:scale-110" />
                      <span>{memory.comments}</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                    <Globe className="h-3.5 w-3.5 text-zinc-600" />
                    {memory.views} views
                  </span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* SECTION 5: BADGES & ACHIEVEMENTS */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Achievements Trophy Room */}
        <div className="lg:col-span-12 bg-white/[0.01] border border-white/5 p-4 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Achievements & Badges</h2>
            <p className="text-xs text-zinc-400 font-medium">Unlocked badges details from this explorer's passport milestones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((badge, i) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={i} className={`bg-white/[0.02] border p-5 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group hover:scale-102 transition-all duration-200 min-h-[190px] ${
                  badge.unlocked ? "border-white/5" : "border-white/5 opacity-55"
                }`}>
                  {badge.unlocked && (
                    <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-brand-cyan/5 blur-xl group-hover:bg-brand-cyan/10 transition-colors" />
                  )}

                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform duration-300 group-hover:rotate-6 ${
                    badge.unlocked 
                      ? "bg-brand-indigo/10 border-brand-indigo/20 text-brand-cyan" 
                      : "bg-white/5 border-white/5 text-zinc-600"
                  }`}>
                    <BadgeIcon className="h-6 w-6" />
                  </div>

                  <div className="mt-3 text-center flex flex-col items-center w-full">
                    <h3 className="text-xs font-black text-white px-1 leading-snug">{badge.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed mt-1 px-1 break-words w-full">{badge.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 w-full">
                    {badge.unlocked ? (
                      <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-cyan/80">Unlocked {badge.date}</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 items-center">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-zinc-500">Progress {badge.progress}</span>
                        <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-purple rounded-full w-[50%]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* SECTION 6: EXPLORER ANALYTICS */}
      <motion.section variants={itemVariants} className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Explorer Analytics</h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">Performance logs monitoring monthly metrics, total distances, and hours logged.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Hours Explored</span>
                <span className="text-lg font-black text-white font-mono">62 Hrs</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Map className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Distance Traveled</span>
                <span className="text-lg font-black text-white font-mono">920 Km</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all text-left">
              <div className="h-10 w-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Quest Success Rate</span>
                <span className="text-lg font-black text-white font-mono">88%</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-inner flex flex-col justify-between text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Experiences Completed (Jan - Jun)</h3>
              <span className="text-[10px] font-mono text-zinc-500">6 Months Total</span>
            </div>

            <div className="relative h-44 w-full flex items-end justify-around border-b border-white/5 pb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -z-10">
                <div className="border-t border-white/[0.02] w-full" />
                <div className="border-t border-white/[0.02] w-full" />
                <div className="border-t border-white/[0.02] w-full" />
              </div>

              {[
                { label: "Jan", val: 1, height: "20%" },
                { label: "Feb", val: 3, height: "55%" },
                { label: "Mar", val: 2, height: "35%" },
                { label: "Apr", val: 4, height: "70%" },
                { label: "May", val: 3, height: "55%" },
                { label: "Jun", val: 5, height: "90%" }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group w-12 cursor-pointer">
                  <span className="text-[9px] font-mono font-bold text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 block">
                    {bar.val} Exp
                  </span>
                  
                  <div 
                    style={{ height: bar.height }}
                    className="w-8 rounded-t-lg bg-gradient-to-t from-brand-indigo/40 to-brand-purple group-hover:brightness-110 shadow-lg shadow-brand-indigo/10 transition-all duration-300 min-h-[4px]"
                  />
                  
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 mt-1">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Profile Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 glass-panel border-brand-cyan/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-zinc-950/90 backdrop-blur-xl"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {showToast}
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

              <div className="text-center">
                <h4 className="text-sm font-black text-white">{zoomedAvatar.name}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Explorer Passport Photo</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connections (Followers/Following) Modal */}
      <AnimatePresence>
        {showConnectionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-none">
            {/* Backdrop click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowConnectionsModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative z-10 flex flex-col bg-zinc-950/90 border border-white/10 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden backdrop-blur-2xl"
            >
              {/* Top gradient glow line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-amber" />
              
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-white/5">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Explorer Connections</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Passport network for {profile.name}</p>
                </div>
                <button
                  onClick={() => setShowConnectionsModal(false)}
                  className="p-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-4 py-2 bg-white/[0.01] border-b border-white/5 gap-2">
                <button
                  onClick={() => setConnectionsActiveTab("followers")}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                    connectionsActiveTab === "followers"
                      ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Followers ({followersList.length})
                </button>
                <button
                  onClick={() => setConnectionsActiveTab("following")}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                    connectionsActiveTab === "following"
                      ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Following ({followingList.length})
                </button>
              </div>

              {/* Connections List */}
              <div className="p-4 overflow-y-auto max-h-[350px] flex flex-col gap-3">
                {(connectionsActiveTab === "followers" ? followersList : followingList).map((connection) => (
                  <div
                    key={connection.id}
                    onClick={() => {
                      setShowConnectionsModal(false);
                      router.push(`/profile/${connection.username.replace(/^@/, "")}`);
                    }}
                    className="group bg-white/[0.02] border border-white/5 hover:border-white/15 p-3 rounded-2xl flex items-center justify-between gap-3 hover:bg-white/[0.04] transition-all cursor-pointer transform hover:-translate-y-0.5 duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CompanionAvatar
                        avatar={connection.avatar}
                        name={connection.name}
                        className="h-10 w-10 text-sm border-2 border-white/10 group-hover:border-white/20 transition-all shadow-md"
                      />
                      <div className="min-w-0 text-left">
                        <h4 className="text-xs font-black text-white group-hover:text-brand-cyan transition-colors truncate">
                          {connection.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-mono truncate">
                          @{connection.username.replace(/^@/, "")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Sparkles className="h-2.5 w-2.5 text-brand-purple" /> {connection.compatibility}%
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
                {(connectionsActiveTab === "followers" ? followersList : followingList).length === 0 && (
                  <div className="text-center py-12 text-zinc-500 text-xs font-medium">
                    No connections found.
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 bg-zinc-950 border-t border-white/5 text-center">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                  Wandercall Social Passport Graph
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
