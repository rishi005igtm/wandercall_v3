"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  Clock,
  Star,
  Award,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Camera,
  Plus,
  Sparkles,
  Check,
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Map as MapIcon,
  Globe,
  Users,
  Lock,
  CloudSun,
  Smile,
  Zap,
  Volume2,
  FolderHeart,
  Search,
  Sparkle,
  TrendingUp,
  X,
  UserPlus
} from "lucide-react";

// Interfaces
interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

interface Memory {
  id: string;
  title: string;
  storyText: string;
  date: string;
  location: string;
  weather: string;
  mood: string;
  experienceType: string;
  privacy: "Public" | "Friends" | "Private" | "Community";
  images: string[];
  people: string[];
  likes: number;
  commentsCount: number;
  comments: Comment[];
  hasLiked?: boolean;
  hasSaved?: boolean;
  reaction?: string; // Wandercall reaction: Inspired, Want to Try, Amazing, Saved, Loved This
}

// Initial Mock Memories Data
const initialMemories: Memory[] = [
  {
    id: "mem-1",
    title: "Trekking Coffee Trails under Monsoon Rains",
    storyText: "Monsoon in Coorg is special. The mist rolled over the green slopes of the coffee plantations. We hiked 14km through steep muddy loops, listening to the rain fall on the canopy. Spending the evening drinking hot cardamon-infused filter coffee in a local family homestay was pure warmth. One of those days where the journey itself changes you.",
    date: "June 20, 2026",
    location: "Coorg, Karnataka",
    weather: "Rainy • 22°C",
    mood: "Peaceful 🌧️",
    experienceType: "Mountain Trek",
    privacy: "Public",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop"
    ],
    people: ["Arjun Mehta", "Sara Khan"],
    likes: 48,
    commentsCount: 3,
    comments: [
      { id: "c1", user: "Sara Khan", avatar: "S", text: "I can still taste that cardamom coffee! Best weekend ever.", time: "2d ago" },
      { id: "c2", user: "Arjun Mehta", avatar: "A", text: "Those muddy slips were totally worth the view at the summit.", time: "1d ago" }
    ],
    hasLiked: true,
    hasSaved: true,
    reaction: "Loved This"
  },
  {
    id: "mem-2",
    title: "Netrani Scuba Dive with Green Sea Turtles",
    storyText: "Descending 18 meters into the quiet blue waters off Netrani Island. The underwater noise fades into pure breathing rhythms. Swam alongside a green sea turtle for what felt like hours as it drifted near the coral reef walls. The clarity of the ocean and the sun filtering down like golden rays created an unforgettable adventure museum moment.",
    date: "May 28, 2026",
    location: "Netrani Island, Murdeshwar",
    weather: "Sunny • 30°C",
    mood: "Amazed 🐢",
    experienceType: "Scuba Diving",
    privacy: "Friends",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop"
    ],
    people: ["Capt. Rohit"],
    likes: 72,
    commentsCount: 1,
    comments: [],
    hasLiked: false,
    hasSaved: true,
    reaction: "Inspired"
  },
  {
    id: "mem-3",
    title: "Sunset Drum Circle & Beach Camping",
    storyText: "As the sun touched the horizon of the Arabian Sea, everyone gathered on Paradise Beach with hand drums and acoustic guitars. We sat around the crackling bonfire exchanging stories till early morning. Camping directly on the sand with only the waves as our background score was the perfect antidote to city life.",
    date: "May 12, 2026",
    location: "Gokarna, India",
    weather: "Warm Breeze • 28°C",
    mood: "Nostalgic 🔥",
    experienceType: "Coastal Camp",
    privacy: "Community",
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    people: ["Divya Kapoor", "Aman Sen"],
    likes: 95,
    commentsCount: 4,
    comments: [],
    hasLiked: false,
    hasSaved: false,
    reaction: "Want To Try"
  },
  {
    id: "mem-4",
    title: "Old Bangalore Heritage Food Crawl",
    storyText: "Explored 7 secret heritage culinary outlets in Malleshwaram. The crisp butter-roasted dosa and traditional filter coffee from CTR left us speechless. Discovering the historic recipes and spices of early Bangalore with fellow foodie travelers made for the ultimate learning adventure loop.",
    date: "April 18, 2026",
    location: "Malleshwaram, Bangalore",
    weather: "Pleasant • 26°C",
    mood: "Happy ☕",
    experienceType: "Culinary Trail",
    privacy: "Private",
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop"
    ],
    people: ["Rohan Roy"],
    likes: 24,
    commentsCount: 0,
    comments: [],
    hasLiked: false,
    hasSaved: false,
    reaction: "Amazing"
  }
];

// Mock Collections
const initialCollections = [
  { id: "col-1", name: "Travel Adventures", count: 12, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=300", updated: "2 days ago" },
  { id: "col-2", name: "Mountain Treks", count: 8, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300", updated: "1 week ago" },
  { id: "col-3", name: "Food Experiences", count: 4, image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300", updated: "2 months ago" },
  { id: "col-4", name: "Coastal Camps", count: 5, image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=300", updated: "3 weeks ago" }
];

// Display Modes
type DisplayMode = "Timeline" | "Gallery" | "Map" | "Journal" | "Experience" | "Calendar";

export default function ExplorerMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>(initialMemories);
  const [activeView, setActiveView] = useState<DisplayMode>("Timeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState("All");
  
  // Creator states
  const [creatorTitle, setCreatorTitle] = useState("");
  const [creatorStoryText, setCreatorStoryText] = useState("");
  const [creatorLocation, setCreatorLocation] = useState("");
  const [creatorPrivacy, setCreatorPrivacy] = useState<"Public" | "Friends" | "Private" | "Community">("Public");
  const [creatorMood, setCreatorMood] = useState("Excited 🚀");
  const [creatorWeather, setCreatorWeather] = useState("Sunny ☀️");
  const [creatorTags, setCreatorTags] = useState<string[]>(["Mountain Trek"]);
  const [creatorImage, setCreatorImage] = useState<string | null>(null);

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState<string | null>(null);

  // Interactivity states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [selectedMapPin, setSelectedMapPin] = useState<string | null>(null);
  const [selectedMemoryDetail, setSelectedMemoryDetail] = useState<Memory | null>(null);

  // Filters Options
  const tagFilters = ["All", "Mountain Trek", "Scuba Diving", "Coastal Camp", "Culinary Trail", "Public", "Friends", "Private"];

  // Toggle Like/Inspire
  const handleLike = (id: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        const hasLiked = !m.hasLiked;
        return {
          ...m,
          hasLiked,
          likes: hasLiked ? m.likes + 1 : m.likes - 1
        };
      }
      return m;
    }));
  };

  // Toggle Wishlist Save
  const handleSave = (id: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        const hasSaved = !m.hasSaved;
        if (hasSaved) {
          triggerToast("Added to memories collection wishlists!");
        }
        return { ...m, hasSaved };
      }
      return m;
    }));
  };

  // Trigger Toast Notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Memories computation
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      // Search text match
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        m.title.toLowerCase().includes(query) ||
        m.storyText.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.experienceType.toLowerCase().includes(query) ||
        m.people.some(p => p.toLowerCase().includes(query));

      // Filter tag match
      if (activeTagFilter === "All") return matchesSearch;
      if (activeTagFilter === "Public" || activeTagFilter === "Friends" || activeTagFilter === "Private") {
        return matchesSearch && m.privacy === activeTagFilter;
      }
      return matchesSearch && m.experienceType === activeTagFilter;
    });
  }, [memories, searchQuery, activeTagFilter]);

  // Split memories into 2 columns for masonry layout on desktop
  const leftColumnMemories = useMemo(() => {
    return filteredMemories.filter((_, idx) => idx % 2 === 0);
  }, [filteredMemories]);

  const rightColumnMemories = useMemo(() => {
    return filteredMemories.filter((_, idx) => idx % 2 === 1);
  }, [filteredMemories]);

  // AI Story Generator logic (Simulated reflection generator)
  const handleGenerateAIStory = () => {
    if (!creatorTitle && !creatorStoryText) {
      triggerToast("Provide a title or some words first so the AI can craft your journal!");
      return;
    }
    setAiGenerating(true);
    setAiGeneratedOutput(null);

    // Simulate AI generation lag
    setTimeout(() => {
      const generatedText = `[AI Adventure Narrative Engine]
The morning mist wrapped around ${creatorLocation || "the landscape"} like a silent shroud. Every step on the trail felt like pathfinding into the unknown. The damp smell of early soil mixed with our excited spirits. As the afternoon arrived, the light broke through the canopy in vertical rays, casting a golden aura onto the path. Looking back, the fatigue faded instantly, replaced by a deep gratitude for this wild escape. A moment of true connection to the trail that will live on as a verified explorer milestone.`;
      setAiGeneratedOutput(generatedText);
      setCreatorStoryText(generatedText);
      setAiGenerating(false);
      triggerToast("AI Adventure Story generated successfully!");
    }, 2000);
  };

  // Quick Creator Save
  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorTitle.trim()) {
      triggerToast("Memory title is required!");
      return;
    }

    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      title: creatorTitle,
      storyText: creatorStoryText || "No detailed logs provided. A quiet day on the adventure trail.",
      date: "Today",
      location: creatorLocation || "Unknown Location",
      weather: creatorWeather,
      mood: creatorMood,
      experienceType: creatorTags[0] || "General Explore",
      privacy: creatorPrivacy,
      images: [
        creatorImage || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"
      ],
      people: [],
      likes: 1,
      commentsCount: 0,
      comments: []
    };

    setMemories(prev => [newMemory, ...prev]);
    // Reset Creator
    setCreatorTitle("");
    setCreatorStoryText("");
    setCreatorLocation("");
    setCreatorImage(null);
    setAiGeneratedOutput(null);
    triggerToast("Memory added to your Personal Scrapbook!");
  };

  // Add Comment
  const handleAddComment = (id: string) => {
    if (!commentInput.trim()) return;
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        const newComment = {
          id: `comment-${Date.now()}`,
          user: "Rishiraj",
          avatar: "R",
          text: commentInput,
          time: "Just now"
        };
        return {
          ...m,
          commentsCount: m.commentsCount + 1,
          comments: [...m.comments, newComment]
        };
      }
      return m;
    }));
    setCommentInput("");
    triggerToast("Comment posted!");
  };

  // Dynamic reaction selector
  const handleSetReaction = (id: string, reactionType: string) => {
    setMemories(prev => prev.map(m => {
      if (m.id === id) {
        triggerToast(`Reacted with: ${reactionType}`);
        return { ...m, reaction: reactionType };
      }
      return m;
    }));
  };

  // Interactive Pins for Map View
  const mapPins = [
    { id: "mem-1", title: "Coorg Coffee Estate Trek", x: 60, y: 70, coords: "12.42° N, 75.73° E" },
    { id: "mem-2", title: "Netrani Island Deep Dive", x: 45, y: 60, coords: "14.02° N, 74.33° E" },
    { id: "mem-3", title: "Sunset Camping Gokarna", x: 40, y: 40, coords: "14.54° N, 74.31° E" },
    { id: "mem-4", title: "CTR Dosas Malleshwaram", x: 75, y: 75, coords: "13.00° N, 77.57° E" }
  ];

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-none relative flex flex-col gap-6 overflow-y-visible">
      
      {/* HEADER SECTION */}
      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-brand-purple" />
              Adventure Memories
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">
              Every adventure becomes a story. Every story becomes a memory. Welcome to your Personal Museum.
            </p>
          </div>

          {/* Header Action Buttons aligned beautifully */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => {
                const el = document.getElementById("memory-creator-card");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="h-8 px-3 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Create Memory
            </button>
            <button 
              onClick={() => triggerToast("Importing photos from Google Drive / Apple cloud...")}
              className="h-8 px-3 rounded-lg bg-zinc-900 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5 text-brand-cyan" /> Import Photos
            </button>
            <button 
              onClick={() => triggerToast("Generating global AI memories timeline recap...")}
              className="h-8 px-3 rounded-lg bg-zinc-900 border border-white/5 text-[10px] font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-amber animate-pulse" /> Generate AI Story
            </button>
          </div>
        </div>

        {/* View mode buttons switcher */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-2 px-2 scroll-smooth border-t border-white/5">
          {(["Timeline", "Gallery", "Map", "Journal", "Experience", "Calendar"] as DisplayMode[]).map(mode => {
            const isActive = activeView === mode;
            return (
              <button
                key={mode}
                onClick={() => { setActiveView(mode); setSelectedMapPin(null); }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple font-black"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {mode} View
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS & STREAK WIDGETS (Full-width grid on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* MEMORY STREAK WIDGET */}
        <div className="bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 p-4 rounded-3xl flex items-center gap-4 text-left shadow-lg relative overflow-hidden group">
          <div className="h-10 w-10 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
            <Sparkle className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-purple">Adventure Retention</span>
            <h3 className="text-xs font-black text-white mt-0.5">18 Days Memory Streak! 🔥</h3>
            <p className="text-[9px] text-zinc-500 mt-0.5">Log one memory every week to maintain your streak.</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>

        {/* MEMORY STATS COUNTER CARD */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex items-center justify-between text-left shadow-lg">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">Adventure Archives</h3>
            <p className="text-[9px] text-zinc-500">Your total achievements and logged memories.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl flex flex-col items-center min-w-[70px]">
              <span className="text-sm font-black font-mono text-white">{memories.length}</span>
              <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Memories</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl flex flex-col items-center min-w-[70px]">
              <span className="text-sm font-black font-mono text-brand-cyan">7</span>
              <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Destinations</span>
            </div>
            <div className="bg-white/[0.02] border border-white/5 px-4 py-2.5 rounded-2xl flex flex-col items-center min-w-[70px]">
              <span className="text-sm font-black font-mono text-brand-purple">12</span>
              <span className="text-[7px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Experiences</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col gap-6 w-full">

          {/* MEMORY CREATOR CARD PINNED AT TOP */}
          <div id="memory-creator-card" className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Create Journal Entry
              </span>
              
              {/* Segmented Control Privacy Selector (Globe, Friends, Lock, Community) */}
              <div className="flex bg-zinc-950/60 p-0.5 rounded-lg border border-white/5">
                {(["Public", "Friends", "Private", "Community"] as const).map(pType => {
                  const isSelected = creatorPrivacy === pType;
                  const Icon = pType === "Public" ? Globe : pType === "Friends" ? Users : pType === "Private" ? Lock : Compass;
                  return (
                    <button
                      key={pType}
                      type="button"
                      onClick={() => setCreatorPrivacy(pType)}
                      title={`Make ${pType}`}
                      className={`p-1.5 rounded-md transition-all flex items-center justify-center cursor-pointer ${
                        isSelected ? "bg-white/10 text-white border border-white/5" : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCreateMemory} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Adventure Title</label>
                  <input
                    type="text"
                    value={creatorTitle}
                    onChange={(e) => setCreatorTitle(e.target.value)}
                    placeholder="E.g., Coorg Rainy Trek, Dive in Murdeshwar..."
                    className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-zinc-200 focus:border-white/10"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Location Tag</label>
                  <input
                    type="text"
                    value={creatorLocation}
                    onChange={(e) => setCreatorLocation(e.target.value)}
                    placeholder="E.g., Coorg, Karnataka"
                    className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-zinc-200 focus:border-white/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Weather Condition</label>
                  <select 
                    value={creatorWeather}
                    onChange={(e) => setCreatorWeather(e.target.value)}
                    className="bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-2 text-xs outline-none text-zinc-300 cursor-pointer"
                  >
                    <option value="Sunny ☀️">Sunny ☀️</option>
                    <option value="Rainy 🌧️">Rainy 🌧️</option>
                    <option value="Foggy 🌫️">Foggy 🌫️</option>
                    <option value="Overcast ☁️">Overcast ☁️</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Mood Indicator</label>
                  <select 
                    value={creatorMood}
                    onChange={(e) => setCreatorMood(e.target.value)}
                    className="bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-2 text-xs outline-none text-zinc-300 cursor-pointer"
                  >
                    <option value="Excited 🚀">Excited 🚀</option>
                    <option value="Peaceful 🌧️">Peaceful 🌧️</option>
                    <option value="Nostalgic 🔥">Nostalgic 🔥</option>
                    <option value="Amazed 🐢">Amazed 🐢</option>
                    <option value="Happy ☕">Happy ☕</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Experience Category</label>
                  <select 
                    onChange={(e) => setCreatorTags([e.target.value])}
                    className="bg-zinc-900 border border-white/5 rounded-xl px-2.5 py-2 text-xs outline-none text-zinc-300 cursor-pointer"
                  >
                    <option value="Mountain Trek">Mountain Trek</option>
                    <option value="Scuba Diving">Scuba Diving</option>
                    <option value="Coastal Camp">Coastal Camp</option>
                    <option value="Culinary Trail">Culinary Trail</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Upload Media</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatorImage("https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600");
                      triggerToast("Mock photo selected!");
                    }}
                    className="h-8 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5 text-brand-cyan" /> Add Photo
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 flex justify-between">
                  <span>Journal Story Log</span>
                  <button
                    type="button"
                    onClick={handleGenerateAIStory}
                    disabled={aiGenerating}
                    className="text-[9px] font-black text-brand-purple flex items-center gap-1 hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" /> {aiGenerating ? "Writing..." : "Magic AI Writer"}
                  </button>
                </label>
                <textarea
                  value={creatorStoryText}
                  onChange={(e) => setCreatorStoryText(e.target.value)}
                  placeholder="Tell your adventure story, reflection notes, or write a travel log..."
                  className="w-full min-h-[90px] bg-zinc-900 border border-white/5 rounded-2xl p-3 text-xs text-zinc-200 outline-none resize-none font-medium placeholder-zinc-600 focus:border-white/10"
                />
              </div>

              {aiGeneratedOutput && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-brand-purple/5 border border-brand-purple/10 p-3 rounded-2xl text-[11px] text-brand-purple leading-relaxed font-semibold italic pl-3 border-l-2 border-l-brand-purple"
                >
                  {aiGeneratedOutput}
                </motion.div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="h-9 px-5 rounded-lg bg-white text-zinc-950 font-bold text-[10px] uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer shadow-md flex items-center gap-1"
                >
                  Log Memory <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* SMART SEARCH & FILTER TAGS BAR */}
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex flex-col gap-3.5 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search memories by location, tags, mood, or people..."
                className="w-full bg-zinc-900/60 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs outline-none text-zinc-300 placeholder-zinc-500 focus:border-white/10"
              />
            </div>
            
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {tagFilters.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                    activeTagFilter === tag
                      ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC VIEWS SWITCHER CONTAINER */}
          <div className="w-full">
            
            {/* VIEW 1: TIMELINE VIEW (Default Journey Path) */}
            {activeView === "Timeline" && (
              <>
                {/* Mobile Viewport (Chronological Timeline Path) */}
                <div className="flex flex-col gap-8 pl-4 relative border-l border-white/10 py-2 text-left md:hidden w-full">
                  <AnimatePresence mode="popLayout">
                    {filteredMemories.map((mem) => (
                      <motion.div
                        key={mem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative w-full"
                      >
                        {/* Timeline Node marker dot */}
                        <div className="absolute -left-[25px] top-5 h-4 w-4 rounded-full bg-zinc-950 border-2 border-brand-purple flex items-center justify-center shadow-lg">
                          <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                        </div>

                        {/* Timeline date stamp */}
                        <div className="text-[10px] font-mono font-black text-brand-cyan tracking-wider uppercase mb-1 flex items-center gap-1.5">
                          <span>{mem.date}</span>
                          <span>•</span>
                          <span className="text-zinc-500">{mem.experienceType}</span>
                        </div>

                        {/* Primary Card */}
                        {renderMemoryCard(mem)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Desktop Viewport (2/2 split layout with fit height and uniform bottom gaps) */}
                <div className="hidden md:grid grid-cols-2 gap-6 items-start w-full text-left">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6">
                    <AnimatePresence mode="popLayout">
                      {leftColumnMemories.map((mem) => (
                        <motion.div
                          key={mem.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="w-full flex flex-col"
                        >
                          <div className="text-[10px] font-mono font-black text-brand-cyan tracking-wider uppercase mb-2 flex items-center gap-1.5 pl-1">
                            <span>{mem.date}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{mem.experienceType}</span>
                          </div>
                          {renderMemoryCard(mem)}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    <AnimatePresence mode="popLayout">
                      {rightColumnMemories.map((mem) => (
                        <motion.div
                          key={mem.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="w-full flex flex-col"
                        >
                          <div className="text-[10px] font-mono font-black text-brand-cyan tracking-wider uppercase mb-2 flex items-center gap-1.5 pl-1">
                            <span>{mem.date}</span>
                            <span>•</span>
                            <span className="text-zinc-500">{mem.experienceType}</span>
                          </div>
                          {renderMemoryCard(mem)}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 2: GALLERY VIEW (Masonry collage) */}
            {activeView === "Gallery" && (
              <>
                {/* Mobile Viewport */}
                <div className="flex flex-col gap-6 md:hidden w-full text-left">
                  <AnimatePresence mode="popLayout">
                    {filteredMemories.map((mem) => renderMemoryCard(mem, true))}
                  </AnimatePresence>
                </div>

                {/* Desktop Viewport (2/2 split layout with fit height and uniform bottom gaps) */}
                <div className="hidden md:grid grid-cols-2 gap-6 items-start w-full text-left">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6">
                    <AnimatePresence mode="popLayout">
                      {leftColumnMemories.map((mem) => renderMemoryCard(mem, true))}
                    </AnimatePresence>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    <AnimatePresence mode="popLayout">
                      {rightColumnMemories.map((mem) => renderMemoryCard(mem, true))}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}

            {/* VIEW 3: MAP VIEW (Interactive vector journey locations map) */}
            {activeView === "Map" && (
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full relative">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <MapIcon className="h-4.5 w-4.5 text-brand-cyan" /> Interactive Journey Map
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Click pins to relive memories from that destination.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Mock Vector SVG Map Frame */}
                  <div className="flex-1 bg-zinc-950/60 border border-white/5 rounded-2xl relative h-64 md:h-96 overflow-hidden flex items-center justify-center">
                    {/* Simulated SVG contours */}
                    <svg viewBox="0 0 400 300" className="h-full w-full opacity-20 pointer-events-none absolute inset-0">
                      <path d="M50,100 Q100,50 150,100 T250,100 T350,100 Q390,150 350,200 T250,200 T150,200 Z" fill="none" stroke="white" strokeWidth="1" />
                      <path d="M80,120 Q120,70 170,120 T270,120 T370,120" fill="none" stroke="white" strokeWidth="0.5" />
                    </svg>

                    {/* Interactive pins */}
                    {mapPins.map(pin => {
                      const isActive = selectedMapPin === pin.id;
                      const memory = memories.find(m => m.id === pin.id);
                      return (
                        <button
                          key={pin.id}
                          onClick={() => {
                            setSelectedMapPin(pin.id);
                            if (memory) setSelectedMemoryDetail(memory);
                          }}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 p-2 group transition-all z-20 cursor-pointer"
                        >
                          <MapPin className={`h-6 w-6 transition-all duration-300 ${
                            isActive ? "text-brand-purple scale-125 drop-shadow-[0_0_10px_#8B5CF6]" : "text-brand-cyan group-hover:scale-110"
                          }`} />
                          <span className="absolute left-1/2 -translate-x-1/2 -bottom-5 bg-zinc-900 border border-white/10 text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-400 px-1 rounded scale-0 group-hover:scale-100 transition-transform whitespace-nowrap">
                            {pin.title}
                          </span>
                        </button>
                      );
                    })}

                    <span className="absolute bottom-3 left-3 text-[8px] font-mono text-zinc-600 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Wandercall Grid Coordinates</span>
                  </div>

                  {/* Slide-out detail panel */}
                  <AnimatePresence mode="wait">
                    {selectedMemoryDetail && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full md:w-64 bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 justify-between"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-mono font-bold text-brand-cyan bg-brand-cyan/5 border border-brand-cyan/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {selectedMemoryDetail.experienceType}
                            </span>
                            <button onClick={() => setSelectedMemoryDetail(null)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <h4 className="text-xs font-black text-white">{selectedMemoryDetail.title}</h4>
                          <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                            "{selectedMemoryDetail.storyText.substring(0, 120)}..."
                          </p>
                          <span className="text-[8px] font-mono font-bold text-zinc-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedMemoryDetail.location}</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveView("Journal");
                          }}
                          className="w-full h-8 bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold uppercase tracking-wider rounded-lg text-white transition-all cursor-pointer"
                        >
                          View Full Journal Entry
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* VIEW 4: JOURNAL VIEW (Notebook logs long-form style) */}
            {activeView === "Journal" && (
              <div className="flex flex-col gap-6 text-left">
                {filteredMemories.map(mem => (
                  <div key={mem.id} className="bg-zinc-900/10 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-inner font-serif">
                    {/* Visual spiral binding decoration */}
                    <div className="absolute top-0 left-6 right-6 h-3 flex justify-between gap-1 pointer-events-none opacity-40">
                      {[...Array(20)].map((_, i) => (
                        <span key={i} className="h-4 w-1.5 rounded-full bg-zinc-700 border-l border-zinc-950 shadow-inner" />
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4 mt-2">
                      <div>
                        <h2 className="text-lg font-black text-zinc-100 font-serif leading-snug">{mem.title}</h2>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                          <span>{mem.date}</span>
                          <span>•</span>
                          <span>{mem.location}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-2 py-0.5 rounded-md uppercase tracking-wider font-sans">
                        {mem.experienceType}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed font-serif indent-6 font-medium italic">
                      "{mem.storyText}"
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-4 border-t border-white/5 text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider font-sans">
                      <div>Weather: <span className="text-zinc-400">{mem.weather}</span></div>
                      <div>Mood: <span className="text-zinc-400">{mem.mood}</span></div>
                      <div>People: <span className="text-zinc-400">{mem.people.join(", ") || "Solo Trek"}</span></div>
                      <div>Type: <span className="text-zinc-400">{mem.experienceType}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIEW 5: EXPERIENCE VIEW (Grouped collections list) */}
            {activeView === "Experience" && (
              <div className="flex flex-col gap-6 text-left">
                {["Mountain Trek", "Scuba Diving", "Coastal Camp", "Culinary Trail"].map(expType => {
                  const items = memories.filter(m => m.experienceType === expType);
                  if (items.length === 0) return null;

                  return (
                    <div key={expType} className="flex flex-col gap-3.5">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="h-2 w-2 rounded-full bg-brand-purple" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">{expType} Journals ({items.length})</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map(m => (
                          <div key={m.id} onClick={() => { setSelectedMemoryDetail(m); setActiveView("Timeline"); }} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-all cursor-pointer flex flex-col gap-2">
                            <h4 className="text-xs font-black text-white">{m.title}</h4>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium line-clamp-2">{m.storyText}</p>
                            <span className="text-[8px] font-mono text-zinc-600 font-bold uppercase mt-1">{m.date} • {m.location}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 6: CALENDAR VIEW (Streaks indicator and heatmap contribution grid) */}
            {activeView === "Calendar" && (
              <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-white">Adventure Frequency Heatmap</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Log frequency and adventure consistency over the year.</p>
                  </div>

                  <div className="bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
                    <span className="text-[16px] animate-bounce">🔥</span>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-black text-white">18 Days Streak!</span>
                      <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">Active Tracker</span>
                    </div>
                  </div>
                </div>

                {/* Heatmap simulation */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {[...Array(53)].map((_, colIdx) => (
                      <div key={colIdx} className="flex flex-col gap-1">
                        {[...Array(7)].map((_, rowIdx) => {
                          // Mock intensity coloring
                          const r = Math.random();
                          let colorClass = "bg-white/5";
                          if (r > 0.9) colorClass = "bg-brand-purple/80";
                          else if (r > 0.8) colorClass = "bg-brand-cyan/60";
                          else if (r > 0.7) colorClass = "bg-brand-cyan/20";
                          return (
                            <div 
                              key={rowIdx} 
                              className={`h-2.5 w-2.5 rounded-sm transition-colors hover:brightness-125 ${colorClass}`}
                              title={`Week ${colIdx}, Day ${rowIdx}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-bold uppercase tracking-wider px-1">
                    <span>Jan</span>
                    <span>Apr</span>
                    <span>Jul</span>
                    <span>Oct</span>
                    <span>Dec</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* MEMORY COLLECTIONS CARD GRID */}
          <div className="bg-white/[0.01] border border-white/5 p-5 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full mt-2">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <FolderHeart className="h-4.5 w-4.5 text-brand-purple" /> Memory Collections
              </h3>
              <p className="text-[10px] text-zinc-500 font-medium">Curate and group your journeys into visual albums.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {initialCollections.map(col => (
                <div 
                  key={col.id}
                  onClick={() => {
                    setActiveTagFilter(col.name === "Travel Adventures" ? "All" : col.name === "Mountain Treks" ? "Mountain Trek" : col.name === "Food Experiences" ? "Culinary Trail" : "Coastal Camp");
                    triggerToast(`Filtering by collection: ${col.name}`);
                  }}
                  className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-24 w-full relative overflow-hidden bg-zinc-800 shrink-0">
                    <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold text-white bg-zinc-950/60 px-1.5 py-0.5 rounded-md border border-white/5">
                      {col.count} items
                    </span>
                  </div>
                  <div className="p-3 flex flex-col text-left">
                    <span className="text-[10px] font-bold text-zinc-200 group-hover:text-white truncate">{col.name}</span>
                    <span className="text-[7.5px] font-mono font-bold text-zinc-500 uppercase mt-0.5">Updated: {col.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 glass-panel border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  // Helper Card Render
  function renderMemoryCard(mem: Memory, hideLayoutTransition = false) {
    const hasPhotos = mem.images && mem.images.length > 0;
    
    return (
      <div className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col gap-4 text-left shadow-lg hover:border-white/10 transition-all duration-300 relative overflow-hidden group w-full">
        
        {/* Card Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Header info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white leading-snug">{mem.title}</h3>
                {mem.privacy === "Public" && <Globe className="h-3 w-3 text-zinc-500" />}
                {mem.privacy === "Friends" && <Users className="h-3 w-3 text-zinc-500" />}
                {mem.privacy === "Private" && <Lock className="h-3 w-3 text-zinc-500" />}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5 text-brand-cyan" /> {mem.location}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CloudSun className="h-2.5 w-2.5 text-brand-amber" /> {mem.weather}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Smile className="h-2.5 w-2.5 text-brand-purple" /> {mem.mood}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="w-full flex flex-col gap-3">
          {/* Images Grid */}
          {hasPhotos && (
            <div className={`grid ${mem.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2 rounded-2xl overflow-hidden border border-white/5 max-h-[220px]`}>
              {mem.images.map((img, idx) => (
                <div key={idx} className="h-[220px] relative overflow-hidden bg-zinc-800">
                  <img src={img} alt={mem.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {mem.storyText}
          </p>

          {/* People tagged display */}
          {mem.people.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center mt-1">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">With:</span>
              {mem.people.map(person => (
                <span key={person} className="text-[8px] font-bold text-brand-purple bg-brand-purple/5 border border-brand-purple/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {person}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer Actions aligned */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider w-full font-sans">
          <button 
            onClick={() => handleLike(mem.id)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              mem.hasLiked ? "text-brand-cyan" : "hover:text-zinc-300"
            }`}
            aria-label="Like post"
          >
            <Heart className={`h-4.5 w-4.5 ${mem.hasLiked ? "fill-brand-cyan text-brand-cyan border-none" : ""}`} />
            <span>{mem.likes}</span>
          </button>
          
          <button 
            onClick={() => setExpandedCommentsId(expandedCommentsId === mem.id ? null : mem.id)}
            className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Toggle comments"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>{mem.commentsCount}</span>
          </button>

          {/* Reactions trigger */}
          <div className="relative group/react">
            <button className="flex items-center gap-1 cursor-pointer hover:text-zinc-300 transition-colors">
              <Smile className="h-4.5 w-4.5 text-brand-purple" />
              <span>{mem.reaction || "React"}</span>
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-white/10 p-1.5 rounded-xl hidden group-hover/react:flex gap-1 shadow-2xl z-30 pointer-events-auto">
              {["Inspired", "Want to Try", "Amazing", "Saved", "Loved This"].map(rName => (
                <button
                  key={rName}
                  onClick={() => handleSetReaction(mem.id, rName)}
                  className="px-2 py-1 hover:bg-white/5 rounded-md text-[8px] font-mono font-black text-white uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {rName}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => handleSave(mem.id)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              mem.hasSaved ? "text-brand-purple" : "hover:text-zinc-300"
            }`}
            aria-label="Save post"
          >
            <Bookmark className={`h-4.5 w-4.5 ${mem.hasSaved ? "fill-brand-purple text-brand-purple border-none" : ""}`} />
            <span>Save</span>
          </button>
          
          <button 
            onClick={() => triggerToast("Copied story journal link to clipboard!")}
            className="flex items-center gap-1.5 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="h-4.5 w-4.5" />
            <span>Share</span>
          </button>
        </div>

        {/* Expanded Comments Section */}
        {expandedCommentsId === mem.id && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3 w-full font-sans">
            <div className="flex flex-col gap-2">
              {mem.comments.map(c => (
                <div key={c.id} className="flex gap-2.5 items-start text-xs bg-white/[0.01] p-2.5 rounded-xl border border-white/5 font-sans">
                  <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-black text-[9px] text-white shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex flex-col text-left font-sans">
                    <span className="font-bold text-zinc-300">{c.user} <span className="text-[8px] font-mono text-zinc-600 font-bold ml-1">{c.time}</span></span>
                    <p className="text-zinc-400 font-medium mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 items-center font-sans">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-zinc-300 focus:border-white/10"
              />
              <button
                onClick={() => handleAddComment(mem.id)}
                className="h-8 w-8 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <SendButtonIcon />
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Small Send Button Icon Helper
  function SendButtonIcon() {
    return (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    );
  }
}
