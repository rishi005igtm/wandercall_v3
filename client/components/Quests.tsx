"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle, Zap, Shield, Sparkles, Compass } from "lucide-react";

interface Quest {
  id: string;
  title: string;
  xp: number;
  type: "daily" | "weekly";
  progress: number; // 0 to 100
  target: string;
  status: "active" | "completed";
}

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([
    { id: "q1", title: "Walk a new path today", xp: 30, type: "daily", progress: 100, target: "Visit a new location pin", status: "completed" },
    { id: "q2", title: "Join startup stories campfire", xp: 50, type: "daily", progress: 60, target: "Listen for 15 mins", status: "active" },
    { id: "q3", title: "Log an adventure memory", xp: 40, type: "daily", progress: 0, target: "Create 1 feed post", status: "active" },
    { id: "q4", title: "Conquer a 'Hard' difficulty experience", xp: 200, type: "weekly", progress: 0, target: "Complete 1 booking", status: "active" },
    { id: "q5", title: "Share 3 experience journals", xp: 120, type: "weekly", progress: 100, target: "Send to community", status: "completed" }
  ]);

  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");

  const filteredQuests = quests.filter((q) => q.type === activeTab);

  const getProgressColor = (xp: number) => {
    if (xp >= 150) return "bg-gradient-to-r from-brand-purple to-pink-500";
    return "bg-gradient-to-r from-brand-cyan to-brand-indigo";
  };

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="quests">
      <div className="absolute top-[30%] left-[-10%] w-96 h-96 rounded-full bg-brand-purple/5 blur-[150px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side Info Panel */}
        <div className="lg:col-span-5 text-left flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-amber/10 border border-brand-amber/20 mb-4">
            <Zap className="h-4 w-4 text-brand-amber animate-bounce" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Gamified Motivation Hub
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Real-World <br />
            <span className="text-gradient-brand">Daily Quests</span>
          </h2>
          
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
            Complete small offline quests to level up your adventure profile. Earn Explorer Points (XP) and unlock dynamic profile badges that verify your real-world achievements.
          </p>

          {/* User statistics placeholder panel */}
          <div className="w-full glass-panel border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber shrink-0">
                <Shield className="h-5.5 w-5.5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider sm:tracking-widest">Level 04 Explorer</p>
                <p className="text-sm sm:text-base font-black text-white">4,820 / 6,000 XP</p>
              </div>
            </div>
            
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-white/5 sm:border-t-0 pt-3 sm:pt-0 gap-1">
              <span className="text-[10px] sm:text-xs font-bold text-zinc-500 sm:text-brand-cyan uppercase tracking-wider">Global Rank</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-black text-brand-cyan">#23</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase sm:hidden">Globally</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Quests Manager */}
        <div className="lg:col-span-7 w-full flex flex-col">
          {/* Tab selector & Redeem Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex gap-2 p-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab("daily")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "daily" 
                    ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-md" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Daily Quests
              </button>
              <button
                onClick={() => setActiveTab("weekly")}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "weekly" 
                    ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-md" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Weekly Quests
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-amber to-amber-500 hover:brightness-110 text-white shadow-lg shadow-brand-amber/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0">
              <Sparkles className="h-4 w-4 animate-pulse text-white" />
              Redeem Rewards
            </button>
          </div>

          {/* List display */}
          <div className="flex flex-col gap-4">
            {filteredQuests.map((quest) => {
              const completed = quest.status === "completed";
              
              return (
                <div
                  key={quest.id}
                  className={`p-4 sm:p-5 rounded-2xl glass-panel border-white/5 flex items-center justify-between gap-4 sm:gap-6 hover:border-brand-indigo/10 transition-all ${
                    completed ? "opacity-60 hover:opacity-80" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Completion indicator */}
                    <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      completed 
                        ? "bg-brand-emerald/10 border-brand-emerald text-brand-emerald" 
                        : "bg-white/5 border-white/10 text-zinc-500"
                    }`}>
                      {completed ? <CheckCircle className="h-4.5 w-4.5 sm:h-5 sm:w-5" /> : <Award className="h-4.5 w-4.5 sm:h-5 sm:w-5" />}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                          {quest.title}
                        </h4>
                        <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 truncate">
                          {quest.target}
                        </span>
                      </div>

                      {/* Custom linear progress bar */}
                      <div className="w-full h-1.5 sm:h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${quest.progress}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${getProgressColor(quest.xp)}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reward status */}
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs font-black text-brand-amber font-mono">+{quest.xp} XP</span>
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Reward</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
