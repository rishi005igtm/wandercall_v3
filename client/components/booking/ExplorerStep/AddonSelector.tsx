"use client";

import React from "react";
import { Sparkles, Video, Camera, Utensils, Bus, ShieldCheck, Award, Lock } from "lucide-react";

interface AddonSelectorProps {
  selectedAddons: string[];
  onToggleAddon: (id: string) => void;
}

export default function AddonSelector({ selectedAddons, onToggleAddon }: AddonSelectorProps) {
  const addons = [
    {
      id: "drone",
      title: "4K Cinematic Drone Video",
      price: 1500,
      desc: "Raw 4K aerial footage recorded by certified pilot",
      icon: Video,
    },
    {
      id: "gopro",
      title: "GoPro HERO12 Chest Mount",
      price: 1000,
      desc: "Hands-free action camera rental with 64GB SD Card",
      icon: Camera,
    },
    {
      id: "photos",
      title: "Pro DSLR Photography Pack",
      price: 800,
      desc: "25+ high-res color graded action photographs",
      icon: Camera,
    },
    {
      id: "meals",
      title: "Gourmet Expedition Meals",
      price: 400,
      desc: "Fresh organic buffet lunch & post-flight refreshments",
      icon: Utensils,
    },
    {
      id: "transport",
      title: "Hotel Pickup & Dropover",
      price: 1200,
      desc: "Private AC SUV shuttle to takeoff site",
      icon: Bus,
    },
    {
      id: "insurance",
      title: "Extreme Sports Coverage Insurance",
      price: 300,
      desc: "Comprehensive ₹10L medical protection policy",
      icon: ShieldCheck,
    },
    {
      id: "certificate",
      title: "Framed Digital Flight Certificate",
      price: 200,
      desc: "Official flight log signed by chief pilot",
      icon: Award,
    },
    {
      id: "locker",
      title: "Secure Gear Storage Locker",
      price: 150,
      desc: "Private RFID biometric locker for valuables",
      icon: Lock,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col gap-5 text-left shadow-xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-cyan" />
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">Premium Upgrades & Add-ons</h3>
        </div>
        <span className="text-[10px] font-mono font-black text-brand-cyan bg-brand-cyan/10 px-3 py-1 rounded-full uppercase tracking-wider border border-brand-cyan/20">
          {selectedAddons.length} Selected
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {addons.map((addon) => {
          const Icon = addon.icon;
          const isSelected = selectedAddons.includes(addon.id);

          return (
            <div
              key={addon.id}
              onClick={() => onToggleAddon(addon.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-brand-cyan/10 border-brand-cyan shadow-lg shadow-brand-cyan/10"
                  : "bg-white/[0.01] border-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                    isSelected ? "bg-brand-cyan border-brand-cyan text-zinc-950" : "bg-white/5 border-white/5 text-zinc-400"
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase leading-tight">{addon.title}</h4>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">₹{addon.price.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">{addon.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
