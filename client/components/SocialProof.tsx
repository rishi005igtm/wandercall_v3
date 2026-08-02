"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck, Heart } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  avatarLetter: string;
  rating: number;
  text: string;
  adventurerLevel: number;
  location: string;
}

export default function SocialProof() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const testimonials: Testimonial[] = [
    {
      id: "p1",
      name: "Rishi Raj",
      avatarLetter: "R",
      rating: 5,
      text: "I spent my weekend learning artisan woodworking and cooking heritage recipes in old Bangalore. This is the first app that actually got me out of the house to build real memories.",
      adventurerLevel: 6,
      location: "Bangalore"
    },
    {
      id: "p2",
      name: "Sneha Nair",
      avatarLetter: "S",
      rating: 5,
      text: "Joining the full moon kayaking meetup was the highlight of my month. Met 12 incredible explorers and logged our starry photos in my Memory Book. Exceptional premium feel!",
      adventurerLevel: 4,
      location: "Kochi"
    },
    {
      id: "p3",
      name: "Kabir Mehta",
      avatarLetter: "K",
      rating: 5,
      text: "The Campfire voice rooms are brilliant. Listened to backpackers share solo trail stories before booking my Kasol trek slot. It builds instant trust and co-adventure coordination.",
      adventurerLevel: 5,
      location: "Delhi"
    }
  ];

  return (
    <section className="relative py-10 lg:py-24 px-6 md:px-12 bg-transparent max-w-[1440px] mx-auto w-full" id="social-proof">
      <div className="absolute top-[20%] right-[-5%] w-80 h-80 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 mb-4">
          <ShieldCheck className="h-4 w-4 text-brand-indigo" />
          <span className="text-xs font-semibold text-brand-indigo uppercase tracking-wider">
            Verified Explorer Trust
          </span>
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Loved by True Explorers
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-xl leading-relaxed">
          Wandercall is built around authentic reviews and memories. Only explorers with verified completed checkouts can log reviews.
        </p>
      </div>

      {/* Grid of reviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SocialProofSkeletonCard key={i} />)
          : testimonials.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-white border border-gray-100 flex flex-col justify-between h-[280px] text-left hover:border-brand-indigo/20 transition-all shadow-sm hover:shadow-md relative hover:-translate-y-1"
          >
            {/* Quote decoration */}
            <Quote className="absolute right-6 top-6 h-8 w-8 text-gray-100 pointer-events-none" />

            <div>
              {/* Star rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-amber text-brand-amber" />
                ))}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-6 italic">
                "{test.text}"
              </p>
            </div>

            {/* Profile footer info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-brand-purple text-white font-black text-xs flex items-center justify-center shadow-sm">
                  {test.avatarLetter}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-none mb-1">{test.name}</h4>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{test.location}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Heart className="h-3 w-3 fill-brand-indigo text-brand-indigo" />
                Lvl {test.adventurerLevel}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      <div className="flex justify-center mt-12">
        <button suppressHydrationWarning className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 hover:border-gray-300 shadow-sm transition-all active:scale-[0.98]">
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
          View More Reviews
        </button>
      </div>
    </section>
  );
}

function SocialProofSkeletonCard() {
  return (
    <div className="p-6 rounded-3xl bg-white border border-gray-100 flex flex-col justify-between h-[280px] bg-gray-50 shadow-sm animate-pulse relative">
      <div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-4 bg-gray-200 rounded-sm" />
          ))}
        </div>
        <div className="space-y-2 mb-6 mt-2">
          <div className="h-2 w-full bg-gray-200 rounded-sm" />
          <div className="h-2 w-full bg-gray-200 rounded-sm" />
          <div className="h-2 w-5/6 bg-gray-200 rounded-sm" />
          <div className="h-2 w-3/4 bg-gray-200 rounded-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-16 bg-gray-200 rounded-sm" />
            <div className="h-2 w-12 bg-gray-200 rounded-sm" />
          </div>
        </div>
        <div className="h-5 w-14 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
