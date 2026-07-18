"use client";

import React from "react";
import { motion } from "framer-motion";
import CategoryBento from "./hero/CategoryBento";
import ExperienceSlideshow from "./hero/ExperienceSlideshow";
import { Compass, Search, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <div 
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-start lg:justify-center overflow-hidden bg-brand-bg select-none pt-24 lg:pt-0 pb-12 lg:pb-0"
      id="hero"
    >
      {/* Background elements are handled within the slideshow on desktop for seamless transitions */}
      <div className="lg:hidden absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-brand-indigo/10 blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1440px] px-0 lg:px-12 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 lg:gap-16 lg:h-[75vh] max-h-[850px] lg:mt-8">
        
        {/* Left Side: Discovery Hub */}
        <div className="w-full lg:flex-1 flex flex-col justify-center">
          <CategoryBento />
        </div>

        {/* Right Side: Dynamic Slideshow (Desktop) / Featured Slider (Mobile) */}
        <div className="w-full lg:flex-1 h-full flex flex-col justify-center">
          <ExperienceSlideshow />
        </div>

      </div>

      {/* Mobile Floating Bottom Action Row */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
        className="lg:hidden fixed bottom-6 left-4 right-4 z-50 glass-panel bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl"
      >
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-brand-cyan">
          <Compass className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-zinc-400 hover:text-white transition-colors">
          <Search className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Search</span>
        </button>
        <div className="flex-1 flex justify-center -mt-8 relative z-50">
          <button className="h-14 w-14 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-xl shadow-brand-indigo/30 border-4 border-[#0B0B0B]">
            <Sparkles className="h-6 w-6 text-white" />
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-zinc-400 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Categories</span>
        </button>
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-zinc-400 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="text-[9px] font-bold uppercase tracking-wider">Near Me</span>
        </button>
      </motion.div>
    </div>
  );
}
