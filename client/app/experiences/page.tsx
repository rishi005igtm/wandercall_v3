"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Compass,
  MapPin,
  Clock,
  Star,
  Flame,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Zap,
  Calendar,
  DollarSign,
  Award,
  ChevronDown,
  Heart
} from "lucide-react";

// Interfaces
interface ExperienceItem {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  price: number; // in numerical format for filtering
  image: string;
  glow: string;
  description: string;
  slug: string;
}

// Full Mock Experiences Catalog
const experiencesCatalog: ExperienceItem[] = [
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
    title: "Valley of Flowers Botanical Hike",
    category: "Trekking",
    rating: 4.9,
    reviewsCount: 63,
    location: "Chamoli, Uttarakhand",
    duration: "6 Days",
    difficulty: "Hard",
    price: 9500,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=600&auto=format&fit=crop",
    glow: "shine-card-purple hover:border-purple-500/30",
    description: "Walk through UNESCO world heritage flower meadows in peak bloom. Encounter alpine streams, glacier views, and high-altitude floral biodiversity.",
    slug: "valley-of-flowers-botanical-hike"
  },
  {
    id: "exp-8",
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
    id: "exp-9",
    title: "Coorg Coffee Plantation Trail",
    category: "Cultural",
    rating: 4.6,
    reviewsCount: 45,
    location: "Madikeri, Coorg",
    duration: "1 Day",
    difficulty: "Easy",
    price: 1200,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
    glow: "shine-card-cyan hover:border-cyan-500/30",
    description: "Take a walking tour of shade-grown organic coffee plantations. Learn roasting techniques by hand and taste freshly brewed estate espresso.",
    slug: "coorg-coffee-plantation-trail"
  },
  {
    id: "exp-10",
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

export default function ExperiencesPage() {
  // Filters states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [priceRange, setPriceRange] = useState(25000);
  const [activeSort, setActiveSort] = useState("Popularity");
  
  // Wishlist local state tracking
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  
  // Categories list derived from catalog
  const categories = ["All", "Water Sports", "Adventure", "Camping", "Trekking", "Retreats", "Cultural"];
  const difficulties = ["All", "Easy", "Medium", "Hard", "Extreme"];

  // Filtered and Sorted catalog
  const processedCatalog = useMemo(() => {
    let list = [...experiencesCatalog];

    // Search query match
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (exp) =>
          exp.title.toLowerCase().includes(q) ||
          exp.location.toLowerCase().includes(q) ||
          exp.category.toLowerCase().includes(q)
      );
    }

    // Category match
    if (activeCategory !== "All") {
      list = list.filter((exp) => exp.category === activeCategory);
    }

    // Difficulty match
    if (activeDifficulty !== "All") {
      list = list.filter((exp) => exp.difficulty === activeDifficulty);
    }

    // Price range match
    list = list.filter((exp) => exp.price <= priceRange);

    // Sorting logic
    if (activeSort === "Price: Low to High") {
      list.sort((a, b) => a.price - b.price);
    } else if (activeSort === "Price: High to Low") {
      list.sort((a, b) => b.price - a.price);
    } else if (activeSort === "Rating") {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [searchQuery, activeCategory, activeDifficulty, priceRange, activeSort]);

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
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      <Navbar showFilterButton onFilterToggle={() => setShowMobileFilters((prev) => !prev)} />

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-20 px-4 md:px-12">
        
        {/* Banner Section */}
        <div className="w-full max-w-[1440px] text-center md:text-left mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4 animate-pulse">
            <Compass className="h-4 w-4 text-brand-cyan" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
              Adventure Directory
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Explore Outdoor Experiences
          </h1>
          <p className="text-sm text-zinc-400 font-medium mt-2 max-w-xl">
            Book curated adventure stories, treks, camps, and water sports guided by certified local hosts. Filter your way to the next thrill.
          </p>
        </div>

        {/* Directory Dashboard */}
        <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS CONTROLS */}
          <aside className={`w-full lg:w-[320px] glass-panel p-5 md:p-6 rounded-3xl flex-col gap-6 sticky top-28 shrink-0 lg:flex ${showMobileFilters ? "flex" : "hidden"}`}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-brand-cyan" />
                Filter Options
              </span>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                  setActiveDifficulty("All");
                  setPriceRange(25000);
                  setActiveSort("Popularity");
                }}
                className="text-[10px] font-mono font-bold text-zinc-500 hover:text-white transition-colors"
              >
                Reset All
              </button>
            </div>

            {/* Keyword Search */}
            <div className="hidden md:flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Keyword Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gokarna, Hampi, Diving..."
                  className="w-full h-10 bg-zinc-950/50 border border-white/5 rounded-xl pl-10 pr-4 text-xs text-white outline-none focus:border-brand-cyan transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            {/* Category Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Adventure Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer ${
                      activeCategory === cat
                        ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-black"
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Difficulty Level</label>
              <div className="flex flex-wrap gap-1.5">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setActiveDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      activeDifficulty === diff
                        ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple font-black"
                        : "bg-white/[0.01] border-white/5 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget Limit */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                <span>Max Budget Limit</span>
                <span className="text-brand-cyan">₹{priceRange.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                className="w-full accent-brand-cyan h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-bold font-mono">
                <span>₹1,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Sort By</label>
              <div className="relative">
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="w-full h-10 bg-zinc-950/50 border border-white/5 rounded-xl px-3 text-xs text-zinc-300 font-bold outline-none cursor-pointer hover:border-white/10 transition-colors"
                >
                  <option value="Popularity">Popularity</option>
                  <option value="Rating">Rating Score</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* RIGHT PANELS: EXPERIENCES GRID */}
          <div className="flex-1 w-full flex flex-col gap-6">
            
            {/* Catalog Info Bar */}
            <div className="w-full flex items-center text-xs text-zinc-500 font-mono font-bold uppercase tracking-wider bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
              <span>Verified Adventures: {processedCatalog.length}</span>
            </div>

            {/* Main responsive grid columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full items-stretch">
              <AnimatePresence mode="popLayout">
                {processedCatalog.map((exp) => {
                  const isWishlisted = wishlist.includes(exp.id);
                  return (
                    <motion.div
                      key={exp.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className={`glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group/card transition-all duration-300 shine-card ${exp.glow}`}
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
              </AnimatePresence>
            </div>

            {/* Empty state panel */}
            {processedCatalog.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 border border-white/5 bg-white/[0.01] rounded-3xl max-w-md mx-auto my-12 text-center shadow-lg w-full">
                <div className="h-12 w-12 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 mb-4 animate-bounce">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">No experiences matches</h3>
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed mt-2 px-6">
                  We couldn't find any verified adventures matching your exact filters. Try relaxing your budget or query constraint!
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                    setActiveDifficulty("All");
                    setPriceRange(25000);
                  }}
                  className="mt-5 h-9 px-5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-black uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  Clear Search Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
}
