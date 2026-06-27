import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AIDiscovery from "../components/AIDiscovery";
import Categories from "../components/Categories";
import Trending from "../components/Trending";

import AdventureDNA from "../components/AdventureDNA";
import Campfires from "../components/Campfires";
import CommunityStories from "../components/CommunityStories";
import FeaturedHosts from "../components/FeaturedHosts";
import UpcomingEvents from "../components/UpcomingEvents";
import HowItWorks from "../components/HowItWorks";
import SocialProof from "../components/SocialProof";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      {/* Section 1: Floating Premium Navbar */}
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Section 2: Immersive Hero Section */}
        <Hero />

        {/* Section 3: AI Experience Discovery */}
        <AIDiscovery />

        {/* Section 4: Experience Categories */}
        <Categories />

        {/* Section 5: Trending Experiences */}
        <Trending />



        {/* Section 7: Adventure DNA */}
        <AdventureDNA />

        {/* Section 8: Campfire Communities */}
        <Campfires />

        {/* Section 9: Community Stories */}
        <CommunityStories />

        {/* Section 10: Featured Hosts */}
        <FeaturedHosts />

        {/* Section 11: Upcoming Events */}
        <UpcomingEvents />

        {/* Section 12: How It Works */}
        <HowItWorks />

        {/* Section 13: Social Proof */}
        <SocialProof />

        {/* Section 15: Final CTA */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

