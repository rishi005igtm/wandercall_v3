"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_CATEGORIES } from "@/data/heroData";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import Image from "next/image";

export default function CategoryBento() {
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(HERO_CATEGORIES.length / ITEMS_PER_PAGE);
  const currentCategories = HERO_CATEGORIES.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleNext = () => setPage((p) => (p + 1) % totalPages);
  const handlePrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <>
      <div className="w-full mb-3 px-4 lg:px-0 lg:mb-5 flex items-center justify-between">
        <h2 className="text-xs md:text-sm font-bold tracking-widest text-zinc-300 uppercase flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand-cyan" />
          Discover & Book Real-World Experiences
        </h2>

        {/* Desktop Pagination Controls */}
        {totalPages > 1 && (
          <div className="hidden lg:flex items-center gap-2">
            <button 
              onClick={handlePrev}
              className="h-8 w-8 rounded-full border border-white/10 glass-panel flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNext}
              className="h-8 w-8 rounded-full border border-white/10 glass-panel flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Next categories"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2 w-max px-4">
          {HERO_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 glass-panel hover:bg-white/10 active:scale-95 transition-all whitespace-nowrap`}
              >
                <div className={`p-1 rounded-full bg-gradient-to-br ${cat.color}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-bold text-white">{cat.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block w-full">
        <div className="grid grid-cols-4 gap-2.5">
          {currentCategories.map((cat, i) => {
            const Icon = cat.icon;
            const isLarge = cat.size === "large";
            
            return (
              <motion.div
                key={cat.id}
                layoutId={`cat-${cat.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 
                }}
                className={`
                  relative cursor-pointer group glass-panel rounded-2xl overflow-hidden border border-white/10 shine-card flex flex-col justify-between
                  ${isLarge ? "col-span-2 h-[105px] p-3.5" : "col-span-1 h-[105px] p-3"}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" sizes="(max-width: 1024px) 0vw, 25vw" />
                </div>
                
                {/* Gradients to ensure text visibility */}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className={`absolute inset-0 z-0 opacity-20 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-br ${cat.color}`} />
                
                <div className="flex items-center justify-between z-10 relative mb-auto">
                  <div className={`rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg h-8 w-8`}>
                    <Icon className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
                  {isLarge && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ChevronRight className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>

                <div className="z-10 relative">
                  <h3 className="font-bold text-white tracking-tight text-sm truncate">
                    {cat.name}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
