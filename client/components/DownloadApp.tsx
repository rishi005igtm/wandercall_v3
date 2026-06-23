"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Smartphone, QrCode, ArrowDown } from "lucide-react";

export default function DownloadApp() {
  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="download-app">
      <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none" />

      {/* Large Glass Panel Layout */}
      <div className="max-w-5xl mx-auto rounded-3xl glass-panel glass-glow-purple border-white/5 p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Background cyan/purple glows inside card */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo/10 via-transparent to-brand-cyan/5 pointer-events-none" />

        {/* Left Side Details */}
        <div className="flex-1 text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-6">
            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Experience the Future Offline
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6">
            Download the <span className="text-gradient-brand">Wandercall App</span>
          </h2>

          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-8 max-w-md">
            Unlock real-time notifications, offline geolocator maps, offline quest tracking, and instant voice campfire alerts. Scan or install through app stores to begin your journey.
          </p>

          {/* App store button links */}
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <a 
              href="#ios" 
              className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              App Store
            </a>
            <a 
              href="#android" 
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4 text-brand-cyan" />
              Play Store
            </a>
          </div>

          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <ArrowDown className="h-3.5 w-3.5 text-brand-cyan animate-bounce" />
            Compatible with Android 10+ & iOS 14+
          </span>
        </div>

        {/* Right Side Mockups / QR Code */}
        <div className="flex-1 w-full max-w-sm flex items-center justify-center gap-6 relative z-10 order-2">
          {/* Smartphone visual silhouette representation */}
          <div className="w-[170px] h-[300px] rounded-[32px] border-4 border-zinc-800 bg-zinc-950 p-3 shadow-xl relative hidden sm:block shrink-0">
            {/* Phone Speaker */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-800 rounded-full" />
            
            {/* Inner display visualization representing quests */}
            <div className="h-full w-full rounded-[20px] bg-brand-bg/80 border border-white/5 flex flex-col justify-between p-3.5 text-left relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-indigo/25 to-brand-purple/10 pointer-events-none" />
              
              <div>
                <span className="text-[7px] font-black uppercase text-brand-cyan tracking-wider">Adventure Badge</span>
                <h4 className="text-[10px] font-extrabold text-white leading-tight mt-1">Deep Sea Specialist</h4>
                <div className="h-1 w-full bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div className="h-full w-[80%] bg-brand-cyan" />
                </div>
              </div>

              {/* Memory Book layout preview inside mock phone */}
              <div className="h-28 w-full rounded-lg bg-zinc-950/80 border border-white/5 flex flex-col justify-end p-2 relative overflow-hidden">
                <span className="text-[7px] text-zinc-500 uppercase font-bold z-10">Quest Memory</span>
                <span className="text-[8px] text-white font-bold leading-tight line-clamp-1 z-10">Netrani Island Shore BBQ</span>
              </div>
            </div>
          </div>

          {/* QR Code Segment */}
          <div className="p-5 rounded-2xl glass-panel border-white/10 flex flex-col items-center gap-3 shrink-0 bg-black/60 shadow-lg">
            <div className="p-3 bg-white rounded-xl">
              <QrCode className="h-24 w-24 text-black" />
            </div>
            <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">
              Scan to Download
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
