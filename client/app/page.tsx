"use client";

import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrendingCategories from "../components/TrendingCategories";
import Trending from "../components/Trending";

import UpcomingEvents from "../components/UpcomingEvents";
import HowItWorks from "../components/HowItWorks";
import SocialProof from "../components/SocialProof";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";
import { useAppSelector } from "@/lib/store/store";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";
import { Sparkles, Compass, Award, Calendar, Radio } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: currentUser } = useCurrentUserQuery(isAuthenticated);

  return (
    <div className="flex flex-col min-h-screen bg-mesh-premium text-gray-900 overflow-x-hidden font-sans">
      {/* Section 1: Floating Premium Navbar */}
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Section 2: Immersive Hero Section */}
        <div className="w-full">
           <Hero />
        </div>

        {/* Section 3: Trending Categories (Below Hero) */}
        <TrendingCategories />

        {/* Section 4: Top Experiences (Previously Trending) */}
        <Trending />


        {/* Section 11: Upcoming Events */}
        {/* <UpcomingEvents /> */}

        {/* Section 12: How It Works */}
        <HowItWorks />

        {/* Section 13: Social Proof */}
        <SocialProof />

        {/* Section 15: Final CTA */}
        {!isAuthenticated && <FinalCTA />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
