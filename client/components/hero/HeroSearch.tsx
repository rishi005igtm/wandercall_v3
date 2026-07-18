"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSearch({ isMobile }: { isMobile: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
      className={`relative group w-full ${isMobile ? "px-4 mt-4" : "max-w-md mb-6"}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan rounded-full blur-md opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
      <div className="relative flex items-center w-full h-12 rounded-full glass-panel border border-white/10 bg-black/40 px-4 transition-all focus-within:border-brand-indigo/50 focus-within:bg-black/60 shadow-xl">
        <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-brand-indigo transition-colors" />
        <input 
          type="text" 
          placeholder="What experience are you looking for?" 
          className="w-full h-full bg-transparent border-none outline-none px-3 text-sm text-white placeholder:text-zinc-500 font-medium"
        />
        <button className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/30 transition-colors border border-brand-indigo/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
          <Sparkles className="h-3 w-3" />
          <span className="hidden sm:inline">AI Suggest</span>
          <span className="inline sm:hidden">AI</span>
        </button>
      </div>
    </motion.div>
  );
}
