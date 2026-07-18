"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Dna, ArrowRight, ShieldCheck } from "lucide-react";

interface DnaTrait {
  name: string;
  value: number; // 0 to 100
}

interface PersonalityPreset {
  name: string;
  description: string;
  traits: Record<string, number>;
}

export default function AdventureDNA() {
  const traitsList = ["Explorer", "Thrill-Seeker", "Socializer", "Learner", "Creator", "Foodie", "Storyteller"];

  const presets: PersonalityPreset[] = [
    {
      name: "Wild Wanderer",
      description: "You thrive in high-altitude treks, extreme river runs, and charting remote, unmapped coordinates.",
      traits: { "Explorer": 95, "Thrill-Seeker": 90, "Socializer": 40, "Learner": 50, "Creator": 60, "Foodie": 45, "Storyteller": 75 }
    },
    {
      name: "Heritage Scholar",
      description: "You enjoy local artisanal crafts, historical fort treks, and diving deep into culinary lineages.",
      traits: { "Explorer": 60, "Thrill-Seeker": 30, "Socializer": 70, "Learner": 95, "Creator": 80, "Foodie": 90, "Storyteller": 85 }
    },
    {
      name: "Campfire Bard",
      description: "You love sharing campfire horror stories, hosting group socials, and compiling photographic journals.",
      traits: { "Explorer": 70, "Thrill-Seeker": 50, "Socializer": 95, "Learner": 65, "Creator": 90, "Foodie": 75, "Storyteller": 95 }
    }
  ];

  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = presets[activePresetIndex];

  // SVG Geometry Constants
  const width = 300;
  const height = 300;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = 100;
  const numAxes = traitsList.length;

  // Calculate grid levels (e.g. 25%, 50%, 75%, 100% circles)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Generate points string for a given set of values
  const getPointsString = (traitsData: Record<string, number>) => {
    return traitsList
      .map((trait, i) => {
        const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
        const score = (traitsData[trait] || 50) / 100;
        const r = maxRadius * score;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  const activePoints = getPointsString(activePreset.traits);

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="adventure-dna">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(6,182,212,0.02)_0%,_transparent_65%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left side custom SVG Radar Chart */}
        <div className="lg:col-span-6 flex justify-center order-2 lg:order-1">
          <div className="relative p-6 rounded-3xl glass-panel border-white/5 shadow-2xl w-[340px] h-[340px] flex items-center justify-center bg-black/40">
            {/* Background cyan/purple ambient point */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/5 to-brand-purple/5 rounded-3xl pointer-events-none" />

            <svg width={width} height={height} className="overflow-visible">
              {/* Draw concentric web polygons */}
              {gridLevels.map((level) => {
                const points = traitsList
                  .map((_, i) => {
                    const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                    const r = maxRadius * level;
                    const x = centerX + r * Math.cos(angle);
                    const y = centerY + r * Math.sin(angle);
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Draw axes lines */}
              {traitsList.map((_, i) => {
                const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                const endX = centerX + maxRadius * Math.cos(angle);
                const endY = centerY + maxRadius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={centerX}
                    y1={centerY}
                    x2={endX}
                    y2={endY}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis Label Texts */}
              {traitsList.map((trait, i) => {
                const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                // Move text slightly further than maxRadius
                const offsetRadius = maxRadius + 18;
                const x = centerX + offsetRadius * Math.cos(angle);
                const y = centerY + offsetRadius * Math.sin(angle);
                
                // Adjust text anchors dynamically for readability
                let textAnchor: "middle" | "start" | "end" = "middle";
                if (Math.cos(angle) > 0.1) textAnchor = "start";
                else if (Math.cos(angle) < -0.1) textAnchor = "end";

                return (
                  <text
                    key={trait}
                    x={x}
                    y={y + 4}
                    fill="#A1A1AA"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor={textAnchor}
                    className="font-mono tracking-widest uppercase"
                  >
                    {trait}
                  </text>
                );
              })}

              {/* Data Polygon Shape (Animated points attribute) */}
              <polygon
                points={activePoints}
                fill="url(#radar-gradient)"
                stroke="#8B5CF6"
                strokeWidth="2"
                className="transition-all duration-700 ease-in-out"
              />

              {/* Definitions for Gradients & Glow Filters */}
              <defs>
                <linearGradient id="radar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(6, 182, 212, 0.4)" />
                  <stop offset="100%" stopColor="rgba(139, 92, 246, 0.3)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Right side interactive Preset selector */}
        <div className="lg:col-span-6 text-left order-1 lg:order-2 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
            <Dna className="h-4 w-4 text-brand-cyan animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Cognitive Profile Mapping
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Discover Your <br />
            <span className="text-gradient-brand">Adventure DNA</span>
          </h2>

          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
            Wandercall profiles your actions. Every completed bouldering trek, storytelling campfire join, or culinary walk adapts your scores. Align with presets to see your fit:
          </p>

          {/* Interactive Preset Buttons */}
          <div className="flex flex-col gap-3 w-full mb-8">
            {presets.map((preset, index) => {
              const isActive = index === activePresetIndex;
              return (
                <button
                  key={preset.name}
                  onClick={() => setActivePresetIndex(index)}
                  className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    isActive 
                      ? "bg-white/5 border-brand-purple shadow-lg" 
                      : "bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10"
                  }`}
                >
                  <div>
                    <h4 className={`text-sm font-bold ${isActive ? "text-brand-cyan" : "text-white"}`}>
                      {preset.name}
                    </h4>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-md"
                      >
                        {preset.description}
                      </motion.p>
                    )}
                  </div>
                  <ArrowRight className={`h-4 w-4 shrink-0 transition-transform ${isActive ? "text-brand-purple translate-x-1" : "text-zinc-600"}`} />
                </button>
              );
            })}
          </div>

          <button className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-brand-cyan transition-colors">
            <ShieldCheck className="h-4 w-4 text-brand-emerald" />
            Locked in with Better Auth Session
          </button>
        </div>
      </div>
    </section>
  );
}
