"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Search, Sparkles, Send, MapPin, Star, Clock } from "lucide-react";

interface ExperienceResult {
  id: string;
  title: string;
  category: string;
  location: string;
  rating: number;
  duration: string;
  price: string;
  description: string;
}

export default function AIDiscovery() {
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExperienceResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const suggestions = [
    { label: "Adventure", text: "I want an adrenaline-pumping weekend adventure in the mountains." },
    { label: "Romantic", text: "Suggest a cozy sunset date experience near the beach." },
    { label: "Learning", text: "I want to learn a cool local craft or culinary skill." },
    { label: "Creative", text: "Find a creative photography walkthrough or painting campfire." },
    { label: "Social", text: "Looking for an energetic nightlife crawl or group gaming event." },
    { label: "Relaxing", text: "Suggest a peaceful wellness retreat or forest therapy walk." }
  ];

  const db: Record<string, ExperienceResult[]> = {
    adventure: [
      { id: "1", title: "White Water Rafting in Rishikesh", category: "Adventure", location: "Uttarakhand", rating: 4.9, duration: "4 hours", price: "₹2,500", description: "Conquer rapid currents and navigate steep river turns with professional guides." },
      { id: "2", title: "Midnight Trekking & Peak Camping", category: "Adventure", location: "Kasol, HP", rating: 4.8, duration: "1.5 Days", price: "₹3,800", description: "Climb past pine valleys and camp directly under the stellar Milky Way belt." }
    ],
    romantic: [
      { id: "3", title: "Private Yacht Sunset Sailboat Cruise", category: "Travel", location: "Gateway of India, Mumbai", rating: 4.7, duration: "2 hours", price: "₹9,500", description: "Sail across peaceful sea tides, enjoy complimentary bubbly, and view Mumbais coastline." },
      { id: "4", title: "Candle-lit Beach Cabin Dinner", category: "Food", location: "Palolem, Goa", rating: 4.9, duration: "3 hours", price: "₹5,000", description: "Enjoy authentic seafood grills at a private beach cabana with live string acoustic music." }
    ],
    learning: [
      { id: "5", title: "Artisan Woodworking & Carpentry Masterclass", category: "Learning", location: "Bangalore", rating: 4.8, duration: "6 hours", price: "₹1,800", description: "Cut, sand, and build your own custom coffee holder with seasoned carpenters." },
      { id: "6", title: "Authentic South Indian Culinary Walk", category: "Food", location: "Madurai", rating: 4.9, duration: "4 hours", price: "₹1,200", description: "Discover heritage recipes, spice grind houses, and eat hot parotta direct from pan stoves." }
    ],
    creative: [
      { id: "7", title: "Street Photography & Night Composition Workshop", category: "Photography", location: "Chandni Chowk, Delhi", rating: 4.6, duration: "3 hours", price: "₹1,500", description: "Capture heritage shadows, fast motion rickshaws, and master low-light camera filters." }
    ],
    social: [
      { id: "8", title: "Secret Rooftop Acoustic Campfire Session", category: "Storytelling", location: "Pune", rating: 4.9, duration: "4 hours", price: "₹800", description: "Join local travelers, share road trip stories, and jam to acoustic guitar sessions." }
    ],
    relaxing: [
      { id: "9", title: "Ancient Yoga Meditation & Sound Healing", category: "Wellness", location: "Varkala, Kerala", rating: 4.9, duration: "3 hours", price: "₹1,400", description: "Realign sensory chakras using heavy Tibetan brass bowls overlooking ocean cliffs." }
    ]
  };

  const handleSuggestionClick = (text: string, category: string) => {
    setInputValue(text);
    triggerSearch(category.toLowerCase());
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Direct classification fallback
    const text = inputValue.toLowerCase();
    let category = "adventure";
    if (text.includes("date") || text.includes("sunset") || text.includes("romantic")) category = "romantic";
    else if (text.includes("learn") || text.includes("cook") || text.includes("skill")) category = "learning";
    else if (text.includes("photo") || text.includes("creative") || text.includes("art")) category = "creative";
    else if (text.includes("social") || text.includes("music") || text.includes("group")) category = "social";
    else if (text.includes("peace") || text.includes("relax") || text.includes("retreat")) category = "relaxing";

    triggerSearch(category);
  };

  const triggerSearch = (category: string) => {
    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    setTimeout(() => {
      const results = db[category] || db["adventure"];
      setSearchResults(results);
      setIsSearching(false);
    }, 1400); // Typwriter AI search load lag
  };

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="ai-assistant">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.03)_0%,_transparent_65%)] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 mb-6">
          <Sparkles className="h-4 w-4 text-brand-purple animate-pulse" />
          <span className="text-xs font-semibold text-brand-purple tracking-wide">
            Cognitive Exploration Discovery
          </span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          What do you want to <span className="text-gradient-brand">experience</span> today?
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mb-12 leading-relaxed">
          Ask our AI assistant using natural prompts. Discover off-beat schedules, find social events, or align a custom itinerary.
        </p>

        {/* Massive input container */}
        <form 
          onSubmit={handleFormSubmit}
          className="w-full relative glass-panel glass-glow-purple rounded-3xl p-2 flex items-center gap-2 border border-white/10 mb-6"
        >
          <div className="flex-1 flex items-center pl-4">
            <Search className="h-5 w-5 text-zinc-500 mr-3" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. Find me a thrilling group watersport session in North Goa next weekend..."
              className="w-full bg-transparent border-none text-white text-sm md:text-base placeholder-zinc-500 focus:outline-none focus:ring-0 py-3"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-6 rounded-2xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white flex items-center justify-center gap-2 text-sm font-bold tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        {/* Suggestion list */}
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mb-16">
          {suggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSuggestionClick(item.text, item.label)}
              className="text-xs px-4 py-2 rounded-full bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Recommendations Display */}
        <div className="w-full min-h-[160px] relative">
          <AnimatePresence mode="wait">
            {isSearching && (
              <motion.div
                key="searching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-8"
              >
                <div className="flex items-center gap-1.5 justify-center">
                  <div className="h-2 w-2 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: "0s" }} />
                  <div className="h-2 w-2 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="h-2 w-2 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">
                  Querying vector database for recommendations...
                </span>
              </motion.div>
            )}

            {!isSearching && hasSearched && searchResults.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left"
              >
                {searchResults.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl glass-panel border-white/5 flex flex-col justify-between hover:border-brand-purple/20 transition-all shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-brand-purple">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-brand-amber">
                          <Star className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" />
                          {item.rating}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-xs text-zinc-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {item.duration}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-semibold text-zinc-500">Price</p>
                        <p className="text-base font-black text-white">{item.price}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isSearching && hasSearched && searchResults.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-zinc-500 text-sm font-semibold py-8"
              >
                No matches found. Try another prompt or click a suggestion.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
