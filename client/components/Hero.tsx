"use client";

import React from "react";
import { motion } from "framer-motion";
import CategoryBento from "./hero/CategoryBento";
import ExperienceSlideshow from "./hero/ExperienceSlideshow";
import { Compass, Search, Sparkles, Home, Radio } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  return (
    <div 
      className="relative min-h-[auto] lg:min-h-[100dvh] w-full flex flex-col items-center justify-start lg:justify-center overflow-hidden bg-brand-bg select-none pt-24 lg:pt-0 pb-12 lg:pb-0"
      id="hero"
    >
      {/* Background elements are handled within the slideshow on desktop for seamless transitions */}
      <div className="lg:hidden absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-96 bg-brand-indigo/10 blur-[100px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[1440px] px-0 lg:px-6 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-6 lg:gap-8 lg:h-[75vh] max-h-[850px] lg:mt-8">
        
        {/* Left Side: Discovery Hub */}
        <div className="w-full lg:flex-1 flex flex-col justify-center">
          <CategoryBento />
        </div>

        {/* Right Side: Dynamic Slideshow (Desktop) / Featured Slider (Mobile) */}
        <div className="w-full lg:flex-1 h-full flex flex-col justify-center">
          <ExperienceSlideshow />
        </div>

      </div>
    </div>
  );
}
