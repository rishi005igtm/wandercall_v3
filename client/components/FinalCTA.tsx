"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, UserCheck } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-16 lg:py-32 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full text-center flex flex-col items-center" id="final-cta">
      {/* Background visual overlay glows */}
      <div className="absolute top-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-brand-indigo/5 to-brand-purple/5 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl flex flex-col items-center"
      >
        {/* Glow Spark tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20 mb-8">
          <Sparkles className="h-4 w-4 text-brand-purple animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Unleash Your Inner Explorer
          </span>
        </div>

        <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1] max-w-3xl">
          Your Next Great Story <br />
          <span className="text-gradient-brand">Starts Here</span>
        </h2>

        <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg mb-12">
          Discover off-beat adventures, join camper socials, complete quests, and build a keepsake Memory Book of life experiences.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-sm sm:max-w-none">
          <a
            href="#explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-xl shadow-brand-indigo/30 hover:shadow-brand-indigo/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Exploring
            <ArrowRight className="h-4.5 w-4.5" />
          </a>
          <a
            href="#host"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]"
          >
            <UserCheck className="h-4 w-4 text-brand-cyan" />
            Become a Host
          </a>
        </div>
      </motion.div>
    </section>
  );
}
