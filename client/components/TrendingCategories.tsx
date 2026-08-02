"use client";

import React from "react";
import { HERO_CATEGORIES } from "@/data/heroData";
import { motion } from "framer-motion";
import { Flame, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TrendingCategories() {
  // Take the top categories for this section
  const trendingCats = HERO_CATEGORIES.slice(0, 8);

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 py-12" id="trending-categories">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-sm md:text-base font-extrabold tracking-widest text-gray-900 uppercase">
            Trending Categories
          </h2>
        </div>
        <Link href="/experiences" className="hidden md:flex text-sm font-bold text-brand-indigo hover:text-brand-purple items-center gap-1 transition-colors">
          View all categories <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div key="trending-scroll-fix" className="flex md:grid overflow-x-auto overflow-y-hidden md:overflow-visible grid-cols-1 md:grid-cols-4 gap-4 pt-2 pb-6 md:py-0 snap-x snap-mandatory hide-scrollbar">
        {trendingCats.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative cursor-pointer flex-shrink-0 w-40 md:w-auto h-36 md:h-40 snap-start md:snap-align-none rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group flex flex-col justify-between p-3"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0 bg-black">
                <Image 
                  src={cat.image} 
                  alt={cat.name} 
                  fill 
                  className="object-cover opacity-50 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700" 
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              
              {/* Vibrant Gradient Overlay */}
              <div className={`absolute inset-0 z-0 opacity-60 bg-gradient-to-br ${cat.color}`} />
              <div className={`absolute inset-0 z-0 opacity-40 bg-gradient-to-t from-black/80 to-transparent`} />

              {/* Top Section with Icon */}
              <div className="relative z-10 w-full flex items-start justify-between">
                <div className={`p-1.5 rounded-full bg-white/30 shadow-sm w-max`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 w-full flex flex-col gap-1">
                <h3 className="font-extrabold text-white text-base md:text-lg tracking-tight drop-shadow-md leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-white/80 font-medium">
                  {cat.count} experiences
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
