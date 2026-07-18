"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  Share2,
  Trash2,
  FolderHeart,
  EyeOff,
  ChevronDown,
  Sparkles,
  Zap,
  X,
  PlusCircle,
  AlertTriangle
} from "lucide-react";
import { HERO_CATEGORIES } from "@/data/heroData";

// Interfaces
interface Host {
  name: string;
  avatar: string;
  level: number;
}

interface Experience {
  id: string;
  name: string;
  location: string;
  price: number;
  duration: string;
  durationHours: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
  host: Host;
  availability: string;
  aiInsight: string;
  image: string;
  collections: string[];
  seasonClosure: boolean;
  tags: string[];
  slots: number;
  description: string;
}

// Initial Mock Wishlist Experiences with rich tags
const initialExperiences: Experience[] = [
  {
    id: "exp-1",
    name: "Gokarna Cliff Trek & Beach Camping",
    location: "Gokarna, Karnataka",
    price: 3200,
    duration: "2 Days",
    durationHours: 48,
    difficulty: "Medium",
    rating: 4.9,
    host: { name: "Arjun Mehta", avatar: "A", level: 18 },
    availability: "Weekends Only",
    aiInsight: "92% Match For Explorer DNA",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
    collections: ["Travel", "Adventure"],
    seasonClosure: true,
    tags: ["Adventure", "Weekend", "Trending", "Nature", "Camping"],
    slots: 8,
    description: "Trek along the scenic beaches and cliffs of Gokarna with camping under the stars."
  },
  {
    id: "exp-2",
    name: "Deep Sea Scuba Diving",
    location: "Netrani Island, Murdeshwar",
    price: 4500,
    duration: "1 Day",
    durationHours: 24,
    difficulty: "Hard",
    rating: 4.8,
    host: { name: "Capt. Rohit", avatar: "R", level: 25 },
    availability: "Daily Booking",
    aiInsight: "88% Match For Thrill Seeker",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
    collections: ["Adventure"],
    seasonClosure: true,
    tags: ["Adventure", "Water Sports", "Deep Sea", "Weekend"],
    slots: 5,
    description: "Experience thrilling deep sea diving at Netrani Island and witness vibrant marine life."
  },
  {
    id: "exp-3",
    name: "Coorg Coffee Estate Trek",
    location: "Coorg, Karnataka",
    price: 1800,
    duration: "1 Day",
    durationHours: 24,
    difficulty: "Easy",
    rating: 4.7,
    host: { name: "Sarah Jenkins", avatar: "S", level: 14 },
    availability: "Daily Booking",
    aiInsight: "75% Match For Learner DNA",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    collections: ["Travel", "Adventure"],
    seasonClosure: false,
    tags: ["Travel", "Adventure", "Nature", "Weekend"],
    slots: 15,
    description: "Walk through lush green coffee plantations and enjoy the serene mist of Coorg."
  },
  {
    id: "exp-4",
    name: "Old Bangalore Heritage Food Crawl",
    location: "CTR Malleshwaram, Bangalore",
    price: 950,
    duration: "4 Hours",
    durationHours: 4,
    difficulty: "Easy",
    rating: 4.9,
    host: { name: "Rohan Roy", avatar: "R", level: 12 },
    availability: "Daily Booking",
    aiInsight: "95% Match For Food Explorer",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    collections: ["Food"],
    seasonClosure: false,
    tags: ["Food", "Cultural", "Trending", "Local"],
    slots: 20,
    description: "Savor the iconic traditional dishes and delicious heritage filter coffee of Old Bangalore."
  },
  {
    id: "exp-5",
    name: "Bir Billing Tandem Paragliding",
    location: "Bir, Himachal Pradesh",
    price: 3500,
    duration: "2 Hours",
    durationHours: 2,
    difficulty: "Medium",
    rating: 4.9,
    host: { name: "Flying Buddha Crew", avatar: "F", level: 20 },
    availability: "Available Now",
    aiInsight: "96% Match For Thrill Seeker",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop",
    collections: ["Adventure"],
    seasonClosure: false,
    tags: ["Adventure", "Heights", "Trending", "Air Sports"],
    slots: 4,
    description: "Fly high with tandem paragliding and enjoy stunning views of the Himalayan valleys."
  },
  {
    id: "exp-6",
    name: "Himalayan Base Camp Expedition",
    location: "Sankri, Uttarakhand",
    price: 12500,
    duration: "6 Days",
    durationHours: 144,
    difficulty: "Hard",
    rating: 4.9,
    host: { name: "Tenzing Jr.", avatar: "T", level: 30 },
    availability: "Weekly Batches",
    aiInsight: "94% Match For Explorer DNA",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    collections: ["Travel", "Adventure"],
    seasonClosure: true,
    tags: ["Travel", "Adventure", "Nature", "Snow Trek"],
    slots: 6,
    description: "A challenging snow trek to the majestic base camp surrounded by towering peaks."
  },
  {
    id: "exp-7",
    name: "Sunset Kayaking & Bioluminescence",
    location: "Mulki, Karnataka",
    price: 1500,
    duration: "3 Hours",
    durationHours: 3,
    difficulty: "Medium",
    rating: 4.7,
    host: { name: "Coastal Paddlers", avatar: "C", level: 16 },
    availability: "Weekends Only",
    aiInsight: "89% Match For Creator DNA",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    collections: ["Travel", "Nightlife"],
    seasonClosure: false,
    tags: ["Travel", "Nightlife", "Water Sports", "Kayaking"],
    slots: 12,
    description: "Enjoy peaceful sunset kayaking in Mulki waters and magical night bioluminescence."
  },
  {
    id: "exp-8",
    name: "Stargazing & Astrophotography Camp",
    location: "Spiti Valley, Himachal Pradesh",
    price: 8000,
    duration: "3 Days",
    durationHours: 72,
    difficulty: "Easy",
    rating: 4.8,
    host: { name: "Astro Enthusiasts", avatar: "A", level: 22 },
    availability: "New Moon Weekends",
    aiInsight: "91% Match For Photography DNA",
    image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=600&auto=format&fit=crop",
    collections: ["Photography", "Nightlife"],
    seasonClosure: true,
    tags: ["Photography", "Nightlife", "Nature", "Astronomy"],
    slots: 10,
    description: "Camp under the star-studded night skies of Spiti Valley for amazing astrophotography."
  },
  {
    id: "exp-9",
    name: "Hampi Ruins Cycling Trail",
    location: "Hampi, Karnataka",
    price: 1200,
    duration: "1 Day",
    durationHours: 24,
    difficulty: "Easy",
    rating: 4.6,
    host: { name: "Hampi Cohorts", avatar: "H", level: 15 },
    availability: "Daily Booking",
    aiInsight: "82% Match For Learner DNA",
    image: "https://images.unsplash.com/photo-1600100397608-f010e423b971?q=80&w=600&auto=format&fit=crop",
    collections: ["Learning", "Travel"],
    seasonClosure: false,
    tags: ["Travel", "Learning", "Cycling", "Heritage"],
    slots: 18,
    description: "Cycle through the historic ruins and stunning boulder landscapes of ancient Hampi."
  },
  {
    id: "exp-10",
    name: "Western Ghats Off-Road Expedition",
    location: "Wayanad, Kerala",
    price: 5000,
    duration: "2 Days",
    durationHours: 48,
    difficulty: "Hard",
    rating: 4.8,
    host: { name: "Wayanad Jeepers", avatar: "W", level: 19 },
    availability: "Weekends Only",
    aiInsight: "90% Match For Thrill Seeker",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop",
    collections: ["Roadtrips", "Adventure"],
    seasonClosure: false,
    tags: ["Adventure", "Roadtrips", "Off Road", "Weekend"],
    slots: 7,
    description: "An adventurous off-road jeep drive through the wild and rugged Western Ghats trail."
  }
];

export default function WishlistPage() {
  // Page States
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [activeCollection, setActiveCollection] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [sortOption, setSortOption] = useState<string>("Rating");

  // Dropdown States
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  // Infinite Scroll States
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Toast Notification System
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dropdown menus and modals closure reference
  const cardMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Dynamic Toast trigger
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeCardMenuId) {
        const currentRef = cardMenuRefs.current[activeCardMenuId];
        if (currentRef && !currentRef.contains(event.target as Node)) {
          setActiveCardMenuId(null);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeCardMenuId]);

  const handleMoveCollection = (id: string, targetCol: string) => {
    setExperiences(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          if (exp.collections.includes(targetCol)) return exp;
          return {
            ...exp,
            collections: [...exp.collections, targetCol]
          };
        }
        return exp;
      })
    );
    setActiveCardMenuId(null);
    triggerToast(`Experience moved to ${targetCol}`);
  };

  // Remove experience from wishlist
  const handleRemoveExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    setActiveCardMenuId(null);
    triggerToast("Removed from Wishlist");
  };

  // Hide experience temporarily (simulated by filtering it out)
  const handleHideExperience = (id: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    setActiveCardMenuId(null);
    triggerToast("Experience hidden from dashboard");
  };

  // Filtered and Sorted Cards
  const processedExperiences = useMemo(() => {
    let list = [...experiences];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        exp =>
          exp.name.toLowerCase().includes(q) ||
          exp.location.toLowerCase().includes(q) ||
          exp.host.name.toLowerCase().includes(q)
      );
    }

    // Filter by Collection Switcher
    if (activeCollection !== "ALL") {
      list = list.filter(exp => exp.collections.includes(activeCollection));
    }

    // Filter by Difficulty
    if (difficultyFilter !== "All") {
      list = list.filter(exp => exp.difficulty === difficultyFilter);
    }

    // Sort Cards
    if (sortOption === "Price: Low to High") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "Price: High to Low") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === "Rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "AI Matching") {
      const getMatchVal = (ins: string) => {
        const match = ins.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      };
      list.sort((a, b) => getMatchVal(b.aiInsight) - getMatchVal(a.aiInsight));
    }

    return list;
  }, [experiences, searchQuery, activeCollection, difficultyFilter, sortOption]);

  // Infinite Scroll Simulated Loading Trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < processedExperiences.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount(prev => prev + 4);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [isLoadingMore, visibleCount, processedExperiences.length]);

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-5 overflow-y-visible relative text-white">

      {/* COLLECTION SWITCHER CONTAINER */}
      <section className="relative w-full border-b border-white/5 pb-4 pt-2">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full px-1">
          {/* "ALL" */}
          <button
            onClick={() => {
              setActiveCollection("ALL");
              setVisibleCount(9);
            }}
            className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 shrink-0 ${activeCollection === "ALL"
                ? "bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan"
                : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
              }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            ALL EXPERIENCES
          </button>

          {/* Inline Categories mapped from HERO_CATEGORIES */}
          {HERO_CATEGORIES.map(cat => {
            const isActive = activeCollection === cat.name;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCollection(cat.name);
                  setVisibleCount(9);
                }}
                className={`px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 shrink-0 ${isActive
                    ? "bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan"
                    : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="w-full relative min-h-[260px]">
        {processedExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch justify-items-center">
            {processedExperiences.slice(0, visibleCount).map((exp) => {
              const isClosing = exp.seasonClosure;
              const isCardMenuOpen = activeCardMenuId === exp.id;
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 hover:-translate-y-1 transition-all duration-300 w-full flex flex-col justify-between relative shadow-sm hover:shadow"
                  style={{ height: '340px', position: 'relative', maxWidth: '480px', margin: '0 auto' }}
                >
                  {/* Card Image Wrapper (Exactly 128px height, i.e. 37.6% of 340px) */}
                  <div style={{ height: '128px', position: 'relative', overflow: 'hidden' }} className="w-full shrink-0">
                    <img
                      src={exp.image}
                      alt={exp.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Top shadow overlay for text legibility */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '48px',
                        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 60%, rgba(0, 0, 0, 0) 100%)',
                        zIndex: 15,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Dark gradient mask on image bottom */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '32px',
                        backgroundImage: 'linear-gradient(to top, rgba(11, 11, 11, 0.8) 0%, rgba(11, 11, 11, 0) 100%)',
                        zIndex: 15,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Top Metadata Chips Row */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: 30
                      }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '800',
                          color: '#ffffff',
                          fontFamily: 'monospace',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}
                      >
                        ⭐ {exp.rating}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '600',
                          color: '#e4e4e7',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}
                      >
                        ⏱ {exp.duration}
                      </span>

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          backgroundColor: 'rgba(6, 182, 212, 0.25)',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '9px',
                          fontWeight: '800',
                          color: '#06b6d4',
                          fontFamily: 'monospace',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}
                      >
                        💰 ₹{exp.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                  </div>

                  {/* Remove Button absolute top-right */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      zIndex: 30
                    }}
                  >
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ef4444',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer'
                      }}
                      className="hover:text-rose-400 hover:bg-zinc-900 transition-colors relative"
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Card Content Wrapper (Exactly 212px height, i.e. 62.4% of 340px) */}
                  <div
                    style={{ height: '212px' }}
                    className="p-4 flex flex-col justify-between overflow-hidden shrink-0"
                  >

                    {/* Top Content Row */}
                    <div className="flex flex-col text-left">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-white leading-tight line-clamp-2 h-[34px] group-hover:text-brand-cyan transition-colors">
                          {exp.name}
                        </h3>
                      </div>

                      {/* Location text */}
                      <div className="text-[10px] text-zinc-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-brand-cyan shrink-0" />
                        <span>{exp.location}</span>
                      </div>
                      
                      {/* Difficulty & Slots badges */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[7.5px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${exp.difficulty === "Easy"
                            ? "bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald"
                            : exp.difficulty === "Medium"
                              ? "bg-brand-amber/10 border-brand-amber/20 text-brand-amber"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                          }`}>
                          {exp.difficulty}
                        </span>
                        <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
                          ⚡ {exp.slots} slots left
                        </span>
                      </div>
                    </div>

                    {/* Experience Short Description & More Button */}
                    <p className="text-[10px] text-zinc-400 font-medium leading-normal mt-1.5 text-left flex-1">
                      {(() => {
                        const words = exp.description.split(' ');
                        const isExpanded = expandedCards.has(exp.id);
                        const displayText = isExpanded || words.length <= 20
                          ? exp.description
                          : words.slice(0, 20).join(' ') + '...';
                        return (
                          <>
                            {displayText}{" "}
                            {words.length > 20 && (
                              <button
                                onClick={() => toggleCardExpand(exp.id)}
                                className="text-brand-cyan hover:underline font-bold inline-block cursor-pointer ml-1"
                              >
                                {isExpanded ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </p>

                    {/* CTA Area (Direct buttons only) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-auto shrink-0">
                      <button
                        onClick={() => triggerToast(`Booking: ${exp.name}`)}
                        className="h-8 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-black text-[9px] uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 flex-1 cursor-pointer"
                      >
                        <Zap className="h-3 w-3 fill-white text-white" />
                        <span>Book Now</span>
                      </button>
                      <button
                        onClick={() => triggerToast(`Details: ${exp.name}`)}
                        className="h-8 rounded-xl bg-transparent border border-white/10 hover:bg-white/5 hover:border-white/20 text-zinc-300 hover:text-white font-black text-[9px] uppercase tracking-wider transition-all flex-1 cursor-pointer flex items-center justify-center"
                      >
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State Dashboard Card */
          <div className="flex flex-col items-center justify-center text-center p-6 border border-white/5 bg-white/[0.01] rounded-3xl max-w-sm mx-auto my-12 shadow-md shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 mb-3">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">No experiences found</h3>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-1 px-4">
              Try resetting your search filters or selected collection to discover experiences.
            </p>
            <button
              onClick={() => {
                setActiveCollection("ALL");
                setSearchQuery("");
                setDifficultyFilter("All");
                setSortOption("Rating");
                setVisibleCount(8);
              }}
              className="mt-4 h-8 px-4 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-[9px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. SIMULATED INFINITE SCROLL */}
      {processedExperiences.length > visibleCount && (
        <div ref={loaderRef} className="py-6 w-full flex flex-col items-center justify-center shrink-0">
          {isLoadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full items-stretch justify-items-center">
              {[1, 2, 3].map((key) => (
                <div 
                  key={key} 
                  className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between animate-pulse w-full"
                  style={{ height: '340px', position: 'relative', maxWidth: '480px', margin: '0 auto' }}
                >
                  <div className="h-[128px] bg-zinc-900/60 rounded-xl w-full shrink-0" />
                  <div className="h-[212px] flex flex-col justify-between pt-3 shrink-0">
                    <div className="flex flex-col gap-2">
                      <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
                      <div className="h-3 bg-zinc-900 rounded-md w-1/2" />
                    </div>
                    <div className="h-10 bg-zinc-900 rounded-md w-full my-2" />
                    <div className="flex gap-2 border-t border-white/5 pt-2 mt-auto shrink-0">
                      <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                      <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Done scroll marker */}
      {processedExperiences.length > 0 && processedExperiences.length <= visibleCount && (
        <div className="py-6 text-center text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-widest w-full select-none shrink-0">
          You've explored all saved experiences!
        </div>
      )}

      {/* 6. MODALS & OVERLAYS */}



      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-zinc-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
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
