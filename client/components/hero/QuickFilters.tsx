"use client";

import React from "react";
import { QUICK_FILTERS } from "@/data/heroData";
import { motion } from "framer-motion";

export default function QuickFilters({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="w-full px-4 mt-2">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Quick Filters</h3>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_FILTERS.slice(0, 5).map((filter, i) => (
            <button key={i} className="px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-300 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-2">Quick Explorer Filters</h3>
      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((filter, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + (i * 0.02) }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-300 bg-black/40 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95"
          >
            {filter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
