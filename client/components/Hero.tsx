"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { Sparkles, Play, Compass, Award, ShieldAlert, Heart } from "lucide-react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mobile device optimization check
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parallax scroll effects - will be disabled on mobile
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 400]);
  const yText = useTransform(scrollY, [0, 800], [0, 200]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

  // Framer Motion state-free values for GPU-driven 3D tilt tracking (reduces re-renders to 0 on mousemove)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  useEffect(() => {
    // Disable listener completely on mobile devices
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  // Throttled stats updates to prevent rendering lag
  const [explorers, setExplorers] = useState(8200);
  const [memories, setMemories] = useState(48900);

  useEffect(() => {
    const explorerInterval = setInterval(() => {
      setExplorers((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 5000);

    const memoriesInterval = setInterval(() => {
      setMemories((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);

    return () => {
      clearInterval(explorerInterval);
      clearInterval(memoriesInterval);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen lg:h-screen w-full flex items-center justify-center overflow-hidden bg-brand-bg select-none pt-28 pb-12 lg:py-0"
      id="hero"
    >
      {/* Background Graphic (Next.js optimized Image, conditional parallax) */}
      <motion.div 
        style={{ y: isMobile ? 0 : yBg }}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
      >
        <Image
          src="/hero-bg.png"
          alt="Twilight Coastline Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-102"
          quality={80}
        />
        {/* Cinematic Vignette & Color Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-bg/40 via-brand-bg/70 to-brand-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/90 via-transparent to-brand-bg/90" />
      </motion.div>

      {/* Floating Ambient Glow Fields - Reduced on mobile */}
      {!isMobile && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[15%] w-72 h-72 rounded-full bg-brand-indigo/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[25%] right-[20%] w-96 h-96 rounded-full bg-brand-purple/5 blur-[150px] animate-pulse" />
        </div>
      )}

      {/* Content Area */}
      <motion.div 
        style={{ y: isMobile ? 0 : yText, opacity: isMobile ? 1 : opacityText }}
        className="relative z-10 w-full max-w-[1440px] px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12"
      >
        {/* Left Headline */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-3 md:mb-4 text-white font-sans"
          >
            Discover Experiences <br />
            <span className="text-gradient-brand">Worth Remembering</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-xl text-base text-zinc-400 font-medium mb-6 md:mb-8 leading-relaxed"
          >
            Ditch the screen. Book unique outdoor activities, complete daily challenges, join voice rooms with creators, and lock memories in your digital journal.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <a
              href="#explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-xl shadow-brand-indigo/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="h-4.5 w-4.5" />
              Explore Experiences
            </a>
            <a
              href="#campfires"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-white text-white" />
              Join Community
            </a>
          </motion.div>

          {/* Quick Metrics display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-6 sm:gap-8 justify-center lg:justify-start items-center mt-8 pt-6 md:mt-12 md:pt-8 border-t border-white/5 w-full max-w-xl"
          >
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Explorers</p>
              <p className="text-xl font-black text-white font-mono tracking-tight">
                {explorers.toLocaleString()}+
              </p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Experiences Booked</p>
              <p className="text-xl font-black text-white font-mono tracking-tight">
                500+
              </p>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Memories Logged</p>
              <p className="text-xl font-black text-gradient-brand font-mono tracking-tight">
                {memories.toLocaleString()}+
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right side: 3D interactive floating card ecosystem (hidden on mobile) */}
        {!isMobile && (
          <div className="flex-1 w-full relative h-[450px] hidden lg:flex items-center justify-center">
            {/* Main Floating Glass Card */}
            <motion.div
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                transformStyle: "preserve-3d"
              }}
              className="w-[320px] h-[380px] rounded-3xl glass-panel glass-glow-indigo p-6 flex flex-col justify-between absolute z-20 cursor-grab active:cursor-grabbing will-change-transform"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
            >
              {/* Header info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-brand-cyan">Featured Quest</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-brand-amber bg-brand-amber/10 px-2 py-0.5 rounded-full">
                    <Award className="h-3 w-3" />
                    +120 XP
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-tight mb-2 text-white">Scuba Diving in Netrani Island</h3>
                <p className="text-xs text-zinc-400">Discover coral reefs, swim with sea turtles, and record your adventure.</p>
              </div>

              {/* Visual element placeholder representing premium cards */}
              <div className="h-36 w-full rounded-2xl bg-zinc-950/40 relative overflow-hidden border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950" />
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10">
                  <span className="text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Goa, India
                  </span>
                  <span className="text-xs font-bold text-brand-cyan">
                    2 Slots Left
                  </span>
                </div>
              </div>

              {/* Footer indicators */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-[9px] uppercase font-semibold text-zinc-500">Starts At</p>
                  <p className="text-sm font-black text-white">₹4,999</p>
                </div>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black hover:scale-105 active:scale-95 transition-all">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Subsidiary Floating Badge Card 1 */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [-2, 0, -2]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-[10%] left-[5%] z-30 glass-panel border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg will-change-transform"
            >
              <div className="h-8 w-8 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
                <Compass className="h-4.5 w-4.5 text-brand-cyan" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Explorer Status</p>
                <p className="text-xs font-extrabold text-white">Island Specialist</p>
              </div>
            </motion.div>

            {/* Subsidiary Floating Avatar Card 2 */}
            <motion.div
              animate={{
                y: [0, 8, 0],
                rotate: [1, -1, 1]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute bottom-[12%] right-[5%] z-30 glass-panel border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-lg will-change-transform"
            >
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border border-zinc-950 bg-brand-indigo flex items-center justify-center text-[10px] font-bold text-white">R</div>
                <div className="h-6 w-6 rounded-full border border-zinc-950 bg-brand-purple flex items-center justify-center text-[10px] font-bold text-white">A</div>
                <div className="h-6 w-6 rounded-full border border-zinc-950 bg-brand-cyan flex items-center justify-center text-[10px] font-bold text-white">K</div>
              </div>
              <span className="text-[11px] font-semibold text-zinc-300">
                4 Friends Joined
              </span>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Hero bottom gradient masking */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none z-10" />
    </div>
  );
}
