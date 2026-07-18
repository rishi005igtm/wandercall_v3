"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_SLIDES } from "@/data/heroData";
import { Compass, Users, MapPin, CloudSun, Star, Heart } from "lucide-react";
import Image from "next/image";

export default function ExperienceSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentIndex];

  return (
    <>
      {/* Mobile Version */}
      <div className="lg:hidden w-full mt-6 px-4">
        <h3 className="text-sm font-bold text-white mb-3">Featured Experiences</h3>
        <div className="relative w-full h-[340px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {slide.image.startsWith('http') ? (
                <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <Image src={slide.image} alt={slide.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-black/50 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-indigo/30 text-brand-indigo border border-brand-indigo/50 uppercase tracking-widest backdrop-blur-md">
                    {slide.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-emerald/30 text-brand-emerald border border-brand-emerald/50 backdrop-blur-md">
                    {slide.price}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white leading-tight mb-2">{slide.title}</h2>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 text-xs text-zinc-300 font-medium">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{slide.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{slide.slots} Slots</span>
                  </div>
                  <button className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                     <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:flex w-full h-full min-h-[550px] relative rounded-[32px] glass-panel border border-white/10 overflow-hidden shadow-2xl group flex-col justify-end">
        {/* Background Image changes with slide */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${slide.id}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
            {slide.image.startsWith('http') ? (
              <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            )}
            {/* Gradients to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/90 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Area */}
        <div className="relative z-10 w-full p-8 flex flex-col justify-end h-full">
          {/* Top bar indicators */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
            <div className="flex gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-white" : "w-3 bg-white/30"}`} />
              ))}
            </div>
            <button className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors border border-white/20 hover:scale-105">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Dynamic Card Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 mt-auto"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/20 backdrop-blur-md px-3 py-1 rounded-full border border-brand-cyan/30 shadow-lg shadow-brand-cyan/20">
                  {slide.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-amber bg-brand-amber/20 backdrop-blur-md px-3 py-1 rounded-full border border-brand-amber/30">
                  <Star className="h-3 w-3 fill-brand-amber" />
                  {slide.rating}
                </span>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">{slide.title}</h2>
                <p className="text-zinc-200 font-medium flex items-center gap-2 drop-shadow-md">
                  <MapPin className="h-4 w-4 text-brand-indigo" />
                  {slide.location}
                </p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mt-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-default">
                  <CloudSun className="h-5 w-5 text-zinc-300" />
                  <span className="text-[10px] font-bold text-white tracking-wide">{slide.weather}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-default">
                  <Compass className="h-5 w-5 text-brand-emerald" />
                  <span className="text-[10px] font-bold text-white tracking-wide">{slide.difficulty}</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-default">
                  <Users className="h-5 w-5 text-brand-purple" />
                  <span className="text-[10px] font-bold text-white tracking-wide">{slide.slots} Slots</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 transition-colors cursor-default">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Price</span>
                  <span className="text-xs font-black text-white">{slide.price}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4">
                 <button className="flex-1 bg-white text-black font-bold py-3.5 rounded-2xl hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
                    View Experience
                 </button>
                 <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-300 cursor-pointer">
                    <div className={`h-12 w-12 rounded-full border-2 border-zinc-900 ${slide.host.color} flex items-center justify-center font-bold text-white text-sm z-30 shadow-lg`}>{slide.host.initial}</div>
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center font-bold text-white text-sm z-20 shadow-lg">L</div>
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center font-bold text-white text-[10px] z-10 shadow-lg">+4</div>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
