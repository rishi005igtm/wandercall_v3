"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Compass,
  MapPin,
  Clock,
  Star,
  Flame,
  Search,
  SlidersHorizontal,
  X,
  Check,
  Zap,
  Calendar,
  DollarSign,
  Award,
  ChevronDown,
  Heart,
  Share2,
  Maximize2,
  Users,
  AlertCircle,
  HelpCircle,
  Shield,
  Activity,
  Smile,
  MessageSquare,
  Sparkles,
  Camera,
  Map,
  CloudSun,
  UserCheck,
  Ticket
} from "lucide-react";

// Interfaces for Experience Details
interface StoryBlock {
  title: string;
  paragraph: string;
  image: string;
}

interface TimelineStop {
  time: string;
  title: string;
  note: string;
}

interface HostProfile {
  name: string;
  avatar: string;
  isVerified: boolean;
  tripsHosted: number;
  rating: number;
  yearsActive: number;
  languages: string[];
  responseTime: string;
  bio: string;
}

interface ReviewComment {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  helpfulCount: number;
  photos?: string[];
  isVerified: boolean;
  completedBadge: boolean;
}

interface FAQItem {
  q: string;
  a: string;
}

interface ExperienceDetail {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  price: number;
  originalPrice: number;
  image: string;
  galleryImages: string[];
  description: string;
  storyIntro: string;
  stories: StoryBlock[];
  highlights: string[];
  timeline: TimelineStop[];
  included: string[];
  bring: string[];
  locationDetails: {
    address: string;
    travelTime: string;
    parking: string;
    transit: string;
  };
  host: HostProfile;
  communityStats: {
    recentStories: number;
    memoriesShared: number;
    campfireCount: number;
    activityLog: string[];
  };
  categoryRatings: {
    safety: number;
    guide: number;
    value: number;
    fun: number;
    photos: number;
  };
  aiReviewSummary: string;
  reviews: ReviewComment[];
  faqs: FAQItem[];
}

// 4 Core Predefined Experiences Catalog Details
const EXPERIENCES_DATABASE: Record<string, ExperienceDetail> = {
  "scuba-diving-coral-exploration": {
    id: "exp-1",
    title: "Scuba Diving & Coral Exploration",
    category: "Water Sports",
    rating: 4.9,
    reviewsCount: 142,
    location: "Netrani Island, Karnataka",
    duration: "6 Hours",
    difficulty: "Medium",
    price: 4999,
    originalPrice: 6500,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Dive deep into the crystal clear waters of Netrani. Explore vibrant coral reefs and swim alongside exotic fish like stingrays, barracudas, and turtles.",
    storyIntro: "Netrani Island, famously known as the 'Heart of India's Diving', rises dramatically out of the Arabian Sea. Beneath its sheer cliffs lies an aquatic sanctuary filled with vibrant coral gardens and rich marine life that rivals global tropical hotspots.",
    stories: [
      {
        title: "The Descent into Silence",
        paragraph: "The moment you slip beneath the waves, the world of deadlines and noise vanishes. You are greeted by weightlessness and the gentle rhythm of your regulator, sinking slowly into an endless cyan universe.",
        image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=800&auto=format&fit=crop"
      },
      {
        title: "Meeting the Reef Locals",
        paragraph: "Swim alongside majestic parrotfish, curious stingrays, and darting clownfish nestled in anemones. Keep your eyes on the blue—it's not uncommon to spot juvenile blacktip reef sharks circling the outer drop-offs.",
        image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?q=80&w=800&auto=format&fit=crop"
      }
    ],
    highlights: [
      "Beginner Friendly",
      "PADI Certified Guides",
      "GoPro Photography Included",
      "Refreshments & Breakfast",
      "Boat Transit Included",
      "All Equipment Provided"
    ],
    timeline: [
      { time: "07:30 AM", title: "Boarding at Murudeshwar Harbor", note: "Meet your dive crew and complete boarding passes." },
      { time: "08:00 AM", title: "Boat Transit to Netrani Island", note: "A scenic 90-minute boat ride with breakfast served onboard." },
      { time: "09:30 AM", title: "Gear Assembly & Safety Briefing", note: "Guides review hand signals and diving safety rules." },
      { time: "10:15 AM", title: "First Dive (Explorer Mode)", note: "45 minutes exploring the main coral gardens." },
      { time: "11:30 AM", title: "Surface Interval & Photography Logs", note: "Snacks, hydration, and sharing initial stories." },
      { time: "12:30 PM", title: "Second Dive / Snorkeling Round", note: "Diving the outer drop-off or checking fish nurseries." },
      { time: "02:30 PM", title: "Return Voyage & Wrap-up", note: "Cruise back to Murudeshwar harbor." }
    ],
    included: [
      "Full Scuba Gear rental (BCDs, regulators, fins, suits)",
      "Murudeshwar-Netrani boat transfers",
      "Underwear and towel sanitization sets",
      "GoPro RAW underwater photography & video logs",
      "PADI safety briefing and dedicated 1-on-1 dive buddy",
      "Breakfast packs & water bottles"
    ],
    bring: [
      "Valid Government Photo ID card",
      "Swimming attire (wetsuit layer is provided)",
      "Sunscreen lotion & sunglasses",
      "Dry clothes for changing after transit"
    ],
    locationDetails: {
      address: "10 Nautical Miles off Murudeshwar Beach, Bhatkal, Karnataka",
      travelTime: "90 minutes boat ride from Murudeshwar Harbor",
      parking: "Free parking available at the harbor checkout point",
      transit: "Frequent trains to Murudeshwar Station (MRDW) + 5 min auto to harbor"
    },
    host: {
      name: "Neha Devadiga",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      tripsHosted: 420,
      rating: 4.95,
      yearsActive: 6,
      languages: ["English", "Hindi", "Kannada", "Konkani"],
      responseTime: "within 15 minutes",
      bio: "Neha is a PADI Master Scuba Diver Trainer with over 2,000 logged dives. She dedicated her life to marine conservation and spends her off-season monitoring coral rejuvenation projects."
    },
    communityStats: {
      recentStories: 48,
      memoriesShared: 320,
      campfireCount: 4,
      activityLog: [
        "Rohan uploaded 8 underwater drone shots yesterday",
        "Campfire 'Diving Safety' just scheduled a new virtual meetup",
        "Host Neha updated the visibility reports: 18 meters today"
      ]
    },
    categoryRatings: {
      safety: 5.0,
      guide: 4.9,
      value: 4.8,
      fun: 4.9,
      photos: 5.0
    },
    aiReviewSummary: "Explorers rave about the exceptional clarity of Neha's instructions and her patient approach with non-swimmers. The underwater GoPro footage is highly praised for its quality. A few users recommended bringing sea-sickness medication for the 90-minute boat ride.",
    reviews: [
      { id: "rev-1", user: "Aditya Hegde", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", rating: 5, date: "June 14, 2026", content: "Honestly, this was my first time trying scuba and I was terrified. Neha was incredibly calm and held my hand throughout the descent. The corals were stunning, and I felt extremely safe. Worth every single rupee!", helpfulCount: 24, isVerified: true, completedBadge: true },
      { id: "rev-2", user: "Sneha Nair", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", rating: 5, date: "May 29, 2026", content: "Diving visibility was awesome (around 15m). Saw two stingrays and tons of clownfish. The boat crew was organized and served great local snacks. They sent the GoPro videos in high quality on Google Drive the very next morning.", helpfulCount: 18, photos: ["https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=300&auto=format&fit=crop"], isVerified: true, completedBadge: true },
      { id: "rev-3", user: "Rohan Das", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", rating: 4, date: "May 18, 2026", content: "Amazing reefs and marine biodiversity! Netrani is really the heart of Indian diving. Wish the boat ride was a bit smoother, but the diving itself was top notch.", helpfulCount: 12, isVerified: true, completedBadge: true },
      { id: "rev-4", user: "Anjali Rao", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", rating: 5, date: "May 12, 2026", content: "PADI certified guides are super professional. They checked all gear double times. The underwater photos turned out beautiful. Recommended to everyone!", helpfulCount: 9, isVerified: true, completedBadge: true },
      { id: "rev-5", user: "Vikram Shenoy", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", rating: 4, date: "April 28, 2026", content: "Great visibility under water. Saw green sea turtles and schooling barracudas. Neha gave a wonderful brief about reef conservation and eco rules.", helpfulCount: 15, isVerified: true, completedBadge: true },
      { id: "rev-6", user: "Pooja Joshi", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", rating: 5, date: "April 15, 2026", content: "Weightless flight under water. Absolute silence and beauty. The training in shallow waters was helpful before going deeper. Loved the experience!", helpfulCount: 22, isVerified: true, completedBadge: true },
      { id: "rev-7", user: "Manish Gupta", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop", rating: 5, date: "March 20, 2026", content: "Top tier service! Clean boat, high-quality diving suits and clean regulators. The snacks served onboard were fresh. Truly a world-class adventure.", helpfulCount: 14, isVerified: true, completedBadge: true },
      { id: "rev-8", user: "Divya K.", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=150&auto=format&fit=crop", rating: 5, date: "March 05, 2026", content: "Exceeded all my expectations! Highly professional safety briefing. Swimming with turtles is a memory I will cherish forever. Worth every penny.", helpfulCount: 30, isVerified: true, completedBadge: true },
      { id: "rev-9", user: "Suresh Kumar", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop", rating: 4, date: "February 22, 2026", content: "Perfect visibility in early spring. Saw clownfish in sea anemones. GoPro footage is high quality. Very organized group setup.", helpfulCount: 11, isVerified: true, completedBadge: true },
      { id: "rev-10", user: "Priyanka M.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop", rating: 5, date: "February 10, 2026", content: "Highly recommend Neha and her crew! They are patient, encouraging, and highly knowledgeable. Best adventure activity in Karnataka.", helpfulCount: 19, isVerified: true, completedBadge: true }
    ],
    faqs: [
      { q: "Do I need to know swimming to do scuba diving?", a: "No! The beginner scuba program (Discover Scuba Diving) does not require swimming skills. You will be paired 1-on-1 with a certified guide who handles the gear controls and navigation for you." },
      { q: "Is Netrani Island safe for solo female travelers?", a: "Absolutely. Wandercall verified hosts enforce strict safety codes. The group trip consists of certified guides and is fully public. Neha's boat team is highly professional and welcoming." },
      { q: "What happens if weather conditions are bad?", a: "Safety is our priority. If harbor authorities issue storm warning bans, we reschedule your booking or offer a 100% full refund instantly." }
    ]
  },
  "paragliding-over-bir-billing-valleys": {
    id: "exp-2",
    title: "Paragliding over Bir Billing Valleys",
    category: "Adventure",
    rating: 4.8,
    reviewsCount: 98,
    location: "Bir, Himachal Pradesh",
    duration: "45 Minutes",
    difficulty: "Hard",
    price: 3500,
    originalPrice: 4200,
    image: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Experience the adrenaline rush of flying over snow-capped peaks and lush green pine valleys at the world's second-highest paragliding site.",
    storyIntro: "Billing, perched at 2,400 meters in the Dhauladhar range, offers some of the most stable thermal winds in the world. Flying tandem with our experienced pilots, you'll slide gracefully over dense forests, traditional Tibetan monasteries, and terraced farms.",
    stories: [
      {
        title: "The Leap of Faith",
        paragraph: "Standing on the edge of Billing cliff, the pilot counts down: Three, Two, One, RUN! You take five rapid steps into empty space and suddenly, the cliffs fall away, replaced by the wind carrying you upwards.",
        image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop"
      },
      {
        title: "Gliding with the Eagles",
        paragraph: "Soaring at 8,000 feet, you'll catch the same thermals as the Himalayan vultures. Look down to see the sprawling tea gardens and winding rivers of the Kangra Valley reduced to a gorgeous emerald map.",
        image: "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?q=80&w=800&auto=format&fit=crop"
      }
    ],
    highlights: [
      "Certifed Pilots Only",
      "GoPro Selfie Stick Included",
      "Himalayan Panorama View",
      "Wind Safety Checkpoints",
      "Tandem Flight Equipment",
      "Landing Site Pickup"
    ],
    timeline: [
      { time: "09:00 AM", title: "Meet at Landing Site, Bir", note: "Pilot check-in and weight checks at the baseline cabin." },
      { time: "09:30 AM", title: "Forest Jeep Ride to Billing Takeoff", note: "A bumpy 45-minute mountain road ascent." },
      { time: "10:30 AM", title: "Flight Setup & Helmet Harness Checks", note: "Guides double check straps and anchor locks." },
      { time: "11:00 AM", title: "Tandem Launch!", note: "Jump and enjoy 30 to 45 minutes of pure flight time." },
      { time: "11:45 AM", title: "Smooth Touchdown at Bir", note: "Soft landing on the grassy fields of Bir." }
    ],
    included: [
      "Tandem glider, harness, and flight pilot fee",
      "Transport from Bir landing spot to Billing takeoff cliff",
      "Certified climbing helmet & wind protection gloves",
      "Full HD GoPro video recording (selfie stick mount)",
      "Safety insurance coverage during flight hours"
    ],
    bring: [
      "Sturdy sneakers or boots (absolutely no slippers)",
      "Windproof jacket or hoodie (it gets cold at high altitude)",
      "Sunglasses for high-intensity sunlight glare"
    ],
    locationDetails: {
      address: "Billing Takeoff Spot, Bir, Kangra District, Himachal Pradesh",
      travelTime: "45 minutes jeep ride from Bir market center",
      parking: "Free parking at the landing site base camp",
      transit: "Overnight buses from Delhi/Chandigarh to Bir Bus Stand + 5 mins walk"
    },
    host: {
      name: "Arjun Katoch",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      tripsHosted: 850,
      rating: 4.9,
      yearsActive: 10,
      languages: ["Hindi", "English", "Pahari"],
      responseTime: "within 30 minutes",
      bio: "Arjun is a veteran cross-country paragliding pilot who has represented India in national gliding events. He has completed over 5,000 commercial flights safely."
    },
    communityStats: {
      recentStories: 32,
      memoriesShared: 198,
      campfireCount: 2,
      activityLog: [
        "Vikram uploaded a sunset landing video 4 hours ago",
        "Pilot Arjun updated: 'Stable wind conditions expected all week'"
      ]
    },
    categoryRatings: {
      safety: 4.95,
      guide: 4.9,
      value: 4.75,
      fun: 5.0,
      photos: 4.8
    },
    aiReviewSummary: "Reviewers emphasize Arjun's expert piloting skills, particularly during landing which is described as extremely smooth. The views are highly emotional and majestic. Warm clothing is strongly advised.",
    reviews: [
      { id: "rev-11", user: "Kunal Sharma", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", rating: 5, date: "May 10, 2026", content: "What a rush! Arjun made me feel completely comfortable. The thermals were good, so we stayed up for almost 40 minutes. He even let me control the glider handles for a brief second. Insanely good view of the snow caps.", helpfulCount: 31, isVerified: true, completedBadge: true },
      { id: "rev-12", user: "Simran Kaur", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", rating: 5, date: "May 02, 2026", content: "Incredible flight over Bir Billing. Arjun is extremely experienced and knows how to ride the wind currents perfectly. The sunset landing was smooth and beautiful.", helpfulCount: 20, isVerified: true, completedBadge: true },
      { id: "rev-13", user: "Amit Verma", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", rating: 4, date: "April 24, 2026", content: "Soaring at 8000 feet with the Himalayan vultures was majestic. A bit scary at takeoff but once in the air, it is peaceful and breathtaking.", helpfulCount: 14, isVerified: true, completedBadge: true },
      { id: "rev-14", user: "Neha Singh", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", rating: 5, date: "April 10, 2026", content: "The takeoff was thrilling! The pilot explained safety procedures clearly. The GoPro footage they provided is high quality. Best paragliding in India.", helpfulCount: 18, isVerified: true, completedBadge: true },
      { id: "rev-15", user: "Rahul Malhotra", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", rating: 5, date: "March 29, 2026", content: "Arjun is a champ! He did some acrobatics at the end on request. High adrenaline and super fun. Totally recommend the cross-country tandem flight.", helpfulCount: 25, isVerified: true, completedBadge: true },
      { id: "rev-16", user: "Priya Patel", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", rating: 4, date: "March 15, 2026", content: "Stable wind and clear sunny skies. The view of monasteries from above was surreal. Extremely professional safety gear.", helpfulCount: 8, isVerified: true, completedBadge: true },
      { id: "rev-17", user: "Gaurav Sharma", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop", rating: 5, date: "February 28, 2026", content: "Absolute bucket list item checked! Arjun and team are very organized. The mountain jeep ride up to takeoff is bumpy but exciting.", helpfulCount: 17, isVerified: true, completedBadge: true },
      { id: "rev-18", user: "Sneha Reddy", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=150&auto=format&fit=crop", rating: 5, date: "February 12, 2026", content: "Felt like a bird flying over the pine forests. Arjun managed to find great thermals so we got extra flight time. Highly professional guides.", helpfulCount: 19, isVerified: true, completedBadge: true },
      { id: "rev-19", user: "Abhishek Nair", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop", rating: 4, date: "January 25, 2026", content: "Takeoff was a simple jog and then we were in the air. The pilot handled landing very carefully. Very good GoPro shots.", helpfulCount: 11, isVerified: true, completedBadge: true },
      { id: "rev-20", user: "Ritu Phogat", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop", rating: 5, date: "January 05, 2026", content: "Spectacular winter views of snow-capped mountains. A must-do for everyone visiting Bir. Safe, exciting, and professional.", helpfulCount: 15, isVerified: true, completedBadge: true }
    ],
    faqs: [
      { q: "Is there a weight limit for paragliding?", a: "Yes, the participant weight must be between 35 kg and 95 kg for safety standards and smooth takeoffs." },
      { q: "Can kids perform this paragliding activity?", a: "Children above 12 years can fly tandem with parental consent and dynamic pilot assessment." }
    ]
  },
  "overnight-bioluminescent-kayaking": {
    id: "exp-3",
    title: "Overnight Bioluminescent Kayaking",
    category: "Water Sports",
    rating: 4.95,
    reviewsCount: 74,
    location: "Gokarna, Karnataka",
    duration: "1 Night",
    difficulty: "Medium",
    price: 2800,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Paddle through dark waters under a starry sky as the ocean glows blue with bioluminescent plankton. Camp on a secluded beach under the stars.",
    storyIntro: "Gokarna's backwater bays host a seasonal miracle. When night falls, micro-organisms called dinoflagellates emit a brilliant cold blue light whenever agitated. In a double-seater kayak, you will paddle into this neon wonderland.",
    stories: [
      {
        title: "Painting with Water",
        paragraph: "Every stroke of your paddle leaves a glowing blue footprint in the dark sea. Scoop up the water and watch bioluminescent droplets slide down your hands like glowing diamonds.",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop"
      },
      {
        title: "Beachside Campfire tales",
        paragraph: "After kayaking, dock on a secluded beach accessible only by water. Sit around a crackling wood campfire, look up at the Milky Way, and sleep in cozy weather-proof tents.",
        image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800&auto=format&fit=crop"
      }
    ],
    highlights: [
      "Night Paddling Guides",
      "Safety Glowsticks Provided",
      "Cozy Beach Tents",
      "Star Gazing Session",
      "Campfire & Dinner",
      "Double Kayak Options"
    ],
    timeline: [
      { time: "05:00 PM", title: "Gather at Nirvana Beach Base", note: "Meet the team, pick up safety jackets, and pitch initial luggage." },
      { time: "06:00 PM", title: "Sunset Kayak Training", note: "Practice rowing, turning, and recovery in shallow water." },
      { time: "07:30 PM", title: "Dinner Buffet (Local style)", note: "Fresh homecooked coastal curry served beachside." },
      { time: "08:45 PM", title: "Night Paddle (Bioluminescent Hunt)", note: "Rowing into the dark bay to experience the glowing blue waters." },
      { time: "10:30 PM", title: "Campfire & Stargazing stories", note: "Stories by the fire, spotting constellations with green lasers." },
      { time: "11:30 PM", title: "Tent Sleepover", note: "Rest under the stars in double-sharing canvas tents." }
    ],
    included: [
      "Kayak, lightweight carbon paddles, and life jacket",
      "Beach camping tents (double sharing) with inflatable mats",
      "Local coastal dinner and morning tea/breakfast",
      "Night navigation guide with security escort boat",
      "Campfire setup permissions"
    ],
    bring: [
      "Change of quick-dry clothes (shorts recommended)",
      "Headlamps or small flashlights",
      "Personal toiletries and towels",
      "Powerbank for charging phones"
    ],
    locationDetails: {
      address: "Nirvana Beach Backwater Estuary, Kumta-Gokarna, Karnataka",
      travelTime: "25 minutes drive from Gokarna town center",
      parking: "Private secure parking for cars/bikes at beach base camp",
      transit: "Auto-rickshaws available from Gokarna Road Station (GOK)"
    },
    host: {
      name: "Ravi Shankar",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      tripsHosted: 310,
      rating: 4.96,
      yearsActive: 4,
      languages: ["Kannada", "English", "Hindi"],
      responseTime: "within an hour",
      bio: "Ravi is a certified flat-water kayaking instructor and professional marine naturalist. He is deeply knowledgeable about Gokarna's coastal ecology and bio-cycles."
    },
    communityStats: {
      recentStories: 25,
      memoriesShared: 142,
      campfireCount: 3,
      activityLog: [
        "Sneha created a thread: 'Plankton density is peaking this week!'",
        "Host Ravi added: 'Forecast looks cloudless, stargazing will be clear.'"
      ]
    },
    categoryRatings: {
      safety: 4.9,
      guide: 5.0,
      value: 4.9,
      fun: 4.95,
      photos: 4.7
    },
    aiReviewSummary: "Explorers find the bioluminescent effect magical and surreal, almost like something out of Avatar. Ravi's storytelling and knowledge of the night sky make the stargazing segment a huge highlight.",
    reviews: [
      { id: "rev-21", user: "Meera Sen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", rating: 5, date: "April 18, 2026", content: "Pure magic. The moment you paddle, the water glows bright blue! I could see the glowing swirls behind my paddle. Sleeping in a tent with the sound of the ocean was peaceful. Food was simple and delicious.", helpfulCount: 40, isVerified: true, completedBadge: true },
      { id: "rev-22", user: "Karthik R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", rating: 5, date: "April 05, 2026", content: "Kayaking in absolute darkness and seeing the sea glow blue at every splash is a spiritual experience. Ravi is an outstanding guide who knows the night sky very well.", helpfulCount: 27, isVerified: true, completedBadge: true },
      { id: "rev-23", user: "Deepa Gowda", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", rating: 4, date: "March 22, 2026", content: "Breathtaking night trip. The bioluminescent planktons are so bright when you dip your hands in. Camping tents are comfortable and double sharing is perfect.", helpfulCount: 15, isVerified: true, completedBadge: true },
      { id: "rev-24", user: "Shreya Ghoshal", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop", rating: 5, date: "March 11, 2026", content: "Ravi naturalistic stories are super engaging! Loved learning about Gokarna's ecosystem. The beach campfire was very cozy and we had hot curry.", helpfulCount: 22, isVerified: true, completedBadge: true },
      { id: "rev-25", user: "Nikhil D'Souza", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", rating: 5, date: "February 28, 2026", content: "Top tier coastal camping. Rowed for almost 2 hours in the glow. Saw several shooting stars during stargazing block. Excellent security escort.", helpfulCount: 19, isVerified: true, completedBadge: true },
      { id: "rev-26", user: "Tanvi Shah", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=150&auto=format&fit=crop", rating: 4, date: "February 10, 2026", content: "Simple yet hearty local coastal dinner. Kayaks and paddles are light weight and easy to row. The blue sparkles in the water are magical.", helpfulCount: 11, isVerified: true, completedBadge: true },
      { id: "rev-27", user: "Arjun Mehta", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", rating: 5, date: "January 20, 2026", content: "Perfect visibility. The water is warm and calm. Tents are clean and robust. Highly recommend to anyone seeking raw coastal adventure.", helpfulCount: 21, isVerified: true, completedBadge: true },
      { id: "rev-28", user: "Kavya Hegde", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", rating: 5, date: "January 04, 2026", content: "A dreamlike experience. It feels like paddling through stars under water. Guides are very patient and focus heavily on safety vest standards.", helpfulCount: 18, isVerified: true, completedBadge: true },
      { id: "rev-29", user: "Pranav Rao", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop", rating: 4, date: "December 18, 2025", content: "Great training for beginners at sunset. The actual night row is spectacular. Felt very safe with the rescue support boat accompanying us.", helpfulCount: 13, isVerified: true, completedBadge: true },
      { id: "rev-30", user: "Rashi Kapoor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", rating: 5, date: "December 02, 2025", content: "Best night in Gokarna! Singing by the campfire and counting constellations. The bioluminescent sparkles are a sight to behold.", helpfulCount: 25, isVerified: true, completedBadge: true }
    ],
    faqs: [
      { q: "Is the glow visible throughout the year?", a: "Bioluminescence peaks between November and May when water temperatures are warm and rainfall is minimal. We monitor counts daily to ensure visibility." },
      { q: "What is the tent sharing policy?", a: "Tents are on a double-sharing basis. Solo female travelers are paired together, or you can request an individual tent for a small extra setup fee." }
    ]
  },
  "heritage-fort-rappelling-bouldering": {
    id: "exp-4",
    title: "Heritage Fort Rappelling & Bouldering",
    category: "Adventure",
    rating: 4.7,
    reviewsCount: 52,
    location: "Hampi, Karnataka",
    duration: "5 Hours",
    difficulty: "Extreme",
    price: 1800,
    originalPrice: 2400,
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Tackle the historic boulders of Hampi. Learn traditional rock climbing techniques and rappel down towering ruins with certified guides.",
    storyIntro: "Hampi's granite landscape is a climber's playground. Thousands of balancing rocks dot the historic hills around the Tungabhadra River. In this adventure, you'll learn to boulder on these unique formations and rappel down a historic 80-foot granite cliff.",
    stories: [
      {
        title: "The Granite Playground",
        paragraph: "Tackle route puzzles on Hampi's famous orange granite. Bouldering is like chess on rocks—using your fingers, balance, and core strength to pull yourself up short but technical faces.",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop"
      },
      {
        title: "Defying Gravity",
        paragraph: "Step off the edge of an 80-foot vertical historic cliff. Leaning backward into space, you feed the rope through your descender, taking controlled hops down the sheer rock wall with Hampi's ruins stretching below you.",
        image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop"
      }
    ],
    highlights: [
      "UIAA Safety Equipment",
      "Chalk & Climbing Shoes",
      "Experienced Climbers",
      "Scenic Ruins Overlook",
      "Energy Bars & hydration",
      "Rappelling Certifcate"
    ],
    timeline: [
      { time: "06:30 AM", title: "Meetup at Hampi Bazaar", note: "Early start to beat the hot sun. Pick up climbing shoes." },
      { time: "07:00 AM", title: "Warmup hike & Bouldering basics", note: "Stretching and learning proper finger/foot placement." },
      { time: "08:15 AM", title: "First Bouldering Problems", note: "Cracking easy/medium routes with crash pads beneath." },
      { time: "09:30 AM", title: "Ascent to Rappelling Cliff", note: "Hike to the peak overlooking the Vijayanagara ruins." },
      { time: "10:00 AM", title: "Safety anchor setups & Rappel", note: "Step off the edge for an exciting 80-foot drop." },
      { time: "11:30 AM", title: "Certificates & Fruit bowls", note: "Refueling and celebrating the completed rappel." }
    ],
    included: [
      "Climbing harnesses, dynamic ropes, descenders, and helmets",
      "Climbing chalk bags and rental climbing shoes",
      "Certified climbing instructors (UIAA certified)",
      "Crash pads for bouldering safety cushioning",
      "Snacks (banana, energy bars, and electrolyte drinks)"
    ],
    bring: [
      "Comfortable stretchy athletic clothing",
      "Socks (required for rental climbing shoes)",
      "High-SPF sunscreen & sun hat",
      "Camera or phone for epic action photos"
    ],
    locationDetails: {
      address: "Hemakuta Hill Climbing Crags, Hampi, Bellary District, Karnataka",
      travelTime: "10 minutes walk from Virupaksha Temple",
      parking: "Parking available at the temple base parking complex",
      transit: "Local buses or autos from Hospet Railway Junction (HPT) to Hampi Bazaar"
    },
    host: {
      name: "Karan Boulderer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      tripsHosted: 240,
      rating: 4.8,
      yearsActive: 8,
      languages: ["Hindi", "English", "Kannada", "Telugu"],
      responseTime: "within 2 hours",
      bio: "Karan is an avid rock climber who mapped several bouldering routes in Hampi. He is dedicated to climbing safety standards and runs workshops for youth."
    },
    communityStats: {
      recentStories: 18,
      memoriesShared: 75,
      campfireCount: 1,
      activityLog: [
        "Karan added a route: 'Monkey Face V3 is fully chalked!'",
        "Ramesh posted: 'Found a lost climbing glove near Hemakuta site'"
      ]
    },
    categoryRatings: {
      safety: 4.95,
      guide: 4.85,
      value: 4.7,
      fun: 4.8,
      photos: 4.9
    },
    aiReviewSummary: "Rappelling down the 80ft cliff is described as thrilling and highly safe. The guides are extremely attentive. Climbing shoes are provided, but participants suggest arriving early to get the correct size.",
    reviews: [
      { id: "rev-31", user: "Vijay Krishnan", avatar: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?q=80&w=150&auto=format&fit=crop", rating: 5, date: "March 02, 2026", content: "What a rush rappelling down Hemakuta cliff! Karan's anchor setups are triple-redundant and super solid. Bouldering is tough on the fingers, but Hampi's granite is phenomenal. Highlight of my Hampi trip.", helpfulCount: 14, isVerified: true, completedBadge: true },
      { id: "rev-32", user: "Preeti Deshmukh", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", rating: 5, date: "February 20, 2026", content: "Awesome guides and safety equipment standards. Karan was very encouraging and patiently taught bouldering routes to absolute beginners like me.", helpfulCount: 11, isVerified: true, completedBadge: true },
      { id: "rev-33", user: "Ashish Pandey", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", rating: 4, date: "February 05, 2026", content: "Great granite climbing boulders! The view from the top of Hemakuta hill at sunrise was magnificent. Make sure to wear socks for the climbing shoes.", helpfulCount: 8, isVerified: true, completedBadge: true },
      { id: "rev-34", user: "Swati Bhat", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", rating: 5, date: "January 18, 2026", content: "Super thrilling rappel down the 80 feet vertical wall. Instructors gave safety checks twice. The snacks package is a nice touch to recharge.", helpfulCount: 12, isVerified: true, completedBadge: true },
      { id: "rev-35", user: "Harish Gowda", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop", rating: 5, date: "January 02, 2026", content: "Karan's deep knowledge of Hampi's bouldering routes makes the session highly engaging. Safe crash pads and excellent instructions.", helpfulCount: 16, isVerified: true, completedBadge: true },
      { id: "rev-36", user: "Archana S.", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=150&auto=format&fit=crop", rating: 4, date: "December 20, 2025", content: "Loved bouldering! Challenging for upper body but super rewarding when you solve a route. Rappelling has secondary backup ropes.", helpfulCount: 7, isVerified: true, completedBadge: true },
      { id: "rev-37", user: "Sandeep Shenoy", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", rating: 5, date: "December 05, 2025", content: "Best climbing experience in Hampi. Karan knows the routes like the back of his hand. Excellent gear condition. Triple-anchor redudancy check.", helpfulCount: 15, isVerified: true, completedBadge: true },
      { id: "rev-38", user: "Rashmi R.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop", rating: 5, date: "November 18, 2025", content: "Leaning back into 80-foot empty space is terrifying at first but incredibly empowering. The view of ruins from the wall is amazing.", helpfulCount: 18, isVerified: true, completedBadge: true },
      { id: "rev-39", user: "Tejas K.", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=150&auto=format&fit=crop", rating: 4, date: "November 02, 2025", content: "Great instruction on finger holds and foot placements. Bouldering routes were fun. Recommended to start early to beat the Hampi heat.", helpfulCount: 9, isVerified: true, completedBadge: true },
      { id: "rev-40", user: "Nandini J.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=150&auto=format&fit=crop", rating: 5, date: "October 15, 2025", content: "Karan and his co-guides are fantastic teachers. Highly professional safety setup and triple backup. Loved every minute of this adventure.", helpfulCount: 14, isVerified: true, completedBadge: true }
    ],
    faqs: [
      { q: "Do I need prior climbing experience?", a: "No, this program is designed to guide absolute beginners. The boulders have simple routes and the rappelling descent is fully regulated by our guides using secondary backup lines." },
      { q: "Are climbing shoes provided?", a: "Yes, we provide climbing shoes in standard sizes. Please bring socks for hygiene purposes." }
    ]
  }
};

// Generic Fallback Experience Details in case slug doesn't match
const FALLBACK_EXPERIENCE: ExperienceDetail = EXPERIENCES_DATABASE["scuba-diving-coral-exploration"];

export default function ExperienceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const rawSlug = params["experience-slug"];
  const experienceSlug = typeof rawSlug === "string" ? rawSlug : "";

  // Fetch the detailed experience from database, fallback if not found
  const experience = useMemo(() => {
    if (EXPERIENCES_DATABASE[experienceSlug]) {
      return EXPERIENCES_DATABASE[experienceSlug];
    }
    // Attempt partial match
    const keys = Object.keys(EXPERIENCES_DATABASE);
    const partialMatch = keys.find((key) => key.includes(experienceSlug) || experienceSlug.includes(key));
    if (partialMatch) {
      return EXPERIENCES_DATABASE[partialMatch];
    }
    return FALLBACK_EXPERIENCE;
  }, [experienceSlug]);

  // Slideshow States
  const [activeSlide, setActiveSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Booking details states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [participantsCount, setParticipantsCount] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const coupons = useMemo(() => ({
    WANDER20: { type: "percent" as const, value: 20, desc: "20% OFF" },
    WELCOME10: { type: "percent" as const, value: 10, desc: "10% OFF" },
    ADVENTURE30: { type: "percent" as const, value: 30, desc: "30% OFF" },
    FREE500: { type: "flat" as const, value: 500, desc: "₹500 OFF" },
  }), []);

  // Auto-apply if exact match on typing
  useEffect(() => {
    const codeUpper = couponCode.toUpperCase().trim();
    if (codeUpper === "") {
      setAppliedCoupon("");
      setCouponError("");
      return;
    }
    if (coupons[codeUpper as keyof typeof coupons]) {
      setAppliedCoupon(codeUpper);
      setCouponError("");
    } else {
      if (appliedCoupon && appliedCoupon !== codeUpper) {
        setAppliedCoupon("");
      }
    }
  }, [couponCode, coupons, appliedCoupon]);

  const handleApplyCoupon = () => {
    const codeUpper = couponCode.toUpperCase().trim();
    if (codeUpper === "") {
      setCouponError("Please enter a coupon code");
      setAppliedCoupon("");
      return;
    }
    if (coupons[codeUpper as keyof typeof coupons]) {
      setAppliedCoupon(codeUpper);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon("");
    }
  };

  const handleSelectCoupon = (code: string) => {
    setCouponCode(code);
    setAppliedCoupon(code);
    setCouponError("");
  };

  // Reviews active pagination index state
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Reset active review page when experience changes
  useEffect(() => {
    setActiveReviewIdx(0);
  }, [experience]);

  const totalReviewsPages = useMemo(() => {
    return Math.ceil(experience.reviews.length / 2);
  }, [experience.reviews]);

  const activeReviews = useMemo(() => {
    const startIndex = activeReviewIdx * 2;
    return experience.reviews.slice(startIndex, startIndex + 2);
  }, [experience.reviews, activeReviewIdx]);

  // Dynamic calculations
  const totalAmount = useMemo(() => {
    return experience.price * participantsCount;
  }, [experience.price, participantsCount]);

  const discountAmount = useMemo(() => {
    return (experience.originalPrice - experience.price) * participantsCount;
  }, [experience.originalPrice, experience.price, participantsCount]);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const coupon = coupons[appliedCoupon as keyof typeof coupons];
    if (!coupon) return 0;
    
    if (coupon.type === "percent") {
      return Math.round(totalAmount * (coupon.value / 100));
    } else {
      return Math.min(totalAmount, coupon.value);
    }
  }, [appliedCoupon, coupons, totalAmount]);

  const finalGrandTotal = useMemo(() => {
    return Math.max(0, totalAmount - couponDiscount);
  }, [totalAmount, couponDiscount]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveSlide((prev) => (prev + 1) % experience.galleryImages.length);
      } else if (e.key === "ArrowLeft") {
        setActiveSlide((prev) => (prev - 1 + experience.galleryImages.length) % experience.galleryImages.length);
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [experience.galleryImages.length, isFullscreen]);

  const handleBookClick = () => {
    // Navigate to dynamic booking page
    router.push(`/book/${experienceSlug || "scuba-diving-coral-exploration"}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      <Navbar showBackButton backHref="/experiences" />

      {/* Main Container */}
      <main className="flex-1 w-full flex flex-col items-center pt-24 pb-20">
        
        {/* PREMIUM IMMERSIVE HERO: 80vh gallery */}
        <section className="relative w-full max-w-[1440px] px-4 md:px-8 mb-12">
          <div className="h-[50vh] md:h-[65vh] lg:h-[80vh] w-full rounded-3xl overflow-hidden relative group/hero shadow-2xl bg-zinc-950 border border-white/5">
            
            {/* Gallery Slide */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSlide}
                src={experience.galleryImages[activeSlide]}
                alt={`${experience.title} Slide ${activeSlide + 1}`}
                initial={{ opacity: 0.8, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.8 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/45 pointer-events-none" />

            {/* Float Overlay Actions: Top row */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <span className="text-[10px] md:text-xs font-black text-white bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md uppercase tracking-widest border border-white/10 shadow-lg">
                {experience.category}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer backdrop-blur-md shadow-lg ${
                    wishlisted
                      ? "bg-brand-indigo border-brand-indigo text-white scale-110"
                      : "bg-black/50 border-white/10 text-white hover:bg-white hover:text-black"
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${wishlisted ? "fill-white" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Experience link copied to clipboard!");
                  }}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md shadow-lg"
                >
                  <Share2 className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="h-9 w-9 rounded-full flex items-center justify-center bg-black/50 border border-white/10 text-white hover:bg-white hover:text-black transition-all cursor-pointer backdrop-blur-md shadow-lg"
                >
                  <Maximize2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Hero Left/Right Slide Controls */}
            <button
              onClick={() => setActiveSlide((prev) => (prev - 1 + experience.galleryImages.length) % experience.galleryImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-black/40 hover:bg-white hover:text-black text-white border border-white/5 transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer backdrop-blur-md z-10"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev + 1) % experience.galleryImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-black/40 hover:bg-white hover:text-black text-white border border-white/5 transition-all opacity-0 group-hover/hero:opacity-100 cursor-pointer backdrop-blur-md z-10"
            >
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>

            {/* Bottom Overlay Summary details */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
              <div className="text-left max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded-full text-[10px] font-bold text-brand-amber">
                    <Star className="h-3.5 w-3.5 fill-brand-amber text-brand-amber" />
                    {experience.rating}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                    ({experience.reviewsCount} reviews)
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-none mb-3">
                  {experience.title}
                </h1>
                <p className="text-xs md:text-sm text-zinc-300 font-medium leading-relaxed drop-shadow-md">
                  {experience.description}
                </p>
              </div>

              {/* Slide Counter strip */}
              <div className="flex items-center gap-2 self-start md:self-end bg-black/55 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md text-[10px] font-mono font-bold">
                <span className="text-brand-cyan">{activeSlide + 1}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400">{experience.galleryImages.length}</span>
              </div>
            </div>

            {/* Autoplay Progress Line Indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <motion.div
                key={activeSlide}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 7, ease: "linear" }}
                onAnimationComplete={() => setActiveSlide((prev) => (prev + 1) % experience.galleryImages.length)}
                className="h-full bg-brand-cyan"
              />
            </div>
          </div>

          {/* Miniature Thumbnail Strips */}
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar justify-start mt-4 px-1 py-1">
            {experience.galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-16 w-24 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer relative ${
                  activeSlide === idx
                    ? "border-brand-cyan scale-105 shadow-md shadow-brand-cyan/20"
                    : "border-white/5 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        {/* TWO-COLUMN LAYOUT: Content Panel + Sticky Booking Sidebar */}
        <section className="w-full max-w-[1440px] px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
          
          {/* LEFT COLUMN: Main details and storytelling story */}
          <div className="lg:col-span-2 flex flex-col gap-12 text-left">
            
            {/* QUICK STATS WRAPPER */}
            <div className="glass-panel p-6 rounded-3xl grid grid-cols-2 sm:grid-cols-4 gap-6 relative overflow-hidden border border-white/5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Location</span>
                <span className="text-xs text-white font-black truncate flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-brand-cyan shrink-0" />
                  {experience.location.split(",")[0]}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Duration</span>
                <span className="text-xs text-white font-black flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-brand-cyan shrink-0" />
                  {experience.duration}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Difficulty</span>
                <span className="text-xs text-white font-black flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-brand-cyan shrink-0" />
                  {experience.difficulty}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Rating Score</span>
                <span className="text-xs text-brand-amber font-black flex items-center gap-1">
                  <Star className="h-4 w-4 fill-brand-amber text-brand-amber shrink-0" />
                  {experience.rating} ({experience.reviewsCount})
                </span>
              </div>
            </div>

            {/* CHRONOLOGICAL VERTICAL TIMELINE */}
            <div className="flex flex-col gap-6 border-t border-white/5 pt-8">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Chronological Journey</h3>
              <div className="flex flex-col gap-0 relative pl-4 border-l border-white/10 ml-2">
                {experience.timeline.map((stop, idx) => (
                  <div key={idx} className="relative pb-8 text-left">
                    {/* Circle Bullet icon */}
                    <div className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-brand-cyan border border-brand-bg shadow-md shadow-brand-cyan/20 z-10" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full w-fit">
                        {stop.time}
                      </span>
                      <h4 className="text-sm font-black text-white uppercase tracking-tight">{stop.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-1">
                      {stop.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <aside className="w-full flex flex-col gap-6 sticky top-28 shrink-0">

            {/* Main Booking Card Box */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-5 text-left">
              
              {/* Pricing section */}
              <div className="flex justify-between items-end border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block leading-none">Starting Rate</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-2xl font-black text-white leading-none">
                      ₹{experience.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-zinc-600 font-mono line-through font-bold">
                      ₹{experience.originalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  Save ₹{(experience.originalPrice - experience.price).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Slot availability tags */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-400">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">Next Date Available</span>
                  <span className="text-white text-[11px] font-bold">Tomorrow, 07:30 AM</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider">Remaining Slots</span>
                  <span className="text-brand-purple text-[11px] font-bold">Only 4 left!</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
                
                {/* Coupon Code Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                    <Ticket className="h-4 w-4 text-brand-cyan shrink-0" /> Coupon Code
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Enter code (e.g. WANDER20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className={`w-full h-10 bg-zinc-950/50 border rounded-xl pl-4 pr-16 text-xs text-white outline-none transition-all uppercase tracking-wider ${
                        appliedCoupon
                          ? "border-emerald-500/50 focus:border-emerald-500 shadow-md shadow-emerald-500/5"
                          : couponError
                          ? "border-red-500/50 focus:border-red-500 shadow-md shadow-red-500/5"
                          : "border-white/10 focus:border-brand-cyan"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="absolute right-1.5 h-7 px-3 rounded-lg bg-brand-cyan hover:bg-brand-cyan/85 text-zinc-950 text-[10px] font-black uppercase transition-all tracking-wider cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {/* Status messages */}
                  {appliedCoupon && (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Code <span className="font-bold">{appliedCoupon}</span> applied! ({coupons[appliedCoupon as keyof typeof coupons].desc})
                      </span>
                    </span>
                  )}
                  {couponError && (
                    <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
                      <X className="h-3.5 w-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </span>
                  )}

                  {/* Suggest / Available coupons */}
                  <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase select-none">Available:</span>
                    {Object.keys(coupons).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleSelectCoupon(code)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          appliedCoupon === code
                            ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                            : "bg-white/5 border-white/5 hover:border-white/20 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explorers Count */}
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                    <SlidersHorizontal className="h-4 w-4 text-brand-purple shrink-0" /> Explorers Count
                  </label>
                  <div className="flex gap-2 items-center bg-zinc-950/50 border border-white/10 p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setParticipantsCount((prev) => Math.max(1, prev - 1))}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-xs text-white">{participantsCount}</span>
                    <button
                      type="button"
                      onClick={() => setParticipantsCount((prev) => Math.min(10, prev + 1))}
                      className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Cost breakdown overview panel */}
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col gap-2.5 text-xs font-mono font-bold text-zinc-400">
                <div className="flex justify-between">
                  <span>Adventures rate:</span>
                  <span>₹{experience.price.toLocaleString("en-IN")} × {participantsCount}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400/80">
                    <span>Discount applied:</span>
                    <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon ({appliedCoupon}):</span>
                    <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/5 pt-2 text-white font-mono">
                  <span>Grand Total:</span>
                  <span className="text-brand-cyan text-sm font-black">₹{finalGrandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* BOOK NOW CTA */}
              <button
                onClick={handleBookClick}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-indigo/15"
              >
                <Zap className="h-4.5 w-4.5 fill-current text-brand-cyan animate-pulse" /> Secure Booking Now
              </button>

              <span className="text-[9px] text-zinc-600 font-medium text-center block">
                No payment charges yet. You will be redirected to the secure booking application.
              </span>

            </div>

          </aside>

        </section>

        {/* CENTERED ASSURANCE & DETAILS CONTAINER */}
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 flex flex-col items-center gap-16 mt-16 pt-16 border-t border-white/5">
          
          {/* Centered Included / Bring Grid */}
          <div className="flex flex-col gap-6 text-center items-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl text-left">
              {/* Included box */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Check className="h-4.5 w-4.5 text-emerald-400" /> What is Included
                </h4>
                <ul className="flex flex-col gap-3">
                  {experience.included.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-zinc-400 font-semibold leading-relaxed">
                      <Check className="h-3.5 w-3.5 text-emerald-500/60 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to bring box */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                  <AlertCircle className="h-4.5 w-4.5 text-brand-cyan" /> What to Bring
                </h4>
                <ul className="flex flex-col gap-3">
                  {experience.bring.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 text-xs text-zinc-400 font-semibold leading-relaxed">
                      <Zap className="h-3.5 w-3.5 text-brand-cyan/60 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Centered Location / Map / Weather */}
          <div className="flex flex-col gap-6 w-full max-w-3xl text-center items-center">
            <div>
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Adventure Base Camp</h3>
            </div>
            
            {/* Map Placeholder graphic */}
            <div className="h-56 w-full rounded-2xl bg-zinc-950/80 border border-white/5 relative overflow-hidden flex items-center justify-center p-6 text-center">
              {/* Simulated Grid mesh lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#1c1c1f_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                  <Map className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Interactive Location Map</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-sm">{experience.locationDetails.address}</p>
                </div>
              </div>
            </div>

            {/* Location metadata metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-zinc-400 w-full text-left">
              <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider block">Transit Mode</span>
                <span className="text-white text-xs">{experience.locationDetails.travelTime}</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider block">Parking Access</span>
                <span className="text-white text-xs">{experience.locationDetails.parking}</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-2xl flex flex-col gap-1">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider block">Local Weather</span>
                <span className="text-white text-xs flex items-center gap-1">
                  <CloudSun className="h-4 w-4 text-yellow-500" /> Sunny, 29°C
                </span>
              </div>
            </div>
          </div>

          {/* Centered Host Profile Section */}
          <div className="w-full max-w-3xl">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col items-center gap-6 relative overflow-hidden text-center">
              <div className="relative shrink-0">
                <img src={experience.host.avatar} alt={experience.host.name} className="h-20 w-20 rounded-2xl object-cover border border-white/10" />
                {experience.host.isVerified && (
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand-cyan flex items-center justify-center text-zinc-950 border border-brand-bg">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-base font-black text-white uppercase tracking-tight">{experience.host.name}</h4>
                  <span className="text-[9px] font-mono font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/10 uppercase tracking-wider">
                    Verified Host
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium max-w-xl">
                  {experience.host.bio}
                </p>
                <div className="grid grid-cols-3 gap-6 border-t border-white/5 pt-4 mt-1.5 text-[10px] text-zinc-500 font-mono font-semibold w-full max-w-md justify-items-center">
                  <div>
                    <span className="block text-zinc-600">Response Speed</span>
                    <span className="text-white font-bold">{experience.host.responseTime}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-600">Reviews Score</span>
                    <span className="text-brand-amber font-bold flex items-center gap-0.5 justify-center">
                      <Star className="h-3 w-3 fill-brand-amber text-brand-amber" /> {experience.host.rating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-zinc-600">Total Adventures</span>
                    <span className="text-white font-bold">{experience.host.tripsHosted} Hosted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Policies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center justify-items-center w-full max-w-3xl border-t border-white/5 pt-8">
            <div className="flex flex-col gap-2 max-w-xs items-center">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest">Cancellation Policies</span>
              <p className="text-zinc-500 leading-relaxed text-xs">
                Cancel up to 72 hours before the start of the adventure for a 100% refund. Cancellations made within 48 hours of the event start time will be credited as future adventure travel vouchers.
              </p>
            </div>
            <div className="flex flex-col gap-2 max-w-xs items-center">
              <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest">Weather & Safety Terms</span>
              <p className="text-zinc-500 leading-relaxed text-xs">
                All experiences are subject to safety checks. If the host cancels due to rain, high currents, or regulatory warnings, you will be offered an alternative date or an instant refund.
              </p>
            </div>
          </div>

        </div>

        {/* REVIEWS SECTION - Covers complete width of device with slider/pagination controls */}
        <section className="w-full max-w-[1440px] px-4 md:px-8 border-t border-white/5 pt-16 mt-16 text-left" id="reviews-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Verified Reviews</h3>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-2">What Other Explorers Say</h2>
            </div>

            {/* Pagination controls replacing all, helpful, photos */}
            <div className="flex items-center gap-3 bg-zinc-900/60 p-1.5 rounded-xl border border-white/5 h-10 self-start md:self-auto mt-2 md:mt-0">
              <button
                onClick={() => setActiveReviewIdx((prev) => (prev - 1 + totalReviewsPages) % totalReviewsPages)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white text-zinc-400 hover:text-zinc-950 border border-white/5 hover:border-white transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="text-[11px] font-mono font-black text-white px-2">
                {activeReviewIdx + 1} / {totalReviewsPages}
              </span>
              <button
                onClick={() => setActiveReviewIdx((prev) => (prev + 1) % totalReviewsPages)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white text-zinc-400 hover:text-zinc-950 border border-white/5 hover:border-white transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

          {/* REVIEW RATINGS MATRIX CARD (Full Width) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01] grid grid-cols-1 md:grid-cols-4 gap-6 items-center mt-6 w-full">
            <div className="text-center md:border-r md:border-white/5 md:pr-6">
              <span className="text-4xl font-black text-white leading-none block">{experience.rating}</span>
              <div className="flex justify-center my-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.floor(experience.rating)
                        ? "fill-brand-amber text-brand-amber"
                        : "text-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
                {experience.reviewsCount} verified reviews
              </span>
            </div>

            <div className="md:col-span-3 grid grid-cols-2 gap-4 text-[10px] font-mono text-zinc-400 font-semibold">
              <div className="flex items-center justify-between">
                <span>Safety & Standards</span>
                <span className="text-brand-cyan font-bold">{experience.categoryRatings.safety.toFixed(1)}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Guide Professionalism</span>
                <span className="text-brand-cyan font-bold">{experience.categoryRatings.guide.toFixed(1)}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Value for money</span>
                <span className="text-brand-cyan font-bold">{experience.categoryRatings.value.toFixed(1)}/5.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fun & excitement</span>
                <span className="text-brand-cyan font-bold">{experience.categoryRatings.fun.toFixed(1)}/5.0</span>
              </div>
            </div>
          </div>

          {/* Active Reviews (Cover complete width and in 2/2 grid) */}
          <div className="mt-6 w-full">
            {activeReviews.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeReviewIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                >
                  {activeReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col justify-between gap-4 text-left hover:border-white/10 transition-all duration-300 relative w-full h-full"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <img src={rev.avatar} alt={rev.user} className="h-10 w-10 rounded-xl object-cover border border-white/5" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white uppercase tracking-tight">{rev.user}</span>
                                {rev.isVerified && (
                                  <span className="h-3.5 w-3.5 rounded-full bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
                                    <Check className="h-2 w-2 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-wider">{rev.date}</span>
                            </div>
                          </div>

                          {/* Stars count */}
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`h-3 w-3 ${s <= rev.rating ? "fill-brand-amber text-brand-amber" : "text-zinc-700"}`} />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                          {rev.content}
                        </p>

                        {/* Review attached photos */}
                        {rev.photos && (rev.photos ?? []).length > 0 && (
                          <div className="flex gap-2">
                            {(rev.photos ?? []).map((photo, pIdx) => (
                              <div key={pIdx} className="h-16 w-24 rounded-xl overflow-hidden border border-white/5">
                                <img src={photo} alt="review photo" className="h-full w-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[10px] font-mono text-zinc-600 font-semibold mt-auto">
                        <div className="flex items-center gap-2">
                          <button className="hover:text-white transition-colors cursor-pointer">Helpful ({rev.helpfulCount})</button>
                          <span>•</span>
                          <button className="hover:text-white transition-colors cursor-pointer">Reply</button>
                        </div>
                        {rev.completedBadge && (
                          <span className="text-brand-cyan bg-brand-cyan/5 border border-brand-cyan/10 px-2 py-0.5 rounded-full uppercase tracking-wider text-[9px] font-black">
                            Completed Trip
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* RELATED EXPERIENCES HORIZONTAL IMMERSIVE SHOWCASE */}
        <section className="w-full max-w-[1440px] px-4 md:px-8 border-t border-white/5 pt-16 mt-16 text-left">
          <div className="mb-8">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Wander AI Recommendations</h3>
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-2">Similar Wilderness Adventures</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(EXPERIENCES_DATABASE)
              .filter((key) => key !== experienceSlug)
              .slice(0, 3)
              .map((key) => {
                const item = EXPERIENCES_DATABASE[key];
                return (
                  <Link
                    href={`/experiences/${key}`}
                    key={item.id}
                    className="glass-panel rounded-3xl overflow-hidden flex flex-col justify-between group/card transition-all duration-300 shine-card shine-card-cyan border border-white/5"
                  >
                    <div className="h-40 w-full relative overflow-hidden bg-zinc-950">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
                        <span className="text-[9px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-md uppercase tracking-wider border border-white/5">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1 bg-black/65 px-2 py-0.5 rounded-full backdrop-blur-md text-[9px] font-bold text-brand-amber border border-white/5">
                          <Star className="h-3 w-3 fill-brand-amber text-brand-amber" />
                          {item.rating}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1 text-left">
                      <div>
                        <h4 className="text-xs font-black text-white leading-snug group-hover/card:text-brand-cyan transition-colors line-clamp-1 uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <span className="text-[9px] text-zinc-500 font-bold block mt-1">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-4 text-[9px] font-mono text-zinc-400">
                        <span>{item.duration}</span>
                        <span className="text-brand-cyan font-black">₹{item.price.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>

      </main>

      <Footer />

      {/* MOBILE FLOATING BOOK CTA DOCK - Bottom stick overlay */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/80 border-t border-white/10 p-4 backdrop-blur-lg flex items-center justify-between gap-4">
        <div className="text-left">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block leading-none">Starting Rate</span>
          <span className="text-lg font-black text-white block mt-1 leading-none">
            ₹{experience.price.toLocaleString("en-IN")}
          </span>
        </div>
        <button
          onClick={handleBookClick}
          className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-indigo/15"
        >
          <Zap className="h-4 w-4 fill-current text-brand-cyan" /> Secure Booking
        </button>
      </div>

      {/* FULLSCREEN IMAGE GALLERY MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white text-zinc-400 hover:text-black border border-white/10 transition-all cursor-pointer z-50"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-5xl h-full flex flex-col justify-center items-center gap-6">
              
              {/* Main Fullscreen Image */}
              <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center bg-zinc-950 rounded-2xl overflow-hidden border border-white/5">
                <img
                  src={experience.galleryImages[activeSlide]}
                  alt="fullscreen view"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Prev/Next buttons inside fullscreen */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveSlide((prev) => (prev - 1 + experience.galleryImages.length) % experience.galleryImages.length)}
                  className="h-10 w-24 rounded-xl bg-white/5 hover:bg-white hover:text-black text-white text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center border border-white/10"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveSlide((prev) => (prev + 1) % experience.galleryImages.length)}
                  className="h-10 w-24 rounded-xl bg-white/5 hover:bg-white hover:text-black text-white text-xs font-bold uppercase transition-all cursor-pointer flex items-center justify-center border border-white/10"
                >
                  Next
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
