"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ShieldCheck, UserCheck, MessageSquare, Heart, Compass, Users } from "lucide-react";

interface Host {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experiencesCount: number;
  followersCount: number;
  responseRate: string;
  bio: string;
  specialty: string;
}

export default function FeaturedHosts() {
  const [hosts, setHosts] = useState<Host[]>([
    {
      id: "h1",
      name: "Captain Vikram Sen",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      rating: 4.95,
      experiencesCount: 42,
      followersCount: 1280,
      responseRate: "100% in 1 hr",
      bio: "Licensed deep-sea navigator and veteran diver. Spent 15 years charting coral paths across the Arabian Sea coastlines.",
      specialty: "Scuba & Marine Trails"
    },
    {
      id: "h2",
      name: "Aditi Roy (Artisan)",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
      rating: 4.88,
      experiencesCount: 28,
      followersCount: 890,
      responseRate: "98% in 2 hrs",
      bio: "Local craft heritage specialist. Passionate about preserving handloom weaves, woodworking, and regional pottery systems.",
      specialty: "Crafts & Cultural walks"
    },
    {
      id: "h3",
      name: "Chef Karthik Nair",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      rating: 4.91,
      experiencesCount: 19,
      followersCount: 1450,
      responseRate: "99% in 1 hr",
      bio: "Heritage culinary gatherer. Leads deep-dive food mapping crawls exploring historical spice markets and ancestral cooking stoves.",
      specialty: "Culinary & Food Walks"
    }
  ]);

  const [followedIds, setFollowedIds] = useState<string[]>([]);

  const toggleFollow = (id: string) => {
    setFollowedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="hosts">
      <div className="absolute top-[30%] left-[-10%] w-80 h-80 rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 mb-4">
            <Compass className="h-4 w-4 text-brand-indigo animate-spin-slow" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Verified Experience Creators
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Featured Hosts
          </h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed text-left">
          Wandercall hosts are checked and verified guides. They have local knowledge, certifications, and active responses.
        </p>
      </div>

      {/* Grid of hosts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hosts.map((host) => {
          const isFollowing = followedIds.includes(host.id);
          
          return (
            <motion.div
              key={host.id}
              className="p-6 rounded-3xl glass-panel border-white/5 flex flex-col justify-between h-[340px] text-left hover:border-brand-purple/20 transition-all hover:shadow-xl relative overflow-hidden group"
              whileHover={{ y: -4 }}
            >
              {/* Header profile metrics */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={host.avatar}
                      alt={host.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                    />
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-brand-emerald border border-brand-bg rounded-full flex items-center justify-center text-white">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-1.5 leading-none mb-1.5">
                      {host.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-cyan">
                      {host.specialty}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                  {host.bio}
                </p>
              </div>

              {/* Host stats */}
              <div>
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/5 mb-6 text-center text-zinc-400">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Rating</p>
                    <p className="text-xs font-bold text-white flex items-center justify-center gap-0.5">
                      <Star className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" />
                      {host.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Experiences</p>
                    <p className="text-xs font-bold text-white">{host.experiencesCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 mb-0.5">Response</p>
                    <p className="text-[10px] font-bold text-brand-emerald">{host.responseRate}</p>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleFollow(host.id)}
                    className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      isFollowing 
                        ? "bg-brand-indigo text-white border border-brand-indigo hover:brightness-110" 
                        : "bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white hover:text-black flex items-center justify-center transition-all">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-12">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]">
          <Users className="h-4 w-4 text-brand-purple animate-pulse" />
          View All Verified Hosts
        </button>
      </div>
    </section>
  );
}
