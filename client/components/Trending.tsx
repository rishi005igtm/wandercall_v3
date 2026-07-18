"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Flame,
  Compass,
  Zap,
  Calendar,
  SlidersHorizontal,
  X,
  Check,
  Heart
} from "lucide-react";

interface Experience {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  price: number;
  image: string;
  glow: string;
  description: string;
  slug: string;
}

export default function Trending() {
  const experiences: Experience[] = [
    {
      id: "exp-1",
      title: "Scuba Diving & Coral Exploration",
      category: "Water Sports",
      rating: 4.9,
      reviewsCount: 142,
      location: "Netrani Island, Karnataka",
      duration: "6 Hours",
      difficulty: "Medium",
      price: 4999,
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-cyan hover:border-cyan-500/30",
      description: "Dive deep into the crystal clear waters of Netrani. Explore vibrant coral reefs and swim alongside exotic fish like stingrays, barracudas, and turtles.",
      slug: "scuba-diving-coral-exploration"
    },
    {
      id: "exp-2",
      title: "Paragliding over Bir Billing Valleys",
      category: "Adventure",
      rating: 4.8,
      reviewsCount: 98,
      location: "Bir, Himachal Pradesh",
      duration: "45 Minutes",
      difficulty: "Hard",
      price: 3500,
      image: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-purple hover:border-purple-500/30",
      description: "Experience the adrenaline rush of flying over snow-capped peaks and lush green pine valleys at the world's second-highest paragliding site.",
      slug: "paragliding-over-bir-billing-valleys"
    },
    {
      id: "exp-3",
      title: "Overnight Bioluminescent Kayaking",
      category: "Water Sports",
      rating: 4.95,
      reviewsCount: 74,
      location: "Gokarna, Karnataka",
      duration: "1 Night",
      difficulty: "Medium",
      price: 2800,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-indigo hover:border-indigo-500/30",
      description: "Paddle through dark waters under a starry sky as the ocean glows blue with bioluminescent plankton. Camp on a secluded beach under the stars.",
      slug: "overnight-bioluminescent-kayaking"
    },
    {
      id: "exp-4",
      title: "Heritage Fort Rappelling & Bouldering",
      category: "Adventure",
      rating: 4.7,
      reviewsCount: 52,
      location: "Hampi, Karnataka",
      duration: "5 Hours",
      difficulty: "Extreme",
      price: 1800,
      image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-rose hover:border-rose-500/30",
      description: "Tackle the historic boulders of Hampi. Learn traditional rock climbing techniques and rappel down towering ruins with certified guides.",
      slug: "heritage-fort-rappelling-bouldering"
    }
  ];

  // Wishlist local state tracking
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getDifficultyStyles = (diff: string) => {
    switch (diff) {
      case "Easy": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Medium": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "Hard": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Extreme": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default: return "text-zinc-400 bg-white/5 border-white/5";
    }
  };

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="experiences">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
            <Flame className="h-4 w-4 text-brand-cyan" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Highly Demanded Memories
            </span>
          </div>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight text-white">
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
          return (
            <motion.div
              key={exp.id}
              className={`snap-start shrink-0 w-[290px] sm:w-[320px] rounded-3xl glass-panel border-white/5 flex flex-col justify-between overflow-hidden group/card transition-all duration-300 shine-card ${exp.glow}`}
              whileHover={{ y: -6 }}
            >
              {/* Thumbnail Zone */}
              <div className="h-44 w-full relative overflow-hidden bg-zinc-950">
                <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Header overlay */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
                  <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider border border-white/5">
                    {exp.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-black/65 px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-bold text-brand-amber border border-white/5 h-7">
                      <Star className="h-3 w-3 fill-brand-amber text-brand-amber" />
                      {exp.rating}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(exp.id);
                      }}
                      className={`h-7 w-7 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-md ${
                        isWishlisted
                          ? "bg-brand-indigo border-brand-indigo text-white scale-110 shadow-lg shadow-brand-indigo/30"
                          : "bg-black/60 border-white/5 text-white hover:bg-white hover:text-black"
                      }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Metadata Card Area */}
              <div className="p-5 flex flex-col justify-between flex-1 text-left">
                <div>
                  <h3 className="text-sm font-black text-white leading-snug group-hover/card:text-brand-cyan transition-colors line-clamp-1 uppercase tracking-tight">
                    {exp.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 mt-1.5 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{exp.location}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed font-medium line-clamp-2">
                    {exp.description}
                  </p>
                </div>

                {/* Detail Metrics */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 font-mono">
                      <Clock className="h-3.5 w-3.5" />
                      {exp.duration}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${getDifficultyStyles(exp.difficulty)}`}>
                      {exp.difficulty}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 block leading-none">Starts At</span>
                    <span className="text-xs font-black text-brand-cyan mt-1 block">₹{exp.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* View Experience CTA */}
                <Link
                  href={`/experiences/${exp.slug}`}
                  className="mt-4 w-full h-9 rounded-xl bg-white/5 hover:bg-white text-zinc-400 hover:text-zinc-950 border border-white/5 hover:border-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-98 shadow-md"
                >
                  <Compass className="h-3.5 w-3.5 text-brand-cyan" /> View Experience
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Explore More Button */}
      <div className="flex justify-center mt-12">
        <Link href="/experiences" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]">
          <Compass className="h-4 w-4 text-brand-cyan animate-pulse" />
          Explore More
        </Link>
      </div>
    </section>
  );
}
