"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, Heart, MessageCircle, Share2, Compass, Award } from "lucide-react";

interface StoryPost {
  id: string;
  authorName: string;
  avatarLetter: string;
  title: string;
  imageUrl: string;
  badgeName?: string;
  likes: number;
  comments: number;
  height: string; // for masonry visual variance
}

export default function CommunityStories() {
  const stories: StoryPost[] = [
    {
      id: "s1",
      authorName: "Aarav Sharma",
      avatarLetter: "A",
      title: "Spent the morning paragliding over Himachal valleys. Unbelievable wind drafts!",
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop",
      badgeName: "Sky Glider Lvl 2",
      likes: 342,
      comments: 29,
      height: "h-64"
    },
    {
      id: "s2",
      authorName: "Sneha Reddy",
      avatarLetter: "S",
      title: "Completed the Hampi rappelling challenge! Hard difficulty is no joke, but the views are worth every drop of sweat.",
      imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=400&auto=format&fit=crop",
      badgeName: "Peak Climber",
      likes: 512,
      comments: 48,
      height: "h-96"
    },
    {
      id: "s3",
      authorName: "Vikram Malhotra",
      avatarLetter: "V",
      title: "Log book memory: Scuba diving under Gokarna cliffs. Felt like entering a different dimension.",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop",
      badgeName: "Ocean Nomad",
      likes: 289,
      comments: 18,
      height: "h-80"
    },
    {
      id: "s4",
      authorName: "Priyanka Sen",
      avatarLetter: "P",
      title: "Joined the horizontal photography bouldering walk today. Learnt how to leverage twilight shadows.",
      imageUrl: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=400&auto=format&fit=crop",
      badgeName: "Shadow Master",
      likes: 198,
      comments: 12,
      height: "h-72"
    },
    {
      id: "s5",
      authorName: "Rohan Das",
      avatarLetter: "R",
      title: "Logged our weekend camp stories. There is nothing like keeping warm under starry night dunes.",
      imageUrl: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=400&auto=format&fit=crop",
      badgeName: "Camp Bard",
      likes: 421,
      comments: 31,
      height: "h-80"
    },
    {
      id: "s6",
      authorName: "Divya Kapoor",
      avatarLetter: "D",
      title: "Had an amazing sunrise yoga session on the cliffs of Gokarna. Deep breaths, fresh salt air, and complete alignment.",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop",
      badgeName: "Zen Seeker Lvl 3",
      likes: 274,
      comments: 19,
      height: "h-72"
    }
  ];

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="community">
      <div className="absolute top-[20%] left-[10%] w-80 h-80 rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
            <Users className="h-4 w-4 text-brand-cyan" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Social Proof Journals
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Explorer Feed
          </h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed text-left">
          Track verified journals, achievements, and photos posted by explorers. See real memories, not scrolling traps.
        </p>
      </div>

      {/* Masonry layout column layout */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance]">
        {stories.map((story) => (
          <motion.div
            key={story.id}
            className="break-inside-avoid glass-panel border-white/5 rounded-3xl overflow-hidden group relative flex flex-col justify-end cursor-pointer"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main graphic */}
            <div className={`w-full ${story.height} relative bg-zinc-950`}>
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
            </div>

            {/* Inner text content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-left">
              {/* Header profile details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-brand-indigo text-white font-black text-xs flex items-center justify-center border border-white/10">
                    {story.avatarLetter}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none mb-0.5">{story.authorName}</h4>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Explorer</p>
                  </div>
                </div>

                {story.badgeName && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-amber bg-brand-amber/15 border border-brand-amber/30 px-2 py-0.5 rounded-full">
                    <Award className="h-3 w-3" />
                    {story.badgeName}
                  </span>
                )}
              </div>

              {/* Bottom description */}
              <div>
                <p className="text-xs text-zinc-200 leading-relaxed mb-4 line-clamp-3">
                  {story.title}
                </p>

                {/* Micro-interaction stats */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-zinc-400 text-xs font-semibold">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 hover:text-white transition-colors">
                      <Heart className="h-4 w-4" />
                      {story.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-white transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      {story.comments}
                    </span>
                  </div>
                  <button className="hover:text-white transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-12">
        <Link href="/feed" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20 transition-all active:scale-[0.98]">
          <Compass className="h-4 w-4 text-brand-cyan animate-pulse" />
          View More Journals
        </Link>
      </div>
    </section>
  );
}
