"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Gauge, Heart, Share2, Eye, Flame } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  price: string;
  image: string;
  glow: string;
}

export default function Trending() {
  const experiences: Experience[] = [
    {
      id: "t1",
      title: "Scuba Diving & Coral Exploration",
      category: "Water Sports",
      rating: 4.9,
      reviewsCount: 142,
      location: "Netrani Island, Karnataka",
      duration: "6 hours",
      difficulty: "Medium",
      price: "₹4,999",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
      glow: "hover:border-cyan-500/20 glass-glow-cyan"
    },
    {
      id: "t2",
      title: "Paragliding over Bir Billing Valleys",
      category: "Adventure",
      rating: 4.8,
      reviewsCount: 98,
      location: "Bir, Himachal Pradesh",
      duration: "45 minutes",
      difficulty: "Hard",
      price: "₹3,500",
      image: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=600&auto=format&fit=crop",
      glow: "hover:border-purple-500/20 glass-glow-purple"
    },
    {
      id: "t3",
      title: "Overnight Kayaking & Bioluminescent Tour",
      category: "Adventure",
      rating: 4.95,
      reviewsCount: 74,
      location: "Gokarna, Karnataka",
      duration: "1 Night",
      difficulty: "Medium",
      price: "₹2,800",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      glow: "hover:border-indigo-500/20 glass-glow-indigo"
    },
    {
      id: "t4",
      title: "Heritage Fort Rappelling & Bouldering",
      category: "Adventure",
      rating: 4.7,
      reviewsCount: 52,
      location: "Hampi, Karnataka",
      duration: "5 hours",
      difficulty: "Extreme",
      price: "₹1,800",
      image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=600&auto=format&fit=crop",
      glow: "hover:border-orange-500/20 glass-glow-indigo"
    }
  ];

  // Wishlist local state tracking
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Hover preview simulation states
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-brand-emerald bg-brand-emerald/10";
      case "Medium": return "text-brand-cyan bg-brand-cyan/10";
      case "Hard": return "text-brand-purple bg-brand-purple/10";
      case "Extreme": return "text-rose-500 bg-rose-500/10";
      default: return "text-zinc-400 bg-white/5";
    }
  };

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="experiences">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
            <Flame className="h-4 w-4 text-brand-cyan" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Highly Demanded Memories
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Trending Adventures
          </h2>
        </div>
        <div className="flex gap-2">
          {/* Scroll instruction for mobile/desktop */}
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest self-end">
            Swipe or Drag to Explore →
          </span>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="w-full overflow-x-auto pb-8 no-scrollbar cursor-grab active:cursor-grabbing flex gap-6 snap-x snap-mandatory">
        {experiences.map((exp) => {
          const isWishlisted = wishlist.includes(exp.id);
          const isHovered = hoveredCardId === exp.id;

          return (
            <motion.div
              key={exp.id}
              className={`snap-start shrink-0 w-[290px] sm:w-[320px] rounded-3xl glass-panel border-white/5 flex flex-col justify-between overflow-hidden group/card transition-all duration-300 ${exp.glow}`}
              onMouseEnter={() => setHoveredCardId(exp.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              whileHover={{ y: -6 }}
            >
              {/* Card Thumbnail Gallery (Simulated video loop on hover) */}
              <div className="h-48 w-full relative overflow-hidden bg-zinc-950">
                <motion.img
                  src={exp.image}
                  alt={exp.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out"
                  animate={{ scale: isHovered ? 1.08 : 1 }}
                />

                {/* Looping CSS simulation bar for video loading on hover */}
                {isHovered && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-cyan"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}

                {/* Dark Vignette mask */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top overlay pills */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                  <span className="text-[10px] font-bold text-white bg-black/55 px-2.5 py-1 rounded-full backdrop-blur-md uppercase tracking-wider">
                    {exp.category}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleWishlist(exp.id)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all ${
                        isWishlisted 
                          ? "bg-brand-indigo border-brand-indigo text-white scale-110 shadow-lg shadow-brand-indigo/30" 
                          : "bg-black/40 border-white/10 text-white hover:bg-white hover:text-black"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isWishlisted ? "fill-white" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Hover Quick Action buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10 bg-black/30 backdrop-blur-[2px]">
                  <a 
                    href={`#experience-${exp.id}`}
                    className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Quick View
                  </a>
                </div>
              </div>

              {/* Card Metadata info */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-brand-amber">
                      <Star className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" />
                      {exp.rating}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      ({exp.reviewsCount} reviews)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight mb-2 group-hover/card:text-brand-cyan transition-colors line-clamp-1">
                    {exp.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-6 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="line-clamp-1">{exp.location}</span>
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      {exp.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getDifficultyColor(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Starts At</p>
                    <p className="text-sm font-black text-white">{exp.price}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
