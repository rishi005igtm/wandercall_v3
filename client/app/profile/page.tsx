"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAppSelector } from "@/lib/store/store";
import { useUserProfileQuery } from "@/hooks/api/useUserQueries";


// --- MOCK PROFILE DATA ---
const profileData = {
  name: "Rishiraj",
  username: "@rishi005",
  location: "Bangalore, India",
  joined: "June 2024",
  bio: "Digital nomad and thrill seeker. Always looking for the next off-grid adventure, mountain summit, or campfire story.",
  reputation: 842, // Explorer Score out of 1000
  level: 12,
  xp: { current: 3240, next: 4000 },
  stats: [
    { label: "Adventures Completed", value: 37, color: "text-brand-cyan" },
    { label: "Communities Joined", value: 14, color: "text-brand-purple" },
    { label: "Campfires Hosted", value: 8, color: "text-brand-amber" },
    { label: "Badges Unlocked", value: 16, color: "text-brand-emerald" },
  ]
};

// Radar chart dimensions
const dnaStats = [
  { name: "Explorer", value: 95, desc: "Thrives on remote expeditions and pathfinding.", color: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5" },
  { name: "Thrill Seeker", value: 90, desc: "Seeks adrenaline rushes, heights, and speed.", color: "text-rose-500 border-rose-500/20 bg-rose-500/5" },
  { name: "Creator", value: 60, desc: "Documents journeys, takes photographs, and logs stories.", color: "text-brand-purple border-brand-purple/20 bg-brand-purple/5" },
  { name: "Learner", value: 75, desc: "Interested in local history, ecology, and heritage.", color: "text-brand-indigo border-brand-indigo/20 bg-brand-indigo/5" },
  { name: "Socializer", value: 85, desc: "Enjoys cohort meetups, campfire sessions, and group treks.", color: "text-brand-emerald border-brand-emerald/20 bg-brand-emerald/5" },
  { name: "Storyteller", value: 65, desc: "Shares travel journals, notes, and hosts campfires.", color: "text-brand-amber border-brand-amber/20 bg-brand-amber/5" },
];

// Timeline Journey items
const timelineJourney = [
  { 
    date: "June 20, 2026", 
    type: "adventure", 
    title: "Completed Coorg Coffee Estate Trek", 
    details: "Hiked 14km through private coffee plantations, forest trails, and locked in the 'Forest Pathfinder' achievement.",
    xp: "+250 XP", 
    meta: "Coorg, Karnataka"
  },
  { 
    date: "June 12, 2026", 
    type: "campfire", 
    title: "Hosted Live Campfire: 'Solo Trekking in Himalayas'", 
    details: "Shared backpacking routes, gear guides, and stories with 98 active listeners.",
    xp: "+150 XP", 
    meta: "89 listeners • 45m duration"
  },
  { 
    date: "June 05, 2026", 
    type: "badge", 
    title: "Unlocked 'Night Owl' Achievement Badge", 
    details: "Successfully joined and participated in 5 live audio campfires starting after midnight.",
    xp: "+100 XP", 
    meta: "Special Trophy"
  },
  { 
    date: "May 28, 2026", 
    type: "adventure", 
    title: "Completed Gokarna Cliff Diving & Beach Camp", 
    details: "Experienced a 25ft cliff jump at half-moon beach, followed by coastal camping and sunset journaling.",
    xp: "+450 XP", 
    meta: "Gokarna, India"
  },
  { 
    date: "May 15, 2026", 
    type: "milestone", 
    title: "Joined Wandercall Network", 
    details: "Initialized explorer digital passport and unlocked Level 1 credentials.",
    xp: "+500 XP Welcome Bonus", 
    meta: "Passport Issued"
  }
];

// Memory collage images/journals
const initialMemories = [
  { 
    id: 1,
    title: "Netrani Scuba Diving", 
    text: "Swam alongside sea turtles and barracudas at 18m depth. Under the ocean, everything is quiet and magic.", 
    tag: "Underwater",
    location: "Netrani Island, Murdeshwar",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
    likes: 124,
    comments: 28,
    views: "1.2k",
    liked: false,
    saved: false
  },
  { 
    id: 2,
    title: "Sunset Over Coorg Hills", 
    text: "After 4 hours of steep climbs under the rain, the clouds parted to reveal this endless sea of green valley.", 
    tag: "Mountain Trek",
    location: "Coorg, Karnataka",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    likes: 98,
    comments: 14,
    views: "890",
    liked: false,
    saved: true
  },
  { 
    id: 3,
    title: "Cozy Camping Gokarna", 
    text: "Fireside stories, cold beer, sound of crashing waves, and sleeping under a canvas roof. Real life is outside.", 
    tag: "Coastal Camp",
    location: "Gokarna, Karnataka",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
    likes: 156,
    comments: 32,
    views: "2.1k",
    liked: false,
    saved: false
  },
  { 
    id: 4,
    title: "Old Bangalore Food Trail", 
    text: "Explored 7 heritage food outlets in Malleshwaram. The ghee roast dose and filter coffee were legendary.", 
    tag: "Culinary Trail",
    location: "Malleshwaram, Bangalore",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    likes: 210,
    comments: 45,
    views: "3.4k",
    liked: false,
    saved: false
  }
];

// Achievements & Badges List
const achievements = [
  { name: "First Adventure", desc: "Completed 1st booking", icon: Map, unlocked: true, date: "May 16, 2026" },
  { name: "Night Owl", desc: "Joined 5 late-night campfires", icon: Radio, unlocked: true, date: "Jun 05, 2026" },
  { name: "Community Leader", desc: "Hosted room with 50+ listeners", icon: Users, unlocked: true, date: "Jun 12, 2026" },
  { name: "Thrill Seeker", desc: "Completed 3 high-intensity quests", icon: Sparkles, unlocked: true, date: "May 28, 2026" },
  { name: "Food Explorer", desc: "Completed 2 culinary journeys", icon: Star, unlocked: false, progress: "1/2" },
  { name: "Adventure Master", desc: "Reach level 15 as an explorer", icon: Shield, unlocked: false, progress: "Lv.12/15" },
];

// Current Quests List
const activeQuests = [
  { title: "Listen to a live campfire", progress: 66, detail: "10 / 15 mins", reward: "+50 XP" },
  { title: "Complete Western Ghats Treks", progress: 50, detail: "1 / 2 treks", reward: "+300 XP • Forest Badge" },
  { title: "Earn XP Points this week", progress: 81, detail: "980 / 1200 XP", reward: "+150 Sparks" },
];

// Upcoming booked events
const upcomingEvents = [
  { 
    title: "Deep Sea Scuba Diving", 
    guide: "Capt. Rohit (PADI Master)", 
    date: "June 28, 2026", 
    location: "Netrani Island, Murdeshwar",
    daysLeft: 4, 
    hoursLeft: 10 
  },
  { 
    title: "Himalayan Base Camp Expedition", 
    guide: "Tenzing Norgay Jr.", 
    date: "July 15, 2026", 
    location: "Sankri, Uttarakhand",
    daysLeft: 21, 
    hoursLeft: 8 
  }
];

// Joined Communities
const communities = [
  { name: "Western Ghats Backpackers", members: "1,240 members", activeRooms: 3 },
  { name: "Scuba & Marine Explorers", members: "890 members", activeRooms: 1 },
  { name: "Himalayan Summits Cohort", members: "450 members", activeRooms: 0 }
];

// Friends & Explorer compatibility list
const friends = [
  { name: "Arjun Mehta", avatar: "A", match: 92, bio: "Summit bagger & dive master. Lives in the water.", mutual: "3 mutual adventures" },
  { name: "Sara Khan", avatar: "S", match: 85, bio: "Photographer & local food hunter. Coffee enthusiast.", mutual: "1 mutual community" },
  { name: "Divya Kapoor", avatar: "D", match: 74, bio: "Backpacking across Asia. Loves campfire storytelling.", mutual: "2 mutual campfires" }
];

// --- FRAMER MOTION TRANSITIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: easeOut }
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const authUserId = useAppSelector((state) => state.auth.userId);
  const { data: userProfile } = useUserProfileQuery(authUserId);

  const activeProfile = {
    name: userProfile?.displayName || profileData.name,
    avatarUrl: userProfile?.avatarUrl,
    bannerUrl: (userProfile as any)?.bannerUrl || (userProfile as any)?.coverUrl || null,
    username: userProfile?.username ? `@${userProfile.username}` : profileData.username,
    location: userProfile?.locationFormatted || "Location pending",
    joined: userProfile?.createdAt ? `Joined ${new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : profileData.joined,
    bio: userProfile?.bio || "No bio added yet.",
    reputation: userProfile?.reputationScore ?? 0,
    level: userProfile?.level ?? 1,
    xp: { current: userProfile?.xpCurrent ?? 1000, next: userProfile?.xpNext ?? 2000 },
    stats: [
      { label: "Adventures Completed", value: userProfile?.adventuresCompleted ?? 0, color: "text-brand-cyan" },
      { label: "Communities Joined", value: userProfile?.communitiesJoined ?? 0, color: "text-brand-purple" },
      { label: "Campfires Hosted", value: userProfile?.campfiresHosted ?? 0, color: "text-brand-amber" },
    ]
  };

  const [activeDnaTab, setActiveDnaTab] = useState<number | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [memoriesList, setMemoriesList] = useState(initialMemories);

  const handleLikeMemory = (id: number) => {
    setMemoriesList(prev => prev.map(item => {
      if (item.id === id) {
        const isLiked = item.liked;
        return {
          ...item,
          liked: !isLiked,
          likes: isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  const handleSaveMemory = (id: number) => {
    setMemoriesList(prev => prev.map(item => {
      if (item.id === id) {
        const isSaved = item.saved;
        if (!isSaved) {
          triggerToast("Memory saved to bookmarks!");
        } else {
          triggerToast("Memory removed from bookmarks!");
        }
        return {
          ...item,
          saved: !isSaved
        };
      }
      return item;
    }));
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleShareProfile = async () => {
    const rawUsername = userProfile?.username || "explorer";
    const cleanUsername = rawUsername.replace(/^@/, '');
    const profileUrl = `${window.location.origin}/profile/${cleanUsername}`;
    const shareData = {
      title: "Wandercall Explorer Passport",
      text: `Check out ${activeProfile.name}'s explorer passport profile on Wandercall!`,
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

  // Radar Chart axis calculations
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-10 overflow-y-visible"
    >
      
      {/* SECTION 1: PROFILE COVER & HERO CARD */}
      <motion.section variants={itemVariants} className="w-full relative flex flex-col">
        {/* Cover Landscape or Stylish Default Pattern Banner */}
        <div className="w-full h-[220px] md:h-[320px] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl group/cover flex items-center justify-center select-none bg-zinc-950">
          {activeProfile.bannerUrl ? (
            <img 
              src={activeProfile.bannerUrl} 
              alt={`${activeProfile.name} Banner`} 
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
              {/* Futuristic SVG Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
              
              {/* Vibrant Ambient Aurora Orbs */}
              <div className="absolute -top-24 left-1/4 w-96 h-96 bg-brand-indigo/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
              <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-cyan/15 rounded-full blur-[80px] pointer-events-none" />

              {/* Stylish Central Explorer Name Display */}
              <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center -mt-6 md:-mt-8">
                <div className="px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-2 shadow-inner">
                  <Sparkles className="h-3 w-3 text-brand-cyan animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 font-mono">Verified Explorer Passport</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-sm uppercase">
                  {activeProfile.name}
                </h2>
              </div>
            </div>
          )}
          
          {/* Subtle overlay gradient at bottom for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30 pointer-events-none" />
          
          {/* Top Right Camera Icon for Cover Edit */}
          <button className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-950/80 border border-white/10 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-md shadow-xl z-20 group" aria-label="Change cover photo">
            <Camera className="h-4 w-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Profile Card Header overlay */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end px-3 md:px-8 -mt-16 md:-mt-20 z-10 gap-6 w-full text-center lg:text-left">
          {/* Avatar & Identifiers */}
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-5 w-full lg:w-auto">
            <div className="h-28 w-28 md:h-36 md:w-36 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-1 border-4 border-zinc-950 shadow-2xl relative group/avatar">
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center text-3xl md:text-4xl font-black text-white overflow-hidden">
                {activeProfile.avatarUrl ? (
                  <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="h-full w-full object-cover" />
                ) : (
                  activeProfile.name ? activeProfile.name.trim().charAt(0).toUpperCase() : "E"
                )}
              </div>
              {/* Bottom Left Camera Icon for Avatar Edit */}
              <button className="absolute bottom-0 left-0 p-2 rounded-full bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-sm shadow-lg z-20 group" aria-label="Change avatar photo">
                <Camera className="h-3 w-3 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{activeProfile.name}</h1>
                <span className="h-5 w-5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[10px] font-bold"><Check className="h-3 w-3" /></span>
              </div>
              <p className="text-sm font-mono text-zinc-400 mt-0.5">{activeProfile.username}</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3 text-xs text-zinc-400 font-semibold">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-cyan" /> {activeProfile.location}</span>
                <span className="h-1 w-1 rounded-full bg-white/10 hidden sm:inline" />
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-brand-purple" /> {activeProfile.joined}</span>
              </div>
            </div>
          </div>

          {/* Social / Profile Actions */}
          <div className="flex items-center justify-center lg:justify-start gap-2.5 w-full lg:w-auto">
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
          </div>
        </div>

        {/* Bio block */}
        <div className="mt-6 px-3 md:px-8 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
          <p className="text-sm md:text-base text-zinc-300 font-medium leading-relaxed">
            {activeProfile.bio}
          </p>
        </div>

        {/* Dynamic counters grid & Explorer Score */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 px-3 md:px-8">
          
          {/* Custom Explorer Score Circular gauge */}
          <div className="col-span-2 md:col-span-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
            {/* SVG mini-gauge */}
            <div className="relative h-16 w-16 flex items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" className="stroke-white/5 stroke-3 fill-transparent" />
                <circle cx="32" cy="32" r="28" className="stroke-brand-cyan stroke-3 fill-transparent transition-all duration-1000" strokeDasharray={175} strokeDashoffset={175 - (175 * activeProfile.reputation) / 1000} strokeLinecap="round" />
              </svg>
              <span className="absolute text-[13px] font-mono font-black text-white">{activeProfile.reputation}</span>
            </div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-2">Reputation Score</p>
            <p className="text-[8px] text-brand-cyan font-bold tracking-wider uppercase mt-0.5">Top 4% Global</p>
          </div>

          {/* Metric Stats Cards */}
          {activeProfile.stats.map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col justify-center text-left shadow-lg">
              <span className={`text-2xl md:text-3xl font-black font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-1">{stat.label}</span>
            </div>
          ))}

        </div>
      </motion.section>

      {/* SECTION 2: ADVENTURE DNA (RADAR CHART) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        
        {/* Radar Visualization Card */}
        <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
          
          <div className="text-left max-w-sm flex-1 self-start sm:self-center">
            <span className="text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
              Adventure DNA
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3">Your Explorer Tendencies</h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-4">
              Our AI mapping compiles your real-life event bookings, communities, and quest reviews to plot your unique adventure personality.
            </p>
            
            {/* Explanatory lists */}
            <div className="flex flex-col gap-1.5">
              {dnaStats.map((stat, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setActiveDnaTab(i)}
                  onMouseLeave={() => setActiveDnaTab(null)}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-bold transition-all text-left w-full cursor-pointer ${
                    activeDnaTab === i 
                      ? "bg-white/5 border-white/10 text-white" 
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0" />
                    {stat.name}
                  </span>
                  <span className="font-mono text-zinc-400">{stat.value}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* SVG Custom Radar Chart */}
          <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="h-full w-full z-10 overflow-visible">
              {/* Draw Hexagon Grid Guides */}
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

              {/* Draw Axis Lines */}
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

              {/* Radar Filled Polygon Shape */}
              <polygon
                points={pointsStr}
                className="fill-brand-purple/20 stroke-brand-purple stroke-[1.5px] transition-all duration-500"
              />

              {/* Axis Label Text and Hover Nodes */}
              {dnaStats.map((stat, i) => {
                const pos = getCoordinates(i, 118); // push labels slightly outside radius
                const nodePos = getCoordinates(i, stat.value); // coordinates for actual point
                const isHovered = activeDnaTab === i;

                return (
                  <g key={i} className="cursor-pointer">
                    {/* Axis node circle */}
                    <circle
                      cx={nodePos.x}
                      cy={nodePos.y}
                      r={isHovered ? 5.5 : 3.5}
                      className={`transition-all duration-200 fill-zinc-950 stroke-2 ${
                        isHovered ? "stroke-brand-cyan r-6" : "stroke-brand-purple"
                      }`}
                      onMouseEnter={() => setActiveDnaTab(i)}
                      onMouseLeave={() => setActiveDnaTab(null)}
                    />
                    {/* Axis name tag text */}
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
            
            {/* Background Glow */}
            <div className="absolute inset-4 rounded-full bg-brand-purple/5 blur-[50px] -z-10" />
          </div>
        </div>

        {/* AI generated Summary block */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex-1 flex flex-col justify-between text-left shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-brand-purple">
                <BrainCircuit className="h-5 w-5" />
                <h3 className="text-xs font-black uppercase tracking-wider">AI Adventure Profile</h3>
              </div>
              <p className="text-xs md:text-sm font-semibold text-zinc-300 leading-relaxed italic">
                "You thrive on social adventures and high-intensity thrills. You are most active during weekend community quests and late-night campfire storytelling sessions, where your compatibility with explorers sharing extreme sport tendencies peaks."
              </p>
            </div>
            
            {/* Trait insight box */}
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl mt-4">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Explorer DNA Focus</span>
              {activeDnaTab !== null ? (
                <div>
                  <span className="text-xs font-black text-brand-cyan block">{dnaStats[activeDnaTab].name} ({dnaStats[activeDnaTab].value}%)</span>
                  <p className="text-[10px] text-zinc-400 font-semibold leading-relaxed mt-0.5">{dnaStats[activeDnaTab].desc}</p>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-black text-zinc-300 block">Hover Axis Nodes</span>
                  <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed mt-0.5">Move mouse over radar points or tags to isolate adventure DNA components.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 3: JOURNEY TIMELINE & SECTION 6: CURRENT QUESTS */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Timeline Path (8 Columns) */}
        <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div className="flex justify-between items-start md:items-center">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Journey</h2>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Your chronological vertical passport trail detailing trips completed, medals unlocked, and milestones.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <button
                onClick={() => setJourneyIndex(prev => Math.max(0, prev - 1))}
                disabled={journeyIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                aria-label="Previous items"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setJourneyIndex(prev => Math.min(Math.ceil(timelineJourney.length / 3) - 1, prev + 1))}
                disabled={journeyIndex >= Math.ceil(timelineJourney.length / 3) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next items"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Timeline Stack */}
          <motion.div 
            key={journeyIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative pl-6 sm:pl-8 border-l border-white/5 space-y-8 mt-4 py-2"
          >
            {timelineJourney.slice(journeyIndex * 3, (journeyIndex + 3)).map((node, i) => {
              // Color selection based on node type
              const isAdventure = node.type === "adventure";
              const isCampfire = node.type === "campfire";
              const isBadge = node.type === "badge";
              const isMilestone = node.type === "milestone";

              const dotColor = isAdventure ? "bg-brand-cyan" : isCampfire ? "bg-brand-purple" : isBadge ? "bg-brand-amber" : "bg-brand-emerald";
              const dotBorder = isAdventure ? "border-brand-cyan/20" : isCampfire ? "border-brand-purple/20" : isBadge ? "border-brand-amber/20" : "border-brand-emerald/20";

              return (
                <div key={i} className="relative group">
                  {/* Timeline point indicator */}
                  <div className={`absolute -left-[30px] sm:-left-[38px] top-1.5 h-4 w-4 sm:h-5 sm:w-5 rounded-full border-4 border-zinc-950 flex items-center justify-center shrink-0 z-10`}>
                    <div className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${dotColor} group-hover:scale-110 transition-transform`} />
                  </div>

                  {/* Card Container */}
                  <div className="bg-white/[0.02] border border-white/5 p-4 sm:p-5 rounded-2xl flex flex-col gap-2 hover:border-white/10 transition-all shadow-md group-hover:translate-x-0.5 duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">{node.date}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${dotColor}/10 ${dotBorder} ${isAdventure ? "text-brand-cyan" : isCampfire ? "text-brand-purple" : isBadge ? "text-brand-amber" : "text-brand-emerald"}`}>
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

        {/* Current Quests Dashboard (4 Columns) */}
        <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 p-6 rounded-3xl shadow-xl flex flex-col gap-6 text-left w-full">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight mb-1">Active Quests</h2>
            <p className="text-xs text-zinc-400 font-medium">Your current gamified daily and weekly adventure milestones.</p>
          </div>

          <div className="flex flex-col gap-4">
            {activeQuests.map((quest, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 transition-all">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-zinc-300 truncate">{quest.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-mono font-bold text-brand-cyan">{quest.detail}</span>
                    <span className="h-1.5 w-px bg-white/10" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-amber">{quest.reward}</span>
                  </div>
                </div>

                {/* Progress Ring widget */}
                <div className="relative h-12 w-12 shrink-0 flex items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle cx="24" cy="24" r="20" className="stroke-white/5 stroke-2 fill-transparent" />
                    <circle cx="24" cy="24" r="20" className="stroke-brand-purple stroke-2 fill-transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * quest.progress) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-black text-white">{quest.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => router.push("/profile/quests#active-quests-timeline")}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            View All Active Quests <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>

      {/* SECTION 4: MEMORY BOOK (MASONRY GRID) */}
      <motion.section variants={itemVariants} className="bg-white/[0.01] border border-white/5 p-4 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Memory Book</h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">Photographs and experience journals locked in your adventure passport.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMemoryIndex(prev => Math.max(0, prev - 1))}
                disabled={memoryIndex === 0}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                aria-label="Previous memories"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMemoryIndex(prev => Math.min(Math.ceil(memoriesList.length / 2) - 1, prev + 1))}
                disabled={memoryIndex >= Math.ceil(memoriesList.length / 2) - 1}
                className="h-8 w-8 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
                aria-label="Next memories"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <button 
              onClick={() => router.push("/feed")}
              className="h-9 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" /> Add Experience
            </button>
          </div>
        </div>

        {/* Paginated grid layout - showing 2 memories at a time with smooth transition */}
        <motion.div 
          key={memoryIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {memoriesList.slice(memoryIndex * 2, (memoryIndex * 2) + 2).map((memory) => (
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
                
                {/* Location */}
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] font-semibold text-zinc-400 border-b border-white/5 pb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-brand-purple" />
                    {memory.location}
                  </span>
                </div>

                {/* Social Actions row */}
                <div className="flex items-center justify-between text-xs text-zinc-400 font-bold mt-1">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button 
                      onClick={() => handleLikeMemory(memory.id)}
                      className={`flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group ${memory.liked ? "text-rose-500" : ""}`}
                    >
                      <Heart className={`h-4 w-4 transition-transform group-hover:scale-110 ${memory.liked ? "fill-rose-500 stroke-rose-500" : ""}`} />
                      <span>{memory.likes}</span>
                    </button>
                    {/* Comment button */}
                    <button 
                      onClick={() => triggerToast(`Comments section coming soon for: ${memory.title}`)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
                    >
                      <MessageSquare className="h-4 w-4 group-hover:scale-110" />
                      <span>{memory.comments}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Views counter */}
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                      <Globe className="h-3.5 w-3.5 text-zinc-600" />
                      {memory.views} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* SECTION 5: BADGES & ACHIEVEMENTS & SECTION 7: UPCOMING EVENTS */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Achievements Trophy Room (8 Columns) */}
        <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 p-4 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Achievements & Badges</h2>
            <p className="text-xs text-zinc-400 font-medium">Your 3D visual trophy room. Medals are unlocked by exploring, review writing, and hosting campfires.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((badge, i) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={i} className={`bg-white/[0.02] border p-5 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group hover:scale-102 transition-all duration-200 min-h-[190px] ${
                  badge.unlocked ? "border-white/5" : "border-white/5 opacity-55"
                }`}>
                  {/* Glowing halo behind unlocked badges */}
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

                  {/* Date or progress metrics */}
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

        {/* Upcoming events / Countdown (4 Columns) */}
        <div className="lg:col-span-4 bg-white/[0.01] border border-white/5 p-4 md:p-8 rounded-3xl shadow-xl flex flex-col gap-6 text-left w-full">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight mb-1">Upcoming Experiences</h2>
            <p className="text-xs text-zinc-400 font-medium">Countdowns for your booked events. Be ready to explore!</p>
          </div>

          <div className="flex flex-col gap-4">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 hover:border-white/10 transition-all group">
                <div className="text-left">
                  <h3 className="text-xs font-black text-white truncate">{event.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{event.guide}</p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>

                {/* Live Countdown widget */}
                <div className="flex items-center gap-2 bg-zinc-950/40 p-2.5 rounded-xl border border-white/5 justify-around mt-1">
                  <div className="text-center">
                    <span className="text-sm font-mono font-black text-brand-cyan">{event.daysLeft}</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Days</span>
                  </div>
                  <span className="text-xs text-zinc-700 font-bold">:</span>
                  <div className="text-center">
                    <span className="text-sm font-mono font-black text-brand-purple">{event.hoursLeft}</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Hours</span>
                  </div>
                  <span className="text-xs text-zinc-700 font-bold">:</span>
                  <div className="text-center">
                    <span className="text-sm font-mono font-black text-brand-amber animate-pulse">15</span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block">Mins</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 8: COMMUNITIES & SECTION 9: FRIENDS (COMPATIBILITY MATCH) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        
        {/* Communities Joined (6 Columns) */}
        <div className="lg:col-span-6 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Communities</h2>
            <p className="text-xs text-zinc-400 font-medium">Adventure subgroups and campfire channels you participate in.</p>
          </div>

          <div className="flex flex-col gap-3">
            {communities.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 hover:translate-x-0.5 duration-200 transition-all cursor-pointer">
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
          </div>
        </div>

        {/* Friends & Match Score (6 Columns) */}
        <div className="lg:col-span-6 bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Explorer Connections</h2>
            <p className="text-xs text-zinc-400 font-medium">Your circle of friends sorted by AI Adventure DNA compatibility scores.</p>
          </div>

          <div className="flex flex-col gap-3">
            {friends.map((friend, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between gap-3 hover:border-white/10 transition-all">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-zinc-950/60 border border-white/10 flex items-center justify-center font-bold text-xs text-brand-purple shrink-0">
                    {friend.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-black text-white truncate">{friend.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{friend.bio}</p>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-1 block">{friend.mutual}</span>
                  </div>
                </div>

                {/* Compatibility Score badge */}
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    <Sparkles className="h-3 w-3 fill-brand-cyan/20" /> {friend.match}% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 10: EXPLORER ANALYTICS (DASHBOARD CHARTS) */}
      <motion.section variants={itemVariants} className="bg-white/[0.01] border border-white/5 p-6 md:p-8 rounded-3xl flex flex-col gap-6 shadow-xl text-left w-full">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-1">Explorer Analytics</h2>
          <p className="text-xs text-zinc-400 font-medium leading-relaxed">Performance logs monitoring your monthly explorer metrics, total distances, and hours logged.</p>
        </div>

        {/* Grid layout containing counter badges & charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Stats details Column (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all">
              <div className="h-10 w-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Hours Explored</span>
                <span className="text-lg font-black text-white font-mono">76 Hrs</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all">
              <div className="h-10 w-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Map className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Distance Traveled</span>
                <span className="text-lg font-black text-white font-mono">1,280 Km</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all">
              <div className="h-10 w-10 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Quest Success Rate</span>
                <span className="text-lg font-black text-white font-mono">94%</span>
              </div>
            </div>

          </div>

          {/* Monthly Bar Chart Column (8 columns) */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-inner flex flex-col justify-between text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Experiences Completed (Jan - Jun)</h3>
              <span className="text-[10px] font-mono text-zinc-500">6 Months Total</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="relative h-44 w-full flex items-end justify-around border-b border-white/5 pb-2">
              
              {/* SVG grids overlay */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none -z-10">
                <div className="border-t border-white/[0.02] w-full" />
                <div className="border-t border-white/[0.02] w-full" />
                <div className="border-t border-white/[0.02] w-full" />
                <div className="border-t border-white/[0.02] w-full" />
              </div>

              {/* Individual Bar plots */}
              {[
                { label: "Jan", val: 1, height: "16%" },
                { label: "Feb", val: 2, height: "33%" },
                { label: "Mar", val: 3, height: "50%" },
                { label: "Apr", val: 5, height: "83%" },
                { label: "May", val: 4, height: "66%" },
                { label: "Jun", val: 6, height: "100%" }
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 group w-12 cursor-pointer">
                  {/* Tooltip on hover */}
                  <span className="text-[9px] font-mono font-bold text-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 block">
                    {bar.val} Exp
                  </span>
                  
                  {/* SVG Bar representation */}
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

    </motion.div>
  );
}
