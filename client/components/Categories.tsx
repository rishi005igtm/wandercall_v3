"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, ShieldAlert, Award, Star, Flame, Waves, BookOpen, Utensils, Camera, Gamepad2, HeartPulse, Moon, Map, Cpu, Palette } from "lucide-react";

export default function Categories() {
  const categories = [
    { name: "Adventure", icon: Flame, color: "from-orange-500/25 to-red-500/5", border: "hover:border-orange-500/30", count: "124 adventures" },
    { name: "Water Sports", icon: Waves, color: "from-cyan-500/25 to-blue-500/5", border: "hover:border-cyan-500/30", count: "82 sessions" },
    { name: "Learning", icon: BookOpen, color: "from-emerald-500/25 to-teal-500/5", border: "hover:border-emerald-500/30", count: "98 classes" },
    { name: "Food", icon: Utensils, color: "from-red-500/25 to-yellow-500/5", border: "hover:border-red-500/30", count: "65 tasting walks" },
    { name: "Photography", icon: Camera, color: "from-blue-500/25 to-indigo-500/5", border: "hover:border-blue-500/30", count: "43 workshops" },
    { name: "Gaming", icon: Gamepad2, color: "from-pink-500/25 to-purple-500/5", border: "hover:border-pink-500/30", count: "29 meets" },
    { name: "Wellness", icon: HeartPulse, color: "from-teal-500/25 to-green-500/5", border: "hover:border-teal-500/30", count: "51 retreats" },
    { name: "Nightlife", icon: Moon, color: "from-purple-500/25 to-fuchsia-500/5", border: "hover:border-purple-500/30", count: "37 crawls" },
    { name: "Travel", icon: Map, color: "from-indigo-500/25 to-sky-500/5", border: "hover:border-indigo-500/30", count: "115 stays" },
    { name: "Technology", icon: Cpu, color: "from-violet-500/25 to-blue-500/5", border: "hover:border-violet-500/30", count: "18 hackathons" },
    { name: "Creative Arts", icon: Palette, color: "from-rose-500/25 to-pink-500/5", border: "hover:border-rose-500/30", count: "34 masterclasses" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="explore">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 mb-4">
            <Compass className="h-4 w-4 text-brand-indigo" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Diverse Classifications
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Curated Categories
          </h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed text-left">
          Explore structured offline categories. Whether you seek high-adrenaline thrills or focused workspace learning, we align your days.
        </p>
      </div>

      {/* Grid of category cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.name}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`p-4 md:p-6 rounded-2xl glass-panel border-white/5 flex flex-col justify-between h-36 md:h-48 cursor-pointer relative overflow-hidden group transition-all duration-300 ${cat.border}`}
            >
              {/* Background Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${cat.color} opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none`} />
              
              {/* Glowing Hover Dot effect */}
              <div className="absolute -right-12 -top-12 w-24 h-24 rounded-full bg-white/5 group-hover:bg-white/10 blur-xl transition-all duration-300 pointer-events-none" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="p-2 md:p-3 rounded-xl bg-white/5 border border-white/10 text-white group-hover:text-brand-cyan group-hover:border-brand-cyan/20 transition-colors">
                  <Icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-white group-hover:text-brand-cyan transition-colors mb-0.5">
                  {cat.name}
                </h3>
                <p className="text-[9px] md:text-[11px] font-bold text-zinc-500 tracking-wide group-hover:text-zinc-400 transition-colors uppercase">
                  {cat.count}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
