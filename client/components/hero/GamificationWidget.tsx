"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award, Flame } from "lucide-react";

export default function GamificationWidget() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-6 p-4 rounded-2xl glass-panel border border-brand-amber/30 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center relative">
          <Award className="h-5 w-5 text-brand-amber" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-brand-indigo rounded-full border border-black flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">4</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-amber">Explorer Level</p>
          <p className="text-sm font-bold text-white">Island Specialist</p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center justify-end gap-1 mb-1">
          <Flame className="h-3 w-3 text-brand-amber" />
          <span className="text-[10px] font-bold text-white">3 Day Streak</span>
        </div>
        <div className="h-1.5 w-24 bg-black/50 rounded-full overflow-hidden border border-white/5">
          <div className="h-full bg-gradient-to-r from-brand-amber to-brand-emerald w-[75%]" />
        </div>
      </div>
    </motion.div>
  );
}
