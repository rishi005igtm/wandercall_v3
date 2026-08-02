"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Star,
  MapPin,
  Clock,
  Flame,
  Compass,
  Heart,
  ArrowRight
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
    },
    {
      id: "exp-5",
      title: "Gokarna Cliff Trek & Beach Camping",
      category: "Camping",
      rating: 4.9,
      reviewsCount: 84,
      location: "Gokarna, Karnataka",
      duration: "2 Days",
      difficulty: "Medium",
      price: 3200,
      image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-cyan hover:border-cyan-500/30",
      description: "Hike along rugged coastline cliffs connecting Kudle and Paradise beaches. Enjoy fireside storytelling, beachside camping, and a breathtaking sunrise trek.",
      slug: "gokarna-cliff-trek-beach-camping"
    },
    {
      id: "exp-6",
      title: "Kudremukh Peak Monsoon Ascent",
      category: "Trekking",
      rating: 4.8,
      reviewsCount: 120,
      location: "Chikmagalur, Karnataka",
      duration: "2 Days",
      difficulty: "Hard",
      price: 2500,
      image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-emerald hover:border-emerald-500/30",
      description: "Ascend the iconic horse-faced peak amidst thick monsoon fog, cascading waterfalls, and rolling lush green grasslands of the Western Ghats.",
      slug: "kudremukh-peak-monsoon-ascent"
    },
    {
      id: "exp-7",
      title: "Varkala Cliff Surfing & Yoga",
      category: "Retreats",
      rating: 4.75,
      reviewsCount: 110,
      location: "Varkala, Kerala",
      duration: "3 Days",
      difficulty: "Easy",
      price: 4200,
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-indigo hover:border-indigo-500/30",
      description: "Unwind at a cliffside surfing and yoga sanctuary. Ride beginner-friendly waves, practice sunset meditation, and enjoy healthy local smoothie bowls.",
      slug: "varkala-cliff-surfing-yoga"
    },
    {
      id: "exp-8",
      title: "Zanskar Frozen River Chadar Trek",
      category: "Trekking",
      rating: 5.0,
      reviewsCount: 312,
      location: "Leh, Ladakh",
      duration: "8 Days",
      difficulty: "Extreme",
      price: 24000,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      glow: "shine-card-rose hover:border-rose-500/30",
      description: "Embark on the ultimate high-altitude winter trek over the frozen Zanskar river. Sleep in caves, withstand sub-zero temperatures, and walk on ice shelves.",
      slug: "zanskar-frozen-river-chadar-trek"
    }
  ];

  // Simulate loading for skeleton
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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
    <section
      className="relative py-10 lg:py-24 px-6 md:px-12 bg-transparent max-w-[1440px] mx-auto w-full"
      id="experiences"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 mb-4">
            <Flame className="h-4 w-4 text-brand-indigo" />
            <span className="text-xs font-semibold text-brand-indigo uppercase tracking-wider">
              Highly Demanded Memories
            </span>
          </div>
          <h2 className="text-2xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Trending Adventures
          </h2>
        </div>
      </div>

      {/* Grid Layout (Fixed 8 Items, Responsive Rows) */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <TrendingSkeletonCard key={i} />)
          : experiences.map((exp) => {
            const isWishlisted = wishlist.includes(exp.id);
            return (
              <Link key={exp.id} href={`/experiences/${exp.slug}`} className="block">
                <motion.div
                  className={`min-h-[220px] sm:min-h-[380px] rounded-2xl sm:rounded-3xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden group/card transition-all duration-300 shine-card ${exp.glow} sm:hover:-translate-y-1.5`}
                >
                  {/* Thumbnail Zone */}
                  <div className="h-32 sm:h-44 w-full relative overflow-hidden bg-zinc-950 shrink-0">
                    <img src={exp.image} alt={exp.title} className="w-full h-full object-cover sm:group-hover/card:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Header overlay */}
                    <div className="absolute top-2 sm:top-3.5 left-2 sm:left-3.5 right-2 sm:right-3.5 flex justify-end sm:justify-between items-center z-10">
                      <span className="hidden sm:inline-block text-[9px] font-bold text-gray-900 bg-white px-2 py-0.5 rounded-full uppercase tracking-wider border border-gray-200 shadow-sm">
                        {exp.category}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="flex items-center gap-1 bg-white px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold text-brand-amber border border-gray-200 shadow-sm h-6 sm:h-7">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-brand-amber text-brand-amber" />
                          {exp.rating}
                        </div>
                        <button suppressHydrationWarning
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(exp.id);
                          }}
                          className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center border transition-all cursor-pointer bg-white/80 shadow-sm ${isWishlisted
                              ? "bg-rose-500 border-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30"
                              : "bg-white/90 border-gray-200 text-gray-500 hover:bg-white hover:text-rose-500"
                            }`}
                        >
                          <Heart className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Card Area */}
                  <div className="p-3 sm:p-5 flex flex-col justify-between flex-1 text-left">
                    <div>
                      <h3 className="text-[11px] sm:text-sm font-black text-gray-900 leading-snug sm:group-hover/card:text-brand-indigo transition-colors line-clamp-2 sm:line-clamp-1 uppercase tracking-tight">
                        {exp.title}
                      </h3>
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-gray-500 mt-1.5 mb-3">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{exp.location}</span>
                      </div>
                      <p className="hidden sm:block text-[11px] text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {exp.description}
                      </p>
                    </div>

                    {/* Detail Metrics - Desktop */}
                    <div className="hidden sm:flex items-center justify-between pt-4 border-t border-gray-100 mt-5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 font-mono">
                          <Clock className="h-3.5 w-3.5" />
                          {exp.duration}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${getDifficultyStyles(exp.difficulty)}`}>
                          {exp.difficulty}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 block leading-none">Starts At</span>
                        <span className="text-xs font-black text-gray-900 mt-1 block">₹{exp.price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* View Experience CTA - Desktop */}
                    <div
                      className="hidden sm:flex mt-4 w-full h-9 rounded-xl bg-[#222] sm:group-hover/card:bg-brand-indigo text-white border border-[#222] sm:group-hover/card:border-brand-indigo text-[10px] font-black uppercase tracking-widest transition-all duration-300 items-center justify-center gap-1.5 active:scale-98 shadow-sm shrink-0"
                    >
                      <Compass className="h-3.5 w-3.5 text-white" /> View Experience
                    </div>

                    <div className="flex sm:hidden items-center justify-between pt-2 mt-auto">
                      <div className="text-left">
                        <span className="text-[8px] font-black uppercase tracking-wider text-gray-500 block leading-none">Starts At</span>
                        <span className="text-[11px] font-black text-brand-indigo mt-0.5 block">₹{exp.price.toLocaleString("en-IN")}</span>
                      </div>
                      <div
                        className="h-6 w-6 rounded-full bg-brand-indigo flex items-center justify-center border border-brand-indigo shadow-sm"
                      >
                        <ArrowRight className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
      </div>

      {/* Explore More Button */}
      <div className="flex justify-center mt-10 sm:mt-12 w-full">
        <Link href="/experiences" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm">
          <Compass className="h-4 w-4 text-brand-indigo animate-pulse" />
          Explore More
        </Link>
      </div>
    </section>
  );
}

function TrendingSkeletonCard() {
  return (
    <div className="min-h-[380px] rounded-3xl bg-white border border-gray-100 flex flex-col justify-between overflow-hidden shadow-sm animate-pulse">
      {/* Thumbnail Zone */}
      <div className="h-44 w-full relative bg-gray-100 border-b border-gray-100 shrink-0">
        <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
          <div className="h-4 w-20 bg-gray-200 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-12 bg-gray-200 rounded-full" />
            <div className="h-7 w-7 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Metadata Card Area */}
      <div className="p-5 flex flex-col justify-between flex-1 text-left">
        <div>
          <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2" />
          <div className="flex items-center gap-1 mt-1.5 mb-3">
            <div className="h-3.5 w-3.5 bg-gray-200 rounded-sm shrink-0" />
            <div className="h-3 w-1/2 bg-gray-200 rounded-sm" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 w-full bg-gray-200 rounded-sm" />
            <div className="h-2.5 w-5/6 bg-gray-200 rounded-sm" />
          </div>
        </div>

        {/* Detail Metrics */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-14 bg-gray-200 rounded-full" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="h-2 w-10 bg-gray-200 rounded-sm" />
            <div className="h-3 w-14 bg-gray-200 rounded-sm" />
          </div>
        </div>

        {/* View Experience CTA */}
        <div className="mt-4 w-full h-9 rounded-xl bg-gray-100 shrink-0" />
      </div>
    </div>
  );
}
