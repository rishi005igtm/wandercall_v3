"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Flame,
  Target,
  Trophy,
  Compass,
  Users,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  Lock,
  CheckCircle2,
  Brain,
  Share2,
  Image as ImageIcon,
  Star,
  Activity
} from "lucide-react";

// Mock Data
interface ActiveQuest {
  id: string;
  name: string;
  category: "Daily" | "Weekly" | "Monthly" | "Special" | "Community";
  difficulty: "Easy" | "Medium" | "Hard" | "Legendary";
  xp: number;
  reward: string;
  progress: number;
  total: number;
  timeRemaining: string;
  companionsCount: number;
}

interface Region {
  id: string;
  name: string;
  description: string;
  stats: string;
  color: string;
  glowColor: string;
  status: "Unlocked" | "Locked" | "In Progress";
  activeQuestName?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Legendary";
  dateCompleted?: string;
  progress?: number;
  total?: number;
}

interface LadderStep {
  level: number;
  xpRequired: number;
  reward: string;
  perk: string;
  unlocked: boolean;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  avatar: string;
  isSelf?: boolean;
}

interface QuestStory {
  id: string;
  questName: string;
  storyText: string;
  photoUrl: string;
  date: string;
  likes: number;
}

export default function QuestsPage() {
  const [activeQuestTab, setActiveQuestTab] = useState<"Daily" | "Weekly" | "Monthly" | "Special" | "Community">("Daily");
  const [activeRegionId, setActiveRegionId] = useState<string | null>("region-1");
  const [leaderboardTab, setLeaderboardTab] = useState<"Friends" | "Local" | "Global">("Friends");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Mock Data States
  const currentXP = 3240;
  const nextLevelXP = 4000;
  const levelXPPercentage = (currentXP / nextLevelXP) * 100;

  // Calculate tip coordinates of progress arc (radius = 104, center = 120, 120)
  // Starts at -90 degrees (top) and goes clockwise
  const angle = -90 + (levelXPPercentage / 100) * 360;
  const angleRad = (angle * Math.PI) / 180;
  const particleX = 120 + 104 * Math.cos(angleRad);
  const particleY = 120 + 104 * Math.sin(angleRad);

  const activeQuests: ActiveQuest[] = [
    // Dailies
    {
      id: "q-1",
      name: "Search 3 Water Adventures",
      category: "Daily",
      difficulty: "Easy",
      xp: 50,
      reward: "+50 XP • Companion Assist Active",
      progress: 2,
      total: 3,
      timeRemaining: "4h 12m left",
      companionsCount: 8
    },
    {
      id: "q-2",
      name: "Read AI DNA Insights",
      category: "Daily",
      difficulty: "Easy",
      xp: 30,
      reward: "+30 XP",
      progress: 1,
      total: 1,
      timeRemaining: "4h 12m left",
      companionsCount: 0
    },
    {
      id: "q-3",
      name: "Contribute to Campfire Talk",
      category: "Daily",
      difficulty: "Medium",
      xp: 80,
      reward: "+80 XP • Bronze Trophy Progress",
      progress: 0,
      total: 5,
      timeRemaining: "4h 12m left",
      companionsCount: 14
    },
    // Weeklies
    {
      id: "q-4",
      name: "Trek 10 Kilometers Cumulative",
      category: "Weekly",
      difficulty: "Medium",
      xp: 300,
      reward: "+300 XP • Explorer Star",
      progress: 6.5,
      total: 10,
      timeRemaining: "3 days left",
      companionsCount: 35
    },
    {
      id: "q-5",
      name: "Host a Live Campfire voice session",
      category: "Weekly",
      difficulty: "Hard",
      xp: 500,
      reward: "+500 XP • Purple Frame Piece",
      progress: 0,
      total: 1,
      timeRemaining: "3 days left",
      companionsCount: 3
    },
    // Monthlies
    {
      id: "q-6",
      name: "Visit 3 Unlocked Regions",
      category: "Monthly",
      difficulty: "Hard",
      xp: 1000,
      reward: "+1000 XP • Gold Trophy Level Perks",
      progress: 1,
      total: 3,
      timeRemaining: "12 days left",
      companionsCount: 124
    },
    // Specials
    {
      id: "q-7",
      name: "Monsoon Torrent White Rafting",
      category: "Special",
      difficulty: "Legendary",
      xp: 800,
      reward: "+800 XP • Rafting Master Badge",
      progress: 0,
      total: 1,
      timeRemaining: "Ends in 2 days",
      companionsCount: 42
    },
    // Community
    {
      id: "q-8",
      name: "Global Explorers 100k Steps Challenge",
      category: "Community",
      difficulty: "Legendary",
      xp: 2000,
      reward: "+2000 XP • Shared Community Vault Reward",
      progress: 74820,
      total: 100000,
      timeRemaining: "5 days left",
      companionsCount: 1249
    }
  ];

  const regions: Region[] = [
    {
      id: "region-1",
      name: "Adventure Mountain",
      description: "Steep climbs, alpine passes, high-altitude challenges, and peak conquests.",
      stats: "3/8 Quests Completed",
      color: "from-blue-500/20 to-indigo-500/20 border-indigo-500/30",
      glowColor: "rgba(99, 102, 241, 0.2)",
      status: "In Progress",
      activeQuestName: "Netrani Scuba Ascent"
    },
    {
      id: "region-2",
      name: "Food Valley",
      description: "Heritage trails, local culinary meetups, secret recipes, and street crawls.",
      stats: "2/5 Quests Completed",
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
      glowColor: "rgba(245, 158, 11, 0.2)",
      status: "Unlocked",
      activeQuestName: "Old Bangalore Food Crawl"
    },
    {
      id: "region-3",
      name: "Creator District",
      description: "Photography workshops, memory story writing, and guide journal creation.",
      stats: "0/6 Quests Completed",
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      glowColor: "rgba(139, 92, 246, 0.2)",
      status: "Unlocked"
    },
    {
      id: "region-4",
      name: "Explorer Desert",
      description: "Dry terrains, endurance cycling routes, map mapping, and solo camps.",
      stats: "0/10 Quests Completed",
      color: "from-zinc-800/40 to-zinc-900/40 border-zinc-700/30",
      glowColor: "rgba(255, 255, 255, 0.05)",
      status: "Locked"
    },
    {
      id: "region-5",
      name: "Community Forest",
      description: "Shared cohort challenges, volunteer cleanups, and companion quests.",
      stats: "5/12 Quests Completed",
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
      glowColor: "rgba(16, 185, 129, 0.2)",
      status: "Unlocked",
      activeQuestName: "Global Explorers 100k Challenge"
    },
    {
      id: "region-6",
      name: "Storytelling Camp",
      description: "Stream live Campfires, share voice insights, and craft adventure guides.",
      stats: "1/4 Quests Completed",
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
      glowColor: "rgba(6, 182, 212, 0.2)",
      status: "Unlocked"
    }
  ];

  const achievements: Achievement[] = [
    { id: "a-1", name: "Peak Conqueror", description: "Reach the peak of 3 different mountains", tier: "Platinum", progress: 2, total: 3 },
    { id: "a-2", name: "First Descent", description: "Log your first deep-sea dive", tier: "Gold", dateCompleted: "June 20, 2026" },
    { id: "a-3", name: "Campfire Veteran", description: "Host voice rooms for a cumulative 10 hours", tier: "Legendary", progress: 6.8, total: 10 },
    { id: "a-4", name: "Spaghetti Master", description: "Participate in 5 local culinary trails", tier: "Silver", dateCompleted: "May 14, 2026" },
    { id: "a-5", name: "Wandercall Spirit", description: "Maintain a 30-day activity streak", tier: "Bronze", progress: 14, total: 30 }
  ];

  const ladderSteps: LadderStep[] = [
    { level: 11, xpRequired: 3000, reward: "Bronze Badge Tier Upgrade", perk: "Ability to request host certifications", unlocked: true },
    { level: 12, xpRequired: 4000, reward: "Explorer Title Access", perk: "Choose personal Explorer subclass title", unlocked: true },
    { level: 13, xpRequired: 5000, reward: "Creator Canvas Tool", perk: "Embed HTML media logs in memories", unlocked: false },
    { level: 14, xpRequired: 6500, reward: "Community Moderation Node", perk: "Flag/Report campfires directly to Admin", unlocked: false },
    { level: 15, xpRequired: 8000, reward: "Premium Group Creator Access", perk: "Create custom cohort groups and schedules", unlocked: false },
    { level: 20, xpRequired: 15000, reward: "Verified Golden Explorer Ribbon", perk: "Get golden verification checkmark on profile", unlocked: false }
  ];

  const leaderboardUsers: LeaderboardUser[] = [
    { rank: 1, name: "Sara Khan", level: 15, xp: 9480, streak: 42, avatar: "S" },
    { rank: 2, name: "Arjun Mehta", level: 14, xp: 7210, streak: 28, avatar: "A" },
    { rank: 3, name: "Divya Kapoor", level: 13, xp: 5120, streak: 19, avatar: "D" },
    { rank: 4, name: "Rishiraj", level: 12, xp: 3240, streak: 14, avatar: "R", isSelf: true },
    { rank: 5, name: "Milind Soman", level: 11, xp: 2950, streak: 8, avatar: "M" },
    { rank: 6, name: "Ananya Rao", level: 10, xp: 1800, streak: 5, avatar: "A" }
  ];

  const questStories: QuestStory[] = [
    {
      id: "story-1",
      questName: "Gokarna Cliff Trek",
      storyText: "Watched the sunrise from the cliffs and set up the camping site next to the beach. Highly recommend starting by 6:00 AM to beat the sun!",
      photoUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=400&auto=format&fit=crop",
      date: "Logged 2 days ago",
      likes: 24
    },
    {
      id: "story-2",
      questName: "Old Bangalore Heritage Food Crawl",
      storyText: "Skipped lunch and ate 6 varieties of masala dosa and filter coffee in Malleshwaram. Met 4 amazing explorers!",
      photoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop",
      date: "Logged 1 week ago",
      likes: 42
    }
  ];

  // Activity Heatmap generator (GitHub style matrix)
  // Rows represent days of the week, cols represent weeks
  const generateActivityCells = () => {
    const days = 7;
    const weeks = 14;
    const cells = [];
    // Random activity levels for rendering
    const activityLevels = [0, 0, 1, 0, 2, 3, 0, 1, 2, 0, 0, 3, 4, 1, 2, 0, 1, 0, 2, 3, 0, 4, 1, 0, 2, 0, 1, 3, 2, 0, 4, 1, 0, 3, 2, 1, 0, 0, 2, 4, 0, 1, 0, 0, 2, 3, 1, 2, 0, 4, 0, 2, 1, 0, 1, 3, 2, 0, 4, 1, 0, 2, 3, 0, 0, 1, 2, 0, 3, 4, 1, 0, 2, 0, 1, 3, 2, 0, 4, 1, 0, 2, 3, 0, 1, 0, 2, 3, 0, 4, 1, 0, 2, 0, 1, 3, 2, 0];

    let index = 0;
    for (let c = 0; c < weeks; c++) {
      const weekCells = [];
      for (let r = 0; r < days; r++) {
        const level = activityLevels[index % activityLevels.length];
        weekCells.push({ level, date: `Day ${index + 1}` });
        index++;
      }
      cells.push(weekCells);
    }
    return cells;
  };

  const activityHeatmap = generateActivityCells();

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-6 overflow-y-visible relative text-white">

      {/* 1. PROGRESS HUB & HERO CENTERPIECE (XP ORBIT) */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center gap-6 w-full text-center relative overflow-hidden shadow-xl shrink-0">

        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-brand-cyan/5 blur-3xl pointer-events-none" />

        {/* Hero header info */}
        <div className="flex flex-col md:flex-row items-stretch justify-between w-full border-b border-white/5 pb-4 gap-4 z-10">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full">
              Quest Command Center
            </span>
            <h1 className="text-2xl font-black mt-2 text-white uppercase tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-brand-cyan" /> Adventure Level Up
            </h1>
          </div>

          <div className="flex items-center gap-4 justify-around md:justify-end bg-zinc-950/40 border border-white/5 p-3 rounded-2xl font-mono">
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Quest Streak</span>
              <span className="text-sm font-black text-brand-amber flex items-center justify-center gap-1 mt-0.5">
                <Flame className="h-4 w-4 fill-brand-amber text-brand-amber" /> 14 Days
              </span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Adventure Score</span>
              <span className="text-sm font-black text-brand-cyan mt-0.5">8,420 pts</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex flex-col text-center px-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Current Rank</span>
              <span className="text-sm font-black text-brand-purple mt-0.5">Silver III</span>
            </div>
          </div>
        </div>

        {/* THE XP ORBIT CENTERPIECE */}
        <div className="flex flex-col items-center justify-center py-6 relative z-10 w-full max-w-xs mx-auto">
          <div className="relative h-60 w-60 flex items-center justify-center">

            {/* Svg circles for progression */}
            <svg viewBox="0 0 240 240" className="absolute top-0 left-0 w-full h-full">
              <g transform="rotate(-90 120 120)">
                {/* Outer Orbit Path */}
                <circle
                  cx="120"
                  cy="120"
                  r="104"
                  className="stroke-white/5 fill-none"
                  strokeWidth="10"
                />

                {/* Animated Progress Ring */}
                <motion.circle
                  cx="120"
                  cy="120"
                  r="104"
                  className="stroke-brand-cyan fill-none"
                  strokeWidth="10"
                  strokeDasharray="653"
                  initial={{ strokeDashoffset: 653 }}
                  animate={{ strokeDashoffset: 653 - (653 * levelXPPercentage) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />

                {/* Inner glowing layer */}
                <circle
                  cx="120"
                  cy="120"
                  r="90"
                  className="stroke-brand-purple/10 fill-none"
                  strokeWidth="2"
                />
              </g>

              {/* Glowing particle at the progress tip */}
              <g transform={`translate(${particleX}, ${particleY})`}>
                <circle cx="0" cy="0" r="8" className="fill-brand-cyan/30 animate-ping" />
                <circle
                  cx="0"
                  cy="0"
                  r="4.5"
                  className="fill-brand-cyan stroke-zinc-950"
                  strokeWidth={1.5}
                  style={{ filter: "drop-shadow(0 0 4px rgba(6, 182, 212, 0.8))" }}
                />
              </g>
            </svg>

            {/* Inner Content Block */}
            <div className="flex flex-col items-center justify-center text-center p-6 bg-zinc-950/70 border border-white/5 rounded-full h-44 w-44 shadow-2xl backdrop-blur-md">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Explorer</span>
              <span className="text-4xl font-extrabold text-white font-mono leading-none my-1">LVL 12</span>
              <span className="text-[11px] font-black text-brand-cyan tracking-wider font-mono mt-0.5">
                {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
              </span>
              <div className="h-px bg-white/5 w-24 my-2" />
              <span className="text-[8px] font-bold text-zinc-400">
                {nextLevelXP - currentXP} XP to Level 13
              </span>
            </div>
          </div>

          <button
            onClick={() => triggerToast("Redeeming Level 12 Perks... VIP avatar unlocked!")}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-black uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="h-4 w-4 text-brand-amber fill-brand-amber/20" />
            <span>Redeem Rewards</span>
          </button>
        </div>
      </section>

      {/* 2. ACTIVITY STREAK HEATMAP */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-brand-amber" /> Quest Streak Roadmap
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Log coordinates, complete experiences, and maintain your adventure streak.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 w-full">
          {/* Calendar Heatmap */}
          <div className="flex-1 overflow-x-auto no-scrollbar py-2 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2 self-start mb-1 text-[8.5px] font-mono text-zinc-500">
              <span>Mon</span>
              <div className="h-px bg-white/5 flex-1 w-6" />
              <span>Wed</span>
              <div className="h-px bg-white/5 flex-1 w-6" />
              <span>Fri</span>
              <div className="h-px bg-white/5 flex-1 w-6" />
              <span className="ml-auto text-zinc-600">Last 14 Weeks activity</span>
            </div>

            <div className="flex gap-1.5 min-w-[340px]">
              {activityHeatmap.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((cell, cIdx) => {
                    const bgColors = [
                      "rgba(255,255,255,0.02)", // Level 0
                      "rgba(6,182,212,0.15)",   // Level 1
                      "rgba(6,182,212,0.35)",   // Level 2
                      "rgba(139,92,246,0.6)",    // Level 3
                      "#8b5cf6"                  // Level 4
                    ];
                    const borderColors = [
                      "rgba(255,255,255,0.05)",
                      "rgba(6,182,212,0.2)",
                      "rgba(6,182,212,0.4)",
                      "rgba(139,92,246,0.4)",
                      "rgba(255,255,255,0.2)"
                    ];
                    return (
                      <div
                        key={cIdx}
                        style={{
                          backgroundColor: bgColors[cell.level],
                          borderColor: borderColors[cell.level],
                          width: "12px",
                          height: "12px",
                          borderRadius: "3px",
                          borderWidth: "1px"
                        }}
                        className="transition-colors hover:scale-115"
                        title={`Activity level: ${cell.level}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2 text-[8px] font-mono text-zinc-500 justify-end">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded bg-white/5 border border-white/5" />
              <div className="w-2.5 h-2.5 rounded bg-brand-cyan/20 border border-brand-cyan/30" />
              <div className="w-2.5 h-2.5 rounded bg-brand-cyan/40 border border-brand-cyan/50" />
              <div className="w-2.5 h-2.5 rounded bg-brand-purple/60 border border-brand-purple/70" />
              <div className="w-2.5 h-2.5 rounded bg-brand-purple border border-white/20" />
              <span>More</span>
            </div>
          </div>

          {/* Activity Metrics Stats side card */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-[280px] shrink-0 font-mono">
            <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center text-center">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Current Streak</span>
              <span className="text-xl font-black text-brand-amber mt-1 flex items-center justify-center gap-1">
                <Flame className="h-4.5 w-4.5 fill-brand-amber text-brand-amber" /> 14 Days
              </span>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center text-center">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Longest Streak</span>
              <span className="text-xl font-black text-white mt-1">32 Days</span>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center text-center">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Weekly Quests</span>
              <span className="text-xl font-black text-brand-cyan mt-1">4 Completed</span>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-3 rounded-2xl flex flex-col justify-center text-center">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Monthly Progress</span>
              <span className="text-xl font-black text-brand-purple mt-1">82% Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE QUESTS ROADMAP */}
      <section id="active-quests-timeline" className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-brand-purple" /> Active Quests Timeline
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Keep tracking daily and weekly challenges to maximize seasonal XP points.
            </p>
          </div>

          {/* Quest Timeline switchers */}
          <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
            {["Daily", "Weekly", "Monthly", "Special", "Community"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveQuestTab(tab as any)}
                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${activeQuestTab === tab
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30"
                  : "bg-transparent border border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {activeQuests
            .filter((q) => q.category === activeQuestTab)
            .map((q) => {
              const percentage = (q.progress / q.total) * 100;
              const isCompleted = q.progress === q.total;

              return (
                <div
                  key={q.id}
                  className="bg-zinc-950/40 border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between text-left hover:border-white/10 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${q.difficulty === "Easy"
                        ? "bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald"
                        : q.difficulty === "Medium"
                          ? "bg-brand-amber/10 border-brand-amber/20 text-brand-amber"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                        }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[7.5px] font-mono text-zinc-500 font-bold">{q.timeRemaining}</span>
                    </div>

                    <h4 className="text-[10.5px] font-black text-white uppercase tracking-wider line-clamp-1">
                      {q.name}
                    </h4>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-4">
                    {/* Progress Slider */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
                        <span>Progress</span>
                        <span>
                          {q.progress.toLocaleString()} / {q.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Quest Companions block */}
                    {q.companionsCount > 0 && (
                      <div className="flex items-center gap-1.5 text-[7.5px] font-mono text-zinc-500">
                        <Users className="h-3 w-3 text-zinc-600 shrink-0" />
                        <span>{q.companionsCount} companions doing this quest now.</span>
                      </div>
                    )}

                    {/* Bottom CTA & Reward Info */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-widest">Reward value</span>
                        <span className="text-[8px] font-black text-brand-amber font-mono truncate max-w-[120px]">{q.reward}</span>
                      </div>

                      {isCompleted ? (
                        <div className="h-7 px-3 rounded-lg border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-1 select-none">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerToast(`Quest progress updated for: ${q.name}`)}
                          className="h-7 px-3.5 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-[8px] font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-all cursor-pointer"
                        >
                          Check Coordinates
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* 5. QUEST MAP REGIONS */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-brand-cyan animate-spin-slow" /> Quest Regions Map
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Tap a region card to inspect available explorations, completed counts, and locked sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {regions.map((region) => {
            const isActive = activeRegionId === region.id;
            const isLocked = region.status === "Locked";

            return (
              <div
                key={region.id}
                onClick={() => {
                  if (!isLocked) {
                    setActiveRegionId(region.id);
                  } else {
                    triggerToast("This region requires Explorer Level 15 to unlock!");
                  }
                }}
                style={{
                  boxShadow: isActive ? `0 0 20px -5px ${region.glowColor}` : "none"
                }}
                className={`border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group ${isLocked
                  ? "bg-zinc-950/20 border-white/5 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-br border-white/5 hover:border-white/10 cursor-pointer hover:-translate-y-0.5 " + region.color
                  } ${isActive ? "border-brand-cyan/20" : ""}`}
              >
                {/* Background glow effects for active */}
                {isActive && (
                  <div className="absolute -right-10 -bottom-10 h-24 w-24 rounded-full bg-brand-cyan/15 blur-2xl pointer-events-none" />
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{region.stats}</span>
                    <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${region.status === "Locked"
                      ? "bg-zinc-800 text-zinc-500"
                      : region.status === "In Progress"
                        ? "bg-brand-purple/20 text-brand-purple border border-brand-purple/20"
                        : "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20"
                      }`}>
                      {region.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white uppercase tracking-wider group-hover:text-brand-cyan transition-colors">
                    {region.name}
                  </h4>

                  <p className="text-[9.5px] text-zinc-400 font-semibold leading-relaxed mt-1">
                    {region.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-2.5 border-t border-white/5">
                  {isLocked ? (
                    <span className="text-[8px] font-black text-zinc-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> SECTOR LOCKED (LVL 15)
                    </span>
                  ) : region.activeQuestName ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[6.5px] font-mono text-zinc-500 uppercase tracking-wider">Active Region Quest</span>
                        <span className="text-[8.5px] font-black text-zinc-300 truncate">{region.activeQuestName}</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                  ) : (
                    <span className="text-[8px] font-black text-zinc-500 tracking-wider">NO ACTIVE QUESTS CURRENTLY</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. ACHIEVEMENTS TROPHY SHELF */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-brand-amber animate-pulse" /> Achievements Wall
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Collect special tokens and experience milestones across all adventure regions.
          </p>
        </div>

        {/* Horizontal Trophy Shelf Row */}
        <div className="w-full overflow-x-auto no-scrollbar py-2 flex gap-4 snap-x">
          {achievements.map((ach) => {
            const isCompleted = !!ach.dateCompleted;
            const progressPercentage = ach.progress && ach.total ? (ach.progress / ach.total) * 100 : 100;

            const tierColors = {
              Platinum: "from-blue-400/20 to-slate-200/20 border-blue-400/30 text-blue-300",
              Gold: "from-yellow-500/20 to-amber-500/20 border-amber-500/30 text-amber-300",
              Legendary: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 animate-pulse",
              Silver: "from-slate-400/20 to-zinc-400/20 border-zinc-400/30 text-zinc-300",
              Bronze: "from-orange-500/10 to-amber-800/10 border-amber-700/30 text-amber-600"
            }[ach.tier];

            return (
              <div
                key={ach.id}
                className={`bg-zinc-950/40 border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between min-w-[200px] max-w-[200px] snap-align-start shrink-0 relative overflow-hidden`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-gradient-to-r border ${tierColors}`}>
                      {ach.tier}
                    </span>
                    {isCompleted && <CheckCircle2 className="h-4 w-4 text-brand-emerald" />}
                  </div>

                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider leading-tight mt-1 truncate">
                    {ach.name}
                  </h4>

                  <p className="text-[8.5px] text-zinc-500 font-semibold leading-relaxed mt-0.5">
                    {ach.description}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 mt-4 pt-2 border-t border-white/5">
                  {isCompleted ? (
                    <span className="text-[7.5px] font-mono text-zinc-500 font-bold uppercase">{ach.dateCompleted}</span>
                  ) : (
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500">
                        <span>Progress</span>
                        <span>{ach.progress}/{ach.total}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                        <div
                          className="h-full bg-brand-cyan rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. XP PROGRESSION LADDER & LEADERBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full shrink-0">

        {/* Ladder Map */}
        <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-brand-purple" /> XP Progression Ladder
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Unlock special community features and golden verification ribbons as you level up.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl overflow-y-auto max-h-[360px] no-scrollbar">
            {ladderSteps.map((step) => (
              <div
                key={step.level}
                className={`flex items-center gap-3.5 p-2 rounded-xl transition-all duration-300 ${step.level === 12
                  ? "bg-brand-cyan/10 border border-brand-cyan/20"
                  : "bg-white/[0.01] border border-transparent hover:border-white/5"
                  }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-black shrink-0 ${step.unlocked
                  ? "bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan"
                  : "bg-zinc-900 border border-white/5 text-zinc-500"
                  }`}>
                  L{step.level}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${step.unlocked ? "text-zinc-200" : "text-zinc-500"
                      }`}>
                      {step.reward}
                    </span>
                    <span className="text-[7.5px] font-mono text-zinc-500 shrink-0">{step.xpRequired.toLocaleString()} XP</span>
                  </div>
                  <p className="text-[8.5px] text-zinc-400 font-semibold truncate mt-0.5">
                    Perk: {step.perk}
                  </p>
                </div>

                <div className="shrink-0">
                  {step.unlocked ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-brand-cyan" />
                  ) : (
                    <Lock className="h-4 w-4 text-zinc-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Leaderboard panel */}
        <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-cyan" /> Explorer Leaderboard
              </h2>
              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
                Compare your monthly progress with other active explorers in the network.
              </p>
            </div>

            {/* Sub switchers */}
            <div className="flex bg-zinc-950/60 p-0.5 rounded-lg border border-white/5 shrink-0 font-mono">
              {["Friends", "Local", "Global"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderboardTab(tab as any)}
                  className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${leaderboardTab === tab ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl max-h-[360px] overflow-y-auto no-scrollbar">
            {leaderboardUsers.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-3.5 p-2 rounded-xl transition-all duration-300 ${user.isSelf
                  ? "bg-brand-purple/10 border border-brand-purple/20"
                  : "bg-white/[0.01] border border-transparent hover:border-white/5"
                  }`}
              >
                {/* Rank number badge */}
                <div className="w-5 font-mono text-[10px] font-black text-center text-zinc-500 shrink-0">
                  #{user.rank}
                </div>

                {/* Profile Image */}
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center font-black text-[9px] text-white shrink-0 border border-white/10 shadow-md">
                  {user.avatar}
                </div>

                <div className="flex-1 min-w-0 text-left flex items-center justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider truncate ${user.isSelf ? "text-brand-purple" : "text-zinc-200"
                      }`}>
                      {user.name} {user.isSelf && "• YOU"}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-zinc-500">
                      LVL {user.level} • {user.streak} Days streak
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-zinc-300 shrink-0">
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 8. QUEST STORIES & MEMORY LOGS */}
      <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-brand-purple" /> Quest Stories & Memories
          </h2>
          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
            Verifiable logs and highlights created by explorers upon completing specific path milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {questStories.map((story) => (
            <div
              key={story.id}
              className="bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-white/10 transition-colors duration-300 h-fit sm:h-[140px] shrink-0"
            >
              {/* Image side */}
              <div className="w-full sm:w-[120px] h-[120px] sm:h-full relative overflow-hidden shrink-0">
                <img
                  src={story.photoUrl}
                  alt={story.questName}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent z-10" />
              </div>

              {/* Story Details side */}
              <div className="p-3.5 flex flex-col justify-between flex-1 min-w-0 text-left">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[7.5px] font-mono text-zinc-500 font-bold uppercase">{story.date}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-brand-cyan bg-brand-cyan/15 border border-brand-cyan/30 px-1.5 py-0.5 rounded-md">
                      VERIFIED LOG
                    </span>
                  </div>
                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider mt-1 truncate">
                    {story.questName}
                  </h4>
                  <p className="text-[9.5px] text-zinc-400 font-semibold leading-relaxed mt-1 line-clamp-2">
                    "{story.storyText}"
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 text-[8px] font-mono text-zinc-500">
                    <Star className="h-3 w-3 fill-brand-amber text-brand-amber shrink-0" />
                    <span>{story.likes} Explorers liked this</span>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:3000/profile/feed`);
                      triggerToast("Experience shared!");
                    }}
                    className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Share story logs"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. AI QUEST RECOMMENDATIONS & ADVENTURE SEASONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full shrink-0">

        {/* AI recommendations side */}
        <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col justify-between gap-4 text-left shadow-md w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-brand-cyan animate-pulse" /> AI Quest Recommendations
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Dynamically generated suggestions matching your active Explorer DNA and cohort interactions.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-zinc-950/40 border border-white/5 p-3.5 rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Recommended for Explorer type</span>
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider mt-0.5">Sunset Kayaking & Bioluminescence</h4>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-1 leading-relaxed">
                  You enjoy night photography and water-based quests. Completing this unlocks the *Coastal Spirit* title.
                </p>
              </div>
            </div>

            <div className="h-px bg-white/5 w-full my-1.5" />

            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-lg bg-brand-purple/15 border border-brand-purple/30 text-brand-purple flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Great for Socializers</span>
                <h4 className="text-[10px] font-black text-white uppercase tracking-wider mt-0.5">Western Ghats Off-Road Expedition</h4>
                <p className="text-[9.5px] text-zinc-400 font-semibold mt-1 leading-relaxed">
                  3 of your friends are currently attempting this region checkpoint. Join their team to get a +15% XP companion multiplier.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerToast("Generating new AI recommendations from Adventure DNA...")}
            className="w-full h-9 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2"
          >
            <Brain className="h-3.5 w-3.5" />
            <span>Regenerate Recommendations</span>
          </button>
        </section>

        {/* Adventure Season Tracker side */}
        <section className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl flex flex-col justify-between gap-4 text-left shadow-md w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-brand-amber" /> Summer Explorer Season
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium mt-0.5">
              Exclusive seasonal pass. Maximize points before the season closes.
            </p>
          </div>

          <div className="flex flex-col bg-zinc-950/40 border border-white/5 p-3.5 rounded-2xl gap-3">
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] font-black text-zinc-200">PASS PROGRESS: LEVEL 24</span>
              <span className="text-[8.5px] font-mono text-zinc-500">12 Days Remaining</span>
            </div>

            <div className="flex flex-col gap-1 w-full">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-amber to-orange-500 rounded-full w-[68%]" />
              </div>
              <div className="flex justify-between text-[7px] font-mono text-zinc-600">
                <span>Unlock: Custom Avatar Frame</span>
                <span>Next: Legendary Title Token</span>
              </div>
            </div>

            <div className="flex justify-around items-center bg-white/[0.01] border border-white/5 p-2 rounded-xl mt-1">
              <div className="flex flex-col text-center">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">Completed</span>
                <span className="text-[10px] font-black text-brand-amber font-mono mt-0.5">18 / 25 Challenges</span>
              </div>
              <div className="h-6 w-px bg-white/5" />
              <div className="flex flex-col text-center">
                <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-wider">Pass Status</span>
                <span className="text-[10px] font-black text-brand-emerald font-mono mt-0.5">Premium Unlocked</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => triggerToast("Navigating to Seasonal Pass rewards shelf...")}
            className="w-full h-9 rounded-xl bg-gradient-to-r from-brand-amber to-orange-500 text-[9px] font-black uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 mt-2 shadow-md"
          >
            <Trophy className="h-3.5 w-3.5 fill-white text-white" />
            <span>Claim Season Pass Rewards</span>
          </button>
        </section>
      </div>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-zinc-900/95 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Sparkles className="h-3.5 w-3.5" />
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
