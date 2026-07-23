"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Compass,
  Users,
  ShieldCheck,
  Globe,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Zap,
  Award,
  ChevronRight,
  Star,
  Heart,
  Target,
  Eye,
  Rocket,
  Calendar,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"mission" | "vision" | "values">("mission");
  const [hoveredBento, setHoveredBento] = useState<number | null>(null);

  const stats = [
    { value: "50,000+", label: "Active Explorers", icon: Users, change: "+120% this year" },
    { value: "1,400+", label: "Verified Experiences", icon: Compass, change: "140+ countries" },
    { value: "99.4%", label: "Trek Success Rate", icon: Award, change: "Bank-grade trust" },
    { value: "4.95 / 5", label: "Explorer Rating", icon: Star, change: "12,000+ reviews" },
  ];

  const milestones = [
    {
      year: "2023",
      title: "The Mountain Summit Spark",
      subtitle: "Patagonia Experience",
      description: "Founded by alpine mountaineers who realized modern travel apps lacked real-time connection and authentic experience coordination.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
      tag: "Founding Story"
    },
    {
      year: "2024",
      title: "Real-Time Experience Engine",
      subtitle: "Live Experience Booking",
      description: "Pioneered live experience planning — allowing travelers across 6 continents to discover vetted trips and connect with elite hosts.",
      image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1000&auto=format&fit=crop",
      tag: "Platform Launch"
    },
    {
      year: "2025",
      title: "Travel DNA Algorithm",
      subtitle: "AI Compatibility Engine",
      description: "Introduced deep travel DNA matching, connecting explorers based on pace, risk tolerance, terrain preference, and shared quest goals.",
      image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000&auto=format&fit=crop",
      tag: "AI Innovation"
    },
    {
      year: "2026",
      title: "Global Experience Mesh",
      subtitle: "Next-Gen Wandercall v3",
      description: "Scaling to over 50,000 explorers with ultra-low latency realtime chat, multi-region Redis orchestration, and instant host bookings.",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop",
      tag: "Global Scale"
    }
  ];

  const bentoCards = [
    {
      id: 2,
      title: "Direct Host & Experience Messaging",
      category: "Realtime Connection",
      description: "Connect directly with verified trip hosts and message your experience team before departing.",
      image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800&auto=format&fit=crop",
      colSpan: "col-span-1",
      badge: "INSTANT CONNECT",
      accent: "from-brand-amber/80 to-rose-600/80"
    },
    {
      id: 3,
      title: "Precision Travel DNA Matching",
      category: "Algorithmic Synergy",
      description: "Match with adventure partners who share your travel pace, budget, and curiosity index.",
      image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800&auto=format&fit=crop",
      colSpan: "col-span-1",
      badge: "DNA ENGINE",
      accent: "from-brand-purple/80 to-indigo-600/80"
    },
    {
      id: 4,
      title: "Bank-Grade Host Verification & Security",
      category: "Enterprise Trust",
      description: "100% identity-checked hosts with guaranteed refund protection and 24/7 global safety dispatch.",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop",
      colSpan: "col-span-1",
      badge: "SAFETY FIRST",
      accent: "from-emerald-500/80 to-teal-600/80"
    }
  ];

  const tabContents = {
    mission: {
      title: "Uniting Humanity Through Real Exploration",
      description: "Our mission is to empower global travelers by building the world's most intelligent adventure & experience booking platform. We enable seamless discovery of bucket-list journeys.",
      icon: Target,
      bullets: [
        "Democratize access to remote, bucket-list experiences.",
        "Foster genuine human connection before, during, and after every trip.",
        "Promote sustainable, leave-no-trace eco-tourism globally."
      ]
    },
    vision: {
      title: "The Future of Distributed Global Travel",
      description: "We envision a world where anyone, anywhere can find trusted adventure partners in seconds, step out of their comfort zone, and return with unforgettable memories.",
      icon: Eye,
      bullets: [
        "Verified high-altitude & wilderness experiences across over 140 countries.",
        "AI-assisted itinerary generation tailored to your exact endurance profile.",
        "Direct economic empowerment for local wilderness guides."
      ]
    },
    values: {
      title: "Uncompromising Quality & Radical Authenticity",
      description: "We operate on core engineering and human principles that prioritize user safety, privacy, immersive design, and booking transparency above all else.",
      icon: Rocket,
      bullets: [
        "Zero generic tourism traps; 100% vetted local experiences.",
        "Sub-millisecond real-time communication infrastructure.",
        "24/7 dedicated explorer support and trip protection."
      ]
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white font-sans flex flex-col selection:bg-brand-cyan selection:text-black relative overflow-x-hidden">
      <Navbar />

      {/* 1. HERO SECTION: Full-Bleed High Impact Image Overlay */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Background Image with Dark Vignette Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop"
            alt="Alpine Mountain Horizon"
            className="w-full h-full object-cover opacity-35 scale-105 animate-pulse transition-transform duration-10000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090e]/90 via-[#07090e]/70 to-[#07090e]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-cyan/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-brand-purple/20 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto text-center space-y-8">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]"
          >
            Where Raw Adventure Meets <br />
            <span className="bg-gradient-to-r from-brand-cyan via-cyan-300 to-brand-purple bg-clip-text text-transparent drop-shadow-2xl">
              Real-Time Human Connection
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal"
          >
            Wandercall is the enterprise-grade adventure & experience network built for bold travelers. Discover curated experiences, match with high-compatibility partners, and coordinate treks in real time.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              href="/experiences"
              className="px-8 py-4 rounded-full bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-sm font-extrabold uppercase tracking-wider shadow-lg shadow-brand-cyan/25 hover:shadow-brand-cyan/40 transition-all duration-300 flex items-center gap-2 group cursor-pointer active:scale-95"
            >
              <span>Explore Experiences</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/experiences"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md text-white text-sm font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Compass className="h-4 w-4 text-brand-cyan" />
              <span>View All Treks</span>
            </Link>
          </motion.div>

          {/* Hero Image Showcase Carousel Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-10 max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.8)] glass-panel bg-zinc-950/60 p-2 sm:p-3">
              <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop"
                  alt="Patagonia Wilderness"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                
                {/* Floating Image Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-white/10 backdrop-blur-xl">
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-10 w-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-brand-cyan" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Torres del Paine Circuit</h4>
                      <p className="text-xs text-zinc-400">Patagonia, Chile • 8 Days • Level 4 Trek</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex -space-x-2">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" className="h-7 w-7 rounded-full border-2 border-zinc-950 object-cover" alt="" />
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" className="h-7 w-7 rounded-full border-2 border-zinc-950 object-cover" alt="" />
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" className="h-7 w-7 rounded-full border-2 border-zinc-950 object-cover" alt="" />
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-full">
                      12 Explorers Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS HIGHLIGHT GRID */}
      <section className="py-12 px-6 md:px-12 max-w-[1280px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-xl hover:border-brand-cyan/40 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-zinc-950 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight">{stat.value}</h3>
                <p className="text-xs font-medium text-zinc-400 mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. VISUAL BENTO GRID: IMAGE-FIRST PLATFORM PILLARS */}
      <section className="py-20 px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full">
            ARCHITECTURE OF ADVENTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Designed For Modern Trailblazers
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            We combined high-definition visual storytelling, real-time messaging technology, and algorithmic compatibility to redefine how humans explore the planet.
          </p>
        </div>

        {/* Bento Grid Layout (3 Column Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px] sm:auto-rows-[320px]">
          {bentoCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: card.id * 0.1 }}
              className={`relative rounded-3xl overflow-hidden border border-white/15 group cursor-pointer ${card.colSpan}`}
              onMouseEnter={() => setHoveredBento(card.id)}
              onMouseLeave={() => setHoveredBento(null)}
            >
              {/* Background Image with Zoom */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent transition-opacity duration-300 ${hoveredBento === card.id ? 'opacity-95' : 'opacity-85'}`} />

              {/* Content Container */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
                <div className="flex items-center justify-between">
                  {card.badge ? (
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest bg-zinc-950/80 border border-white/15 text-white px-3 py-1 rounded-full backdrop-blur-md">
                      {card.badge}
                    </span>
                  ) : <div />}
                  <div className="h-8 w-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:bg-brand-cyan group-hover:text-zinc-950 transition-colors">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                <div className="space-y-2 max-w-xl">
                  {card.category && (
                    <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider block">
                      {card.category}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE TABBED MISSION & VALUES */}
      <section className="py-12 sm:py-20 px-0 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full relative z-10">
        <div className="glass-panel p-0 sm:p-8 lg:p-12 rounded-none sm:rounded-3xl border-x-0 sm:border border-white/15 bg-zinc-950/80 backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Tab Buttons */}
          <div className="lg:col-span-5 space-y-6 px-4 sm:px-0">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full">
                CORE PHILOSOPHY
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-3">
                Why We Built Wandercall
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {(["mission", "vision", "values"] as const).map((tabKey) => {
                const isActive = activeTab === tabKey;
                const tabData = tabContents[tabKey];
                const Icon = tabData.icon;

                return (
                  <button
                    key={tabKey}
                    onClick={() => setActiveTab(tabKey)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                      isActive
                        ? "bg-brand-cyan/10 border-brand-cyan text-white shadow-lg shadow-brand-cyan/10"
                        : "bg-white/[0.02] border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isActive ? "bg-brand-cyan text-zinc-950" : "bg-white/5 text-zinc-400"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-wider capitalize">
                        Our {tabKey}
                      </span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? "rotate-90 text-brand-cyan" : ""}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tab Content Card */}
          <div className="lg:col-span-7 px-4 sm:px-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 rounded-3xl bg-zinc-900/90 border border-white/10 space-y-6"
              >
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">
                    {tabContents[activeTab].title}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {tabContents[activeTab].description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {tabContents[activeTab].bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-zinc-200">
                      <CheckCircle2 className="h-5 w-5 text-brand-cyan shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. TIMELINE: OUR EVOLUTION & MILESTONES */}
      <section className="py-20 px-6 md:px-12 max-w-[1280px] mx-auto w-full space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full">
            OUR CHRONICLE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            The Journey So Far
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            From a Patagonia trail idea to a global experience platform powering thousands of adventures.
          </p>
        </div>

        {/* Timeline Horizontal / Vertical Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel p-5 rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur-xl flex flex-col justify-between hover:border-brand-purple/50 transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Milestone Image */}
                <div className="h-40 w-full rounded-2xl overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-950/80 text-brand-cyan border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                    {item.year}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 block">
                    {item.tag}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. CTA BANNER SECTION */}
      <section className="py-20 px-6 md:px-12 max-w-[1280px] mx-auto w-full relative z-10">
        <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-zinc-950 p-8 sm:p-16 text-center space-y-8 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-cyan/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full">
              JOIN THE MOVEMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready To Start Your Next Quest?
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Step into a worldwide network of verified hosts and trail blazers. Your next extraordinary memory is just one click away.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10 pt-2">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-cyan/30 active:scale-95 transition-all cursor-pointer"
            >
              Create Explorer Account
            </Link>
            <Link
              href="/experiences"
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
            >
              Browse All Experiences
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
