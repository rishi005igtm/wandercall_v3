"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_SLIDES } from "@/data/heroData";
import { MapPin, Star, ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[currentIndex];

  return (
    <div className="relative w-full lg:h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden bg-[#111] select-none rounded-b-[24px] lg:rounded-b-[50px]">
      
      {/* Background Image Panel (Right side or Full depending on mobile) */}
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {slide.image.startsWith('http') ? (
              <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <Image src={slide.image} alt={slide.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Full Width Gradient Overlay spanning both panels */}
      {/* This creates the seamless transition across the seam */}
      <div className="absolute inset-0 z-[5] bg-gradient-to-t lg:bg-gradient-to-r from-[#111] via-[#111]/95 lg:via-[#111] to-transparent lg:to-transparent pointer-events-none" />

      {/* Decorative Blur Elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[6]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none z-[6]" />

      {/* Content Container (z-10 to be above the overlay) */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row pointer-events-none">
        
        {/* Left Side Content */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-end lg:justify-center pt-24 pb-24 lg:pb-8 px-6 md:px-16 lg:px-24 pointer-events-auto">
          <div className="relative z-10 w-full flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 inline-flex items-center gap-2"
            >
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 uppercase tracking-widest backdrop-blur-md">
                Discover. Book. Explore.
              </span>
            </motion.div>

            <div className="relative h-[340px] md:h-[300px] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 flex flex-col justify-end lg:justify-center"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold uppercase tracking-widest text-brand-cyan drop-shadow-md">
                      {slide.category}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-white/50" />
                    <span className="flex items-center gap-1 text-sm font-bold text-brand-amber drop-shadow-md">
                      <Star className="h-4 w-4 fill-brand-amber" />
                      {slide.rating}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3 drop-shadow-xl pr-4">
                    {slide.title}
                  </h1>
                  
                  <p className="text-base text-zinc-300 font-medium flex items-center gap-2 drop-shadow-md mb-6">
                    <MapPin className="h-4 w-4 text-brand-indigo" />
                    {slide.location}
                  </p>

                  <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest">Starts At</span>
                      <span className="text-xl md:text-2xl font-black text-white">{slide.price}</span>
                    </div>
                    <button suppressHydrationWarning className="bg-white text-indigo-950 font-bold px-6 lg:px-8 py-3 lg:py-3.5 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 text-sm lg:text-base whitespace-nowrap">
                      View <span className="hidden sm:inline">Experience</span> <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 lg:bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-24 lg:-translate-x-0 flex items-center gap-4 z-20 pointer-events-auto">
            <div className="flex gap-2 mr-4">
              {HERO_SLIDES.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? "w-8 bg-white" : "w-3 bg-white/30"}`} />
              ))}
            </div>
            <button suppressHydrationWarning onClick={handlePrev} className="h-10 w-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button suppressHydrationWarning onClick={handleNext} className="h-10 w-10 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right Side Content (Empty space) */}
        <div className="w-full lg:w-1/2 h-full hidden lg:block"></div>
      </div>
    </div>
  );
}
