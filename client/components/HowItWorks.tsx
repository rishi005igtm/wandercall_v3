"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Ticket, Compass, Flame } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Discover Unique Path",
      icon: Search,
      description: "Ask our AI guide, filter by extreme difficulties, or browse ongoing local category lists. Find activities that match your adrenaline goals.",
      glow: "group-hover:text-brand-cyan"
    },
    {
      step: "02",
      title: "Lock Scheduled Slots",
      icon: Ticket,
      description: "Approve scheduling slots, reserve ticket seats through Cashfree checkout gateways, and receive your verified QR pass in your profile.",
      glow: "group-hover:text-brand-purple"
    },
    {
      step: "03",
      title: "Log Life Memories",
      icon: Compass,
      description: "Attend offline events, complete daily quest targets, meet local creators, and build a keepsake Memory Book of life experiences.",
      glow: "group-hover:text-brand-indigo"
    }
  ];

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="how-it-works">
      <div className="absolute top-[40%] left-[20%] w-72 h-72 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 mb-4">
          <Flame className="h-4 w-4 text-brand-indigo" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
            Operational Blueprint
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          How Wandercall Works
        </h2>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
          We strip away screens to help you accumulate memories. Here is how we transition you from scroll to action:
        </p>
      </div>

      {/* Grid of steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
        {/* Connector line for desktop */}
        <div className="hidden md:block absolute top-[28%] left-[10%] right-[10%] h-px bg-gradient-to-r from-brand-cyan/20 via-brand-purple/20 to-brand-indigo/20 z-0 pointer-events-none" />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="p-6 rounded-3xl glass-panel border-white/5 flex flex-col items-center text-center relative z-10 hover:bg-white/[0.01] hover:border-white/10 group transition-all"
            >
              {/* Step number badge */}
              <span className="text-[10px] font-black font-mono tracking-widest text-zinc-600 bg-white/5 px-3 py-1 rounded-full mb-6 border border-white/5 uppercase">
                Step {step.step}
              </span>

              {/* Step Icon */}
              <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:border-brand-purple/20 transition-all mb-6 relative">
                <Icon className={`h-7 w-7 transition-colors ${step.glow}`} />
              </div>

              {/* Details */}
              <h3 className="text-lg font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
