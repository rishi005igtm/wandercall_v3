"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppSelector } from "@/lib/store/store";
import {
  Compass,
  MapPin,
  Clock,
  Star,
  Flame,
  Users,
  Radio,
  Award,
  MessageSquare,
  Heart,
  Share2,
  Bookmark,
  Camera,
  Plus,
  Sparkles,
  Check,
  ArrowRight,
  TrendingUp,
  User,
  UserPlus,
  CheckCircle2,
  Volleyball,
  Send,
  Zap,
  Volume2,
  Calendar,
  Image as ImageIcon,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  X,
  Upload,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Map,
  Lightbulb,
  Package,
  BookOpen,
  Utensils,
  Home,
  DollarSign
} from "lucide-react";

// Image gallery slideshow component for split views and indicators
interface FeedImageGalleryProps {
  images: string[];
  onImageClick: (idx: number) => void;
}

const FeedImageGallery = ({ images, onImageClick }: FeedImageGalleryProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (images.length < 3) return;
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  // Compute which indices are visible
  let leftIdx = 0;
  let rightIdx = 1;

  if (images.length === 2) {
    leftIdx = 0;
    rightIdx = 1;
  } else if (images.length === 3) {
    // Cycle: (0,1) -> (2,0) -> (1,2) -> repeat
    const cycles = [
      [0, 1],
      [2, 0],
      [1, 2]
    ];
    const currentCycle = cycles[tick % cycles.length];
    leftIdx = currentCycle[0];
    rightIdx = currentCycle[1];
  } else if (images.length >= 4) {
    // Cycle: (0,1) -> (2,3) -> repeat
    const cycles = [
      [0, 1],
      [2, 3]
    ];
    const currentCycle = cycles[tick % cycles.length];
    leftIdx = currentCycle[0];
    rightIdx = currentCycle[1];
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-white/5 bg-zinc-950 group">
      {images.length === 1 ? (
        // Single Image Layout
        <div 
          onClick={() => onImageClick(0)}
          className="w-full h-[220px] relative overflow-hidden cursor-pointer"
        >
          <img 
            src={images[0]} 
            alt="Adventure scene" 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
          />
        </div>
      ) : (
        // Split Image Layout
        <div className="grid grid-cols-2 gap-2 h-[220px] relative">
          {/* Left Frame */}
          <div 
            onClick={() => onImageClick(leftIdx)}
            className="relative h-full overflow-hidden cursor-pointer bg-zinc-950"
          >
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={`left-${leftIdx}`}
                src={images[leftIdx]} 
                alt="Adventure scene left" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </AnimatePresence>
          </div>

          {/* Right Frame */}
          <div 
            onClick={() => onImageClick(rightIdx)}
            className="relative h-full overflow-hidden cursor-pointer bg-zinc-950"
          >
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={`right-${rightIdx}`}
                src={images[rightIdx]} 
                alt="Adventure scene right" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Dots Indicator Overlay */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
        {images.map((_, idx) => {
          const isHighlighted = images.length === 1 
            ? idx === 0 
            : (idx === leftIdx || idx === rightIdx);
          return (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isHighlighted 
                  ? "w-3 bg-brand-cyan" 
                  : "w-1.5 bg-white/30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

// Types
interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes?: number;
  likedByMe?: boolean;
}

interface FeedPost {
  id: string;
  type: "experience" | "quest" | "memory" | "campfire" | "community" | "achievement" | "recap";
  user: {
    name: string;
    username: string;
    avatar: string;
    level: number;
    verified: boolean;
  };
  timestamp: string;
  visibility: "Public" | "Friends" | "Community";
  category?: "story" | "memory" | "itinerary" | "review" | "tips" | "food" | "stay" | "budget" | "meetup";

  // Type 1: Experience Story details
  experienceName?: string;
  location?: string;
  duration?: string;
  cost?: string;
  rating?: number;
  storyText?: string;
  images?: string[];

  // Type 2: Quest Completion details
  questName?: string;
  reward?: string;
  xpGained?: number;
  badgeIcon?: any;

  // Type 3: Memory Post details
  memoryTitle?: string;
  memoryText?: string;
  singleImage?: string;

  // Type 4: Campfire Highlight details
  campfireTopic?: string;
  campfireDuration?: string;
  campfireTakeaways?: string[];
  participantsCount?: number;
  participantsAvatars?: string[];

  // Type 5: Community Update details
  communityName?: string;
  communityBanner?: string;
  newEventTitle?: string;
  discussionHighlight?: string;
  membersJoined?: number;

  // Type 6: Achievement Unlock details
  achievementTitle?: string;
  badgeName?: string;
  badgeColor?: string;
  levelReached?: number;

  // Type 7: AI Generated Recap details
  recapDistance?: number;
  recapQuestsCount?: number;
  recapCampfiresCount?: number;
  recapBadgesCount?: number;

  // Common Interactions
  likes: number;
  commentsCount: number;
  comments: Comment[];
  hasLiked?: boolean;
  hasSaved?: boolean;
  voiceNote?: {
    name: string;
    duration: number;
  };
}

// Initial Feed Posts Data (Page 1)
const initialFeedPosts: FeedPost[] = [
  {
    id: "post-1",
    type: "experience",
    user: {
      name: "Arjun Mehta",
      username: "@arjun_explores",
      avatar: "A",
      level: 18,
      verified: true
    },
    timestamp: "2 hours ago",
    visibility: "Public",
    experienceName: "Gokarna Cliff Trek & Beach Camping",
    location: "Gokarna, Karnataka",
    duration: "2 Days",
    cost: "₹3,200",
    rating: 4.9,
    storyText: "Hiked from Kudle to Paradise Beach along the rugged coastline. Slept under the stars with the sound of the ocean. The gradient of the sea during sunrise was pure gold. Truly one of the best off-grid escapes in South India. The hike itself is a sequence of rocky climbs, sandy strolls, and stunning views of the Arabian Sea that keep you captivated at every single step. It is highly recommended to start early in the morning to beat the heat, carry enough fresh water as there are no shops along the trails, and wear sturdy trekking shoes because the wet rocks can be extremely slippery. When you finally reach Paradise Beach, the sheer beauty of the secluded shoreline makes every bit of physical exertion worth it. I spent hours sitting by the waves, watching tiny crabs scurry across the sand, and simply marveling at how untouched and serene the entire coast felt. It was a soulful retreat.",
    images: [
      "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 84,
    commentsCount: 12,
    comments: [
      { id: "c1", user: "Rishiraj", avatar: "R", text: "Stunning shots! Did you camp on Paradise beach directly?", time: "1h ago", likes: 3, likedByMe: false },
      { id: "c2", user: "Neha Sharma", avatar: "N", text: "Added this to my wishlist immediately.", time: "45m ago", likes: 1, likedByMe: false }
    ],
    hasLiked: false,
    hasSaved: true
  },
  {
    id: "post-2",
    type: "quest",
    user: {
      name: "Wandercall Quests",
      username: "@quests_bot",
      avatar: "Q",
      level: 99,
      verified: true
    },
    timestamp: "4 hours ago",
    visibility: "Public",
    questName: "Western Ghats Monsoon Explorer",
    reward: "Western Ghats Badge + 200 Sparks",
    xpGained: 400,
    likes: 128,
    commentsCount: 9,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-3",
    type: "experience",
    user: {
      name: "Rishiraj",
      username: "@rishi005",
      avatar: "R",
      level: 12,
      verified: true
    },
    timestamp: "5 hours ago",
    visibility: "Public",
    experienceName: "Kudremukh Peak Monsoon Ascent",
    location: "Chikmagalur, Karnataka",
    duration: "2 Days / 15 slots left",
    cost: "₹2,500",
    rating: 4.8,
    storyText: "Climb the horse-faced peak amidst thick fog, rushing streams, and endless green valleys. Fully guided trek with forest permits, home-stay meals, and transportation included. Perfect weekend escape for adventure seekers. The trail winds through dense Shola forests and rolling grasslands that look incredibly vibrant under the monsoon rains. The ascent can be quite steep in certain patches, especially as you approach the ridge, but the panoramic views of the surrounding Kudremukh National Park are absolutely breathtaking and offer a sense of unmatched peace. Be prepared for occasional rain showers and encounters with local wildlife, including exotic birds and deer. It is a true immersion into the untouched biodiversity of the Western Ghats, leaving every hiker with a deep appreciation for conservation and the raw beauty of nature.",
    images: [
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 142,
    commentsCount: 5,
    comments: [
      { id: "c3", user: "Arjun Mehta", avatar: "A", text: "Kudremukh is magical in the rains. Count me in!", time: "4h ago", likes: 4, likedByMe: false }
    ],
    hasLiked: true,
    hasSaved: true
  },
  {
    id: "post-4",
    type: "community",
    user: {
      name: "Wandercall Community",
      username: "@community_hub",
      avatar: "C",
      level: 80,
      verified: true
    },
    timestamp: "1 day ago",
    visibility: "Public",
    communityName: "Himalayan Trekkers Club",
    communityBanner: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    newEventTitle: "Hampta Pass Monsoon Prep Meetup",
    discussionHighlight: "Altitude sickness prevention guidelines & heavy rain gear comparisons",
    membersJoined: 24,
    likes: 110,
    commentsCount: 8,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-5",
    type: "memory",
    user: {
      name: "Sarah Jenkins",
      username: "@sarah_wander",
      avatar: "S",
      level: 14,
      verified: false
    },
    timestamp: "1 day ago",
    visibility: "Public",
    memoryTitle: "Golden Hour at Kudle Beach",
    memoryText: "No agenda, no laptop, just watching the waves dissolve into the sand. This is my absolute happy place. Golden hour in Gokarna has a different vibe altogether.",
    singleImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    likes: 47,
    commentsCount: 4,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-6",
    type: "experience",
    user: {
      name: "Neha Sharma",
      username: "@neha_travels",
      avatar: "N",
      level: 15,
      verified: false
    },
    timestamp: "1 day ago",
    visibility: "Public",
    experienceName: "Valley of Flowers Botanical Hike",
    location: "Chamoli, Uttarakhand",
    duration: "6 Days",
    cost: "₹9,500",
    storyText: "Walked through thousands of alpine flowers in full bloom. The scent of blue poppies and anemones in the damp mountain air is something I will never forget. Challenging climb but absolutely rewarding.",
    images: [
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 93,
    commentsCount: 3,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-7",
    type: "experience",
    user: {
      name: "Rishiraj",
      username: "@rishi005",
      avatar: "R",
      level: 12,
      verified: true
    },
    timestamp: "2 days ago",
    visibility: "Public",
    experienceName: "Bir Billing Paragliding & Glamping",
    location: "Bir Billing, Himachal",
    duration: "3 Days / Limited Slots",
    cost: "₹8,500",
    rating: 4.9,
    storyText: "Fly high over the tea gardens of Bir Billing, the second-highest paragliding site in the world. Package includes a 25-minute tandem flight, overnight dome glamping under the stars, guided hiking, and local organic meals.",
    images: [
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 210,
    commentsCount: 14,
    comments: [
      { id: "c7", user: "Sarah Jenkins", avatar: "S", text: "Are flights included or do we reach there ourselves?", time: "1d ago" }
    ],
    hasLiked: false,
    hasSaved: true
  },
  {
    id: "post-8",
    type: "quest",
    user: {
      name: "Wandercall Quests",
      username: "@quests_bot",
      avatar: "Q",
      level: 99,
      verified: true
    },
    timestamp: "2 days ago",
    visibility: "Public",
    questName: "High Altitude Himalayan Pioneer",
    reward: "Himalayan Explorer Badge + 500 Sparks",
    xpGained: 1000,
    likes: 185,
    commentsCount: 12,
    comments: [],
    hasLiked: false,
    hasSaved: false
  }
];

const page2Posts: FeedPost[] = [
  {
    id: "post-9",
    type: "experience",
    user: {
      name: "Rohan Malhotra",
      username: "@rohan_adventures",
      avatar: "RM",
      level: 21,
      verified: true
    },
    timestamp: "3 days ago",
    visibility: "Public",
    experienceName: "Meghalaya Caving & Waterfall Treks",
    location: "Cherrapunji, Meghalaya",
    duration: "4 Days",
    cost: "₹6,800",
    storyText: "Explored the dark limestone cave systems of Krem Mawmluh. Waded through chest-deep water inside the caves with headlamps. Afterwards, hiked the Double Decker Living Root Bridge. Pure raw nature at its finest.",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 114,
    commentsCount: 7,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-10",
    type: "community",
    user: {
      name: "Wandercall Community",
      username: "@community_hub",
      avatar: "C",
      level: 80,
      verified: true
    },
    timestamp: "3 days ago",
    visibility: "Public",
    communityName: "Scuba & Marine Life Club",
    communityBanner: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
    newEventTitle: "Netrani Island Deep Sea Dive Meet",
    discussionHighlight: "PADI open water registration details & transport loop sharing from Bangalore",
    membersJoined: 32,
    likes: 145,
    commentsCount: 4,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-11",
    type: "memory",
    user: {
      name: "Kabir Dev",
      username: "@kabir_travels",
      avatar: "K",
      level: 24,
      verified: true
    },
    timestamp: "4 days ago",
    visibility: "Public",
    memoryTitle: "Stargazing at Spiti Valley",
    memoryText: "At 14,000 feet, the Milky Way isn't just a faint band; it is a brilliant cosmic river. Freezing wind, warm black tea, and a sky that makes you feel beautifully tiny. I spent the entire night sitting outside our tent in Kaza, wrapped in three heavy layers of wool, watching shooting stars streak across the dark void. The quietness of the Spiti valley at night is deafening, yet incredibly peaceful. There is no internet, no noise pollution, and no city distractions—just you, the mountains, and the infinite universe overhead. Every explorer must experience this stillness at least once in their lives.",
    singleImage: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=800&auto=format&fit=crop",
    likes: 156,
    commentsCount: 18,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-12",
    type: "experience",
    user: {
      name: "Rishiraj",
      username: "@rishi005",
      avatar: "R",
      level: 12,
      verified: true
    },
    timestamp: "4 days ago",
    visibility: "Public",
    experienceName: "Varkala Cliff Surfing & Yoga Retreat",
    location: "Varkala, Kerala",
    duration: "2 Days / 10 slots left",
    cost: "₹4,200",
    rating: 4.7,
    storyText: "Learn to catch your first wave with certified ISA instructors on Black Beach. Combine high-energy surf sessions with sunset cliff yoga, seaside breakfast bowls, and hostel community vibes.",
    images: [
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 198,
    commentsCount: 9,
    comments: [],
    hasLiked: false,
    hasSaved: true
  },
  {
    id: "post-13",
    type: "experience",
    user: {
      name: "Priya Patel",
      username: "@priya_explores",
      avatar: "P",
      level: 16,
      verified: false
    },
    timestamp: "5 days ago",
    visibility: "Public",
    experienceName: "Coorg Coffee Plantation Trail",
    location: "Madikeri, Coorg",
    duration: "1 Day",
    cost: "₹1,200",
    storyText: "Walked through organic Arabica plantations. Learned the journey from berry to cup and tasted some of the freshest estate-brewed coffee. Highly recommended for a quiet day out. Our guide explained the intricate shade-growing techniques that give Coorg coffee its distinctive mild flavor and rich aroma. We walked under giant rosewood and jackfruit trees that support the pepper vines growing alongside the coffee shrubs. The walk ended with a wonderful session of roasting and grinding the beans by hand, followed by a tasting of three different single-origin brews. The freshness was absolutely unbelievable, so vastly superior to anything you can buy in supermarkets.",
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 67,
    commentsCount: 1,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-14",
    type: "quest",
    user: {
      name: "Wandercall Quests",
      username: "@quests_bot",
      avatar: "Q",
      level: 99,
      verified: true
    },
    timestamp: "5 days ago",
    visibility: "Public",
    questName: "Monsoon Western Ghats Explorer Quest",
    reward: "Sparks + Western Ghats passport stamp",
    xpGained: 500,
    likes: 92,
    commentsCount: 3,
    comments: [],
    hasLiked: false,
    hasSaved: false
  },
  {
    id: "post-15",
    type: "experience",
    user: {
      name: "Rishiraj",
      username: "@rishi005",
      avatar: "R",
      level: 12,
      verified: true
    },
    timestamp: "6 days ago",
    visibility: "Public",
    experienceName: "Zanskar Frozen River Chadar Trek",
    location: "Leh, Ladakh",
    duration: "8 Days / 5 slots left",
    cost: "₹24,000",
    rating: 5.0,
    storyText: "Trek over the frozen Zanskar river in -25 degrees. Witness frozen waterfalls, sleep in cave campsites, and walk on ice sheets. This is the ultimate bucket-list wilderness expedition in India.",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"
    ],
    likes: 312,
    commentsCount: 22,
    comments: [],
    hasLiked: false,
    hasSaved: true
  },
  {
    id: "post-16",
    type: "memory",
    user: {
      name: "Amit Sen",
      username: "@amit_wanderer",
      avatar: "AS",
      level: 11,
      verified: false
    },
    timestamp: "6 days ago",
    visibility: "Public",
    memoryTitle: "Dharamkot Rain & Chai",
    memoryText: "Sitting in a tiny café in Dharamkot while the monsoon rain drums heavily on the tin roof. The hot ginger lemon honey tea smells like heaven. Sometimes, doing nothing is the best adventure.",
    singleImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    likes: 54,
    commentsCount: 2,
    comments: [],
    hasLiked: false,
    hasSaved: false
  }
];

// Universal category definitions for posting
const categories = [
  {
    id: "story" as const,
    label: "Adventure Story",
    description: "Detailed journals, trail logs, and epic tales",
    icon: Compass,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    hoverColor: "hover:bg-indigo-500/5",
    placeholder: "What adventure did you book or explore today? Describe the trails, details, and vibes..."
  },
  {
    id: "memory" as const,
    label: "Travel Memory",
    description: "Quick highlights, snapshots, or mini thoughts",
    icon: Camera,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    hoverColor: "hover:bg-purple-500/5",
    placeholder: "Capture a beautiful travel memory. What made this moment unforgettable?"
  },
  {
    id: "itinerary" as const,
    label: "Route & Itinerary",
    description: "Step-by-step guides, stops, and schedules",
    icon: Map,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    hoverColor: "hover:bg-cyan-500/5",
    placeholder: "Share the details of your itinerary. Days, key stops, transport, and coordinates..."
  },
  {
    id: "review" as const,
    label: "Gear Review",
    description: "Honest ratings of your outdoor & travel equipment",
    icon: Package,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hoverColor: "hover:bg-amber-500/5",
    placeholder: "What gear did you test? Share pros, cons, and performance in the field..."
  },
  {
    id: "tips" as const,
    label: "Tips & Hacks",
    description: "Essential advice for fellow explorers",
    icon: Lightbulb,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    hoverColor: "hover:bg-emerald-500/5",
    placeholder: "Got some tips for budget travel, packing light, or trail safety? Share them here..."
  },
  {
    id: "food" as const,
    label: "Food Guide",
    description: "Local culinary finds, street eats, and cafes",
    icon: Utensils,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    hoverColor: "hover:bg-rose-500/5",
    placeholder: "Where and what did you eat? Describe the flavors, local dishes, and must-try recommendations..."
  },
  {
    id: "stay" as const,
    label: "Stay & Stays",
    description: "Hostels, campsites, and homestay reviews",
    icon: Home,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
    hoverColor: "hover:bg-orange-500/5",
    placeholder: "Where did you stay? Share details on the ambiance, hospitality, and overall experience..."
  },
  {
    id: "budget" as const,
    label: "Budget & Costs",
    description: "Expense splits, savings, and value-for-money tips",
    icon: DollarSign,
    color: "text-green-400 bg-green-500/10 border-green-500/20",
    hoverColor: "hover:bg-green-500/5",
    placeholder: "Break down your costs. Accommodation, food, transport, and tips for staying within budget..."
  },
  {
    id: "meetup" as const,
    label: "Events & Meetups",
    description: "Local gatherings, hikes, and group events",
    icon: Calendar,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    hoverColor: "hover:bg-blue-500/5",
    placeholder: "Are you organizing or attending a meetup? Share coordinates, times, activities, and how to join..."
  }
];

// Helper Component for word-based text truncation
const DescriptionText = ({ text, isItalic = false, borderClass = "" }: { text: string; isItalic?: boolean; borderClass?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;

  const words = text.split(/\s+/).filter(Boolean);
  const isLong = words.length > 40;

  const displayText = isLong && !isExpanded 
    ? words.slice(0, 40).join(" ")
    : text;

  return (
    <p className={`text-xs text-zinc-300 leading-relaxed font-medium mt-1 ${isItalic ? "italic" : ""} ${borderClass}`}>
      {isItalic ? `"${displayText}"` : displayText}
      {isLong && (
        <>
          {!isExpanded && "..."}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="ml-1.5 text-brand-cyan hover:underline font-bold focus:outline-none cursor-pointer inline-block"
          >
            {isExpanded ? "show less" : "...more"}
          </button>
        </>
      )}
    </p>
  );
};

export default function ExplorerFeedPage() {
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Sync Redux auth state
  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
  }, [isAuthenticated]);

  const executeAuthAction = (actionName: string, actionCallback: () => void) => {
    if (!isLoggedIn) {
      setPendingAction(actionName);
      setShowLoginModal(true);
    } else {
      actionCallback();
    }
  };

  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(initialFeedPosts);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Trending");

  // Load custom posts from localStorage on mount
  useEffect(() => {
    const localPostsStr = localStorage.getItem("custom_feed_posts");
    if (localPostsStr) {
      try {
        const localPosts = JSON.parse(localPostsStr) as FeedPost[];
        if (localPosts.length > 0) {
          setFeedPosts(prev => {
            const filteredLocal = localPosts.filter(lp => !prev.some(p => p.id === lp.id));
            return [...filteredLocal, ...prev];
          });
        }
      } catch (e) {
        console.error("Failed to parse custom local feed posts:", e);
      }
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  // Image Viewer Modal States
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Modal images auto-rotation every 5 seconds
  useEffect(() => {
    if (!isModalOpen || modalImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % modalImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isModalOpen, modalImages]);

  // Handle escape and arrow keys for image modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "ArrowRight" && modalImages.length > 1) {
        setActiveImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1));
      } else if (e.key === "ArrowLeft" && modalImages.length > 1) {
        setActiveImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, modalImages]);



  // Comments toggles
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState<FeedPost | null>(null);

  // Confetti / Celebration states
  const [celebrationOverlay, setCelebrationOverlay] = useState(false);
  const [celebratedTitle, setCelebratedTitle] = useState("");

  // Reference for intersection observer scroll detector
  const loaderRef = useRef<HTMLDivElement>(null);

  // Filters Options
  const filters = ["All", "Following", "Communities", "Experiences", "Memories", "Trending", "Nearby", "Saved", "Host", "Quests"];

  // Sort Options
  const sortOptions = ["Trending", "Latest", "Popular", "Recommended", "AI Curated", "Friends"];

  // Filtered and Sorted Posts
  const processedPosts = useMemo(() => {
    let result = [...feedPosts];

    // Filter out campfire, achievement, and recap posts from this feed
    result = result.filter(p => 
      p.type !== "campfire" && 
      p.type !== "achievement" && 
      p.type !== "recap" &&
      // Quests are only allowed if posted by the admin
      (p.type !== "quest" || p.user.name === "Wandercall Quests" || p.user.username === "@quests_bot")
    );

    // Filter
    if (activeFilter !== "All") {
      if (activeFilter === "Communities") {
        result = result.filter(p => p.type === "community");
      } else if (activeFilter === "Experiences") {
        result = result.filter(p => p.type === "experience");
      } else if (activeFilter === "Memories") {
        result = result.filter(p => p.type === "memory" || p.type === "experience");
      } else if (activeFilter === "Quests") {
        result = result.filter(p => p.type === "quest");
      } else if (activeFilter === "Trending") {
        result = result.sort((a, b) => b.likes - a.likes);
      } else if (activeFilter === "Saved") {
        result = result.filter(p => p.hasSaved);
      } else if (activeFilter === "Host") {
        result = result.filter(p => p.user.name === "Rishiraj");
      }
    }

    // Sort
    if (activeSort === "Latest") {
      // In a real app we'd sort by date, for mock data we keep current list order reversed
    } else if (activeSort === "Popular") {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [feedPosts, activeFilter, activeSort]);




  // Toast notifier
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle Like
  const handleLike = (postId: string) => {
    executeAuthAction("like posts", () => {
      setFeedPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const hasLiked = !post.hasLiked;
          return {
            ...post,
            hasLiked,
            likes: hasLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      }));
    });
  };

  // Toggle Save
  const handleSave = (postId: string) => {
    executeAuthAction("bookmark posts", () => {
      setFeedPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const hasSaved = !post.hasSaved;
          if (hasSaved) {
            triggerToast("Added to experience wishlist!");
          }
          return { ...post, hasSaved };
        }
        return post;
      }));
    });
  };

  // Trigger celebration particle overlay
  const handleCelebrate = (title: string) => {
    setCelebratedTitle(title);
    setCelebrationOverlay(true);
    setTimeout(() => {
      setCelebrationOverlay(false);
    }, 4000);
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;

    executeAuthAction("write comments", () => {
      setFeedPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const newComment = {
            id: `comment-${Date.now()}`,
            user: "Rishiraj",
            avatar: "R",
            text: commentInput,
            time: "Just now",
            likes: 0,
            likedByMe: false
          };
          const updated = {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...post.comments]
          };
          if (activeCommentPost?.id === post.id) {
            setActiveCommentPost(updated);
          }
          return updated;
        }
        return post;
      }));

      setCommentInput("");
    });
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    executeAuthAction("like comments", () => {
      setFeedPosts(prev => {
        return prev.map(p => {
          if (p.id === postId) {
            const updatedComments = (p.comments || []).map(c => {
              if (c.id === commentId) {
                const alreadyLiked = c.likedByMe;
                return {
                  ...c,
                  likedByMe: !alreadyLiked,
                  likes: alreadyLiked ? Math.max(0, (c.likes || 0) - 1) : (c.likes || 0) + 1
                };
              }
              return c;
            });
            const updated = {
              ...p,
              comments: updatedComments
            };
            if (activeCommentPost?.id === p.id) {
              setActiveCommentPost(updated);
            }
            return updated;
          }
          return p;
        });
      });
    });
  };

  // Infinite Scroll Simulated Loading
  useEffect(() => {
    if (page >= 2 || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        setIsLoading(true);
        setTimeout(() => {
          setFeedPosts(prev => [...prev, ...page2Posts]);
          setPage(2);
          setIsLoading(false);
          setHasMore(false); // only 2 pages for mock
        }, 1500);
      }
    }, { threshold: 0.1 });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, isLoading, hasMore]);

  // Estimate height of a post to distribute evenly across columns
  const estimatePostHeight = (post: FeedPost) => {
    let height = 140; // base header/footer padding and margins
    
    // Description height
    const description = post.storyText || post.memoryText || post.discussionHighlight || "";
    if (description) {
      const textLen = description.length;
      height += Math.min(80, textLen * 0.25); 
    }

    // Image height
    if (post.type === "experience") {
      if (post.images && post.images.length > 0) {
        height += 230; // image grid height + gap
      }
      // Try This Experience CTA button (only for Rishiraj host)
      if (post.user.name === "Rishiraj") {
        height += 48;
      }
    } else if (post.type === "memory" || post.type === "recap") {
      if (post.singleImage) {
        height += 234;
      }
    } else if (post.type === "community") {
      if (post.communityBanner) {
        height += 186;
      }
      height += 100; // meetup details + join button
    } else if (post.type === "quest") {
      height += 150; // badge info + celebrate button
    }

    // Comments block if expanded
    if (expandedCommentsId === post.id) {
      const commentsCount = post.comments?.length || 0;
      height += 60 + (commentsCount * 58); // input field + list items
    }

    return height;
  };

  // Dynamically distribute posts to the shortest column
  const col1Posts: FeedPost[] = [];
  const col2Posts: FeedPost[] = [];
  const col3Posts: FeedPost[] = [];

  let col1Height = 0;
  let col2Height = 0;
  let col3Height = 0;

  processedPosts.forEach((post) => {
    const postHeight = estimatePostHeight(post);
    if (col1Height <= col2Height && col1Height <= col3Height) {
      col1Posts.push(post);
      col1Height += postHeight;
    } else if (col2Height <= col1Height && col2Height <= col3Height) {
      col2Posts.push(post);
      col2Height += postHeight;
    } else {
      col3Posts.push(post);
      col3Height += postHeight;
    }
  });

  const renderPostCard = (post: FeedPost) => {
    const UserIcon = post.user.avatar;
    const isRishiraj = post.user.name === "Rishiraj";
    const isHostOrAdmin = post.user.name === "Rishiraj" || post.user.name === "Wandercall Quests" || post.user.name === "Wandercall Community";

    // Define type-specific classes for cards to apply custom glow hover styles
    const typeClasses = {
      experience: "shine-card-cyan",
      quest: "shine-card-purple",
      memory: "shine-card-purple",
      campfire: "shine-card-purple",
      community: "shine-card-emerald",
      achievement: "shine-card-indigo",
      recap: "shine-card-indigo"
    }[post.type] || "";

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={`glass-panel border p-4 md:p-6 rounded-3xl flex flex-col gap-4 text-left shadow-lg transition-all duration-300 relative overflow-hidden group w-full shine-card ${typeClasses} ${
          isRishiraj 
            ? "border-amber-500/35 shadow-amber-500/[0.01] bg-gradient-to-tr from-amber-500/[0.02] via-transparent to-rose-500/[0.01] hover:border-amber-500/50 hover:shadow-amber-500/5" 
            : "border-white/12 hover:border-white/20"
        }`}
      >

        {/* CARD HEADER */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {/* Avatar Circle */}
            <div className={`h-9 w-9 rounded-full p-0.5 shrink-0 ${
              isRishiraj 
                ? "bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
                : "bg-gradient-to-tr from-brand-indigo to-brand-purple"
            }`}>
              <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white">
                {UserIcon}
              </div>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-white">{post.user.name}</span>
                {isRishiraj ? (
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none shrink-0 shadow-sm shadow-amber-500/5">
                    <Sparkles className="h-2.5 w-2.5 text-amber-400 animate-pulse" /> Host
                  </span>
                ) : post.user.verified ? (
                  <span className="h-3.5 w-3.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                ) : null}
                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-md">Lv.{post.user.level}</span>
              </div>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{post.visibility}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider whitespace-nowrap bg-white/[0.03] border border-white/5 px-2 py-1 rounded-lg">
              {post.timestamp}
            </span>
            <button className="p-1 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer">
              <Volume2 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* CARD BODY (ADAPTIVE TYPE RENDER) */}
        <div className="w-full">

          {/* TYPE 1: EXPERIENCE STORY */}
          {post.type === "experience" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const catMeta = categories.find(c => c.id === post.category);
                  const label = catMeta?.label || "Experience Story";
                  const colorClass = catMeta?.color.split(' ')[0] || "text-brand-cyan";
                  const bgClass = catMeta?.color.split(' ')[1] || "bg-brand-cyan/10";
                  const borderClass = catMeta?.color.split(' ')[2] || "border-brand-cyan/20";
                  return (
                    <span className={`text-[10px] font-bold ${colorClass} ${bgClass} border ${borderClass} px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {label}
                    </span>
                  );
                })()}
                <h2 className="text-base font-black text-white">{post.experienceName}</h2>
              </div>

              {/* Image Carousel/Gallery Grid */}
              {post.images && post.images.length > 0 && (
                <FeedImageGallery 
                  images={post.images} 
                  onImageClick={(idx) => {
                    setModalImages(post.images ?? []);
                    setActiveImageIndex(idx);
                    setIsModalOpen(true);
                  }}
                />
              )}

              {/* Travel details meta */}
              <div className="grid grid-cols-2 gap-2 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 text-[10px] font-semibold text-zinc-400">
                <span className="flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 text-brand-cyan shrink-0" /> {post.location}</span>
                <span className="flex items-center gap-1.5 truncate justify-end text-right w-full ml-auto"><Clock className="h-3.5 w-3.5 text-brand-purple shrink-0" /> {post.duration}</span>
              </div>

              <DescriptionText text={post.storyText || ""} />

              {/* Voice Note Player if present */}
              {post.voiceNote && (
                <div className="mt-3 flex items-center gap-3 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl">
                  <button
                    onClick={() => triggerToast(`Playing voice note: ${post.voiceNote?.name}`)}
                    className="h-8 w-8 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-300 truncate block">{post.voiceNote.name}</span>
                    {/* Waveform graphic */}
                    <div className="flex gap-0.5 items-center h-4 mt-1">
                      {[...Array(24)].map((_, idx) => {
                        const h = [6, 12, 10, 4, 16, 14, 8, 6, 12, 10, 14, 8, 4, 12, 16, 10, 6, 14, 8, 12, 6, 4, 10, 8][idx];
                        return (
                          <div
                            key={idx}
                            style={{ height: `${h}px` }}
                            className="w-1 rounded-full bg-brand-cyan/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold shrink-0">0:{post.voiceNote.duration < 10 ? `0${post.voiceNote.duration}` : post.voiceNote.duration}</span>
                </div>
              )}

              {/* Book CTA */}
              {isRishiraj && (
                <button
                  onClick={() => triggerToast("Booking experience module...")}
                  className="mt-2 w-full h-10 rounded-xl bg-gradient-to-r from-brand-indigo/10 to-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Zap className="h-4 w-4" /> Try This Experience {post.cost && `(${post.cost})`}
                </button>
              )}
            </div>
          )}

          {/* TYPE 2: QUEST COMPLETION */}
          {post.type === "quest" && (
            <div className="flex flex-col gap-3 bg-gradient-to-tr from-brand-indigo/5 via-transparent to-transparent p-4 rounded-2xl border border-brand-indigo/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber shrink-0 animate-bounce">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-brand-amber bg-brand-amber/10 border border-brand-amber/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Quest Completed
                  </span>
                  <h2 className="text-base font-black text-white mt-1">{post.questName}</h2>
                </div>
              </div>

              <div className="mt-1 flex flex-wrap gap-2 text-xs font-mono font-bold text-brand-cyan">
                <span className="bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-1 rounded-xl">Reward: {post.reward}</span>
                <span className="bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-1 rounded-xl text-brand-purple">XP: +{post.xpGained}</span>
              </div>

              <button
                onClick={() => handleCelebrate(post.questName || "Quest Complete")}
                className="mt-2 w-full h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="h-4 w-4 text-brand-amber" /> Celebrate Achievement
              </button>
            </div>
          )}

          {/* TYPE 3: MEMORY POST */}
          {post.type === "memory" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const catMeta = categories.find(c => c.id === post.category);
                  const label = catMeta?.label || "Memory Journal";
                  const colorClass = catMeta?.color.split(' ')[0] || "text-brand-purple";
                  const bgClass = catMeta?.color.split(' ')[1] || "bg-brand-purple/10";
                  const borderClass = catMeta?.color.split(' ')[2] || "border-brand-purple/20";
                  return (
                    <span className={`text-[10px] font-bold ${colorClass} ${bgClass} border ${borderClass} px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {label}
                    </span>
                  );
                })()}
                <h2 className="text-base font-black text-white">{post.memoryTitle}</h2>
              </div>

              {/* Image Carousel/Gallery Grid */}
              {(() => {
                const galleryImages = post.images && post.images.length > 0 
                  ? post.images 
                  : (post.singleImage ? [post.singleImage] : []);
                return galleryImages.length > 0 && (
                  <FeedImageGallery 
                    images={galleryImages} 
                    onImageClick={(idx) => {
                      setModalImages(galleryImages);
                      setActiveImageIndex(idx);
                      setIsModalOpen(true);
                    }}
                  />
                );
              })()}

              <DescriptionText text={post.memoryText || ""} isItalic={true} borderClass="pl-3 border-l border-brand-purple/30" />

              {/* Voice Note Player if present */}
              {post.voiceNote && (
                <div className="mt-3 flex items-center gap-3 bg-zinc-950/40 border border-white/5 p-3 rounded-2xl">
                  <button
                    onClick={() => triggerToast(`Playing voice note: ${post.voiceNote?.name}`)}
                    className="h-8 w-8 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-zinc-300 truncate block">{post.voiceNote.name}</span>
                    {/* Waveform graphic */}
                    <div className="flex gap-0.5 items-center h-4 mt-1">
                      {[...Array(24)].map((_, idx) => {
                        const h = [6, 12, 10, 4, 16, 14, 8, 6, 12, 10, 14, 8, 4, 12, 16, 10, 6, 14, 8, 12, 6, 4, 10, 8][idx];
                        return (
                          <div
                            key={idx}
                            style={{ height: `${h}px` }}
                            className="w-1 rounded-full bg-brand-cyan/30"
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 font-bold shrink-0">0:{post.voiceNote.duration < 10 ? `0${post.voiceNote.duration}` : post.voiceNote.duration}</span>
                </div>
              )}
            </div>
          )}

          {/* TYPE 4: CAMPFIRE HIGHLIGHT */}
          {post.type === "campfire" && (
            <div className="flex flex-col gap-3 bg-zinc-950/30 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Campfire Highlight
                  </span>
                  <h2 className="text-sm font-black text-white mt-1.5">{post.campfireTopic}</h2>
                </div>

                {/* Live participant overlap avatars */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  {post.participantsAvatars?.map((av, idx) => (
                    <div key={idx} className="h-6 w-6 rounded-full border border-zinc-950 bg-zinc-900 flex items-center justify-center font-black text-[9px] text-white">
                      {av}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Key takeaways */}
              <div className="mt-2 flex flex-col gap-1.5 border-t border-white/5 pt-3">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-purple">AI Voice Summary</span>
                {post.campfireTakeaways?.map((takeaway, idx) => (
                  <p key={idx} className="text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0 mt-1.5" />
                    {takeaway}
                  </p>
                ))}
              </div>

              <button
                onClick={() => triggerToast("Connecting to live campfire room...")}
                className="mt-2 w-full h-9 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-bold text-xs uppercase tracking-wider hover:bg-brand-purple/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="h-4 w-4 animate-pulse" /> Join Similar Room ({post.campfireDuration})
              </button>
            </div>
          )}

          {/* TYPE 5: COMMUNITY UPDATE */}
          {post.type === "community" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Community Update
                </span>
                <h2 className="text-base font-black text-white">{post.communityName}</h2>
              </div>

              {post.communityBanner && (
                <div 
                  onClick={() => {
                     setModalImages([post.communityBanner!]);
                    setActiveImageIndex(0);
                    setIsModalOpen(true);
                  }}
                  className="w-full h-44 rounded-2xl overflow-hidden border border-white/5 relative shadow-inner cursor-pointer"
                >
                  <img src={post.communityBanner} alt="Community Banner" className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-xs flex flex-col gap-2">
                <p className="text-zinc-300 font-bold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-emerald shrink-0" />
                  Meetup: {post.newEventTitle}
                </p>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed pl-4">
                  Discussion: {post.discussionHighlight}
                </p>
              </div>

              <button
                onClick={() => triggerToast("Joined Trekking Community!")}
                className="mt-1 w-full h-9 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald font-bold text-xs uppercase tracking-wider hover:bg-brand-emerald/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="h-4 w-4" /> Join Community (+{post.membersJoined} members)
              </button>
            </div>
          )}

          {/* TYPE 6: ACHIEVEMENT UNLOCK */}
          {post.type === "achievement" && (
            <div className="flex flex-col gap-4 bg-gradient-to-tr from-brand-purple/5 via-transparent to-transparent p-5 rounded-2xl border border-brand-purple/10 items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shadow-2xl animate-pulse">
                <div className="h-full w-full rounded-2xl bg-zinc-900 flex items-center justify-center text-brand-cyan border border-white/10">
                  <Award className="h-8 w-8 text-brand-cyan" />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Achievement Unlocked
                </span>
                <h2 className="text-lg font-black text-white mt-2">{post.achievementTitle}</h2>
                <p className="text-xs text-zinc-500 font-semibold mt-1">Level {post.levelReached} passport credentials reached globally.</p>
              </div>

              <button
                onClick={() => handleCelebrate(post.achievementTitle || "Level Up")}
                className="w-full h-9 rounded-xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Flame className="h-4 w-4 text-brand-purple" /> Celebrate Level Up
              </button>
            </div>
          )}

          {/* TYPE 7: AI GENERATED RECAP */}
          {post.type === "recap" && (
            <div className="flex flex-col gap-3 bg-gradient-to-br from-brand-indigo/5 to-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10">
              <div className="flex items-center gap-2 text-brand-purple">
                <span className="text-xs font-black uppercase tracking-wider">Weekly AI Explorer Recap</span>
              </div>

              <p className="text-xs text-zinc-400 font-medium">
                Here is your verified network activity for the week of June 16 - June 22:
              </p>

              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-white">{post.recapDistance} km</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Distance Covered</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-cyan">+{post.recapQuestsCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Quests Completed</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-purple">+{post.recapCampfiresCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Campfires Attended</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                  <span className="text-lg font-black font-mono text-brand-amber">+{post.recapBadgesCount}</span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">Medals Earned</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* CARD FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-zinc-500 font-bold uppercase tracking-wider w-full">
          <button
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${post.hasLiked ? "text-brand-cyan" : "hover:text-zinc-300"
              }`}
            aria-label="Like post"
          >
            <Heart className={`h-4.5 w-4.5 ${post.hasLiked ? "fill-brand-cyan text-brand-cyan" : ""}`} />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setActiveCommentPost(post)}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Toggle comments"
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>{post.commentsCount}</span>
          </button>

          <button
            onClick={() => handleSave(post.id)}
            className={`flex items-center gap-2 cursor-pointer transition-colors ${post.hasSaved ? "text-brand-purple" : "hover:text-zinc-300"
              }`}
            aria-label="Save post"
          >
            <Bookmark className={`h-4.5 w-4.5 ${post.hasSaved ? "fill-brand-purple text-brand-purple" : ""}`} />
            <span>Save</span>
          </button>

          <button
            onClick={() => triggerToast("Link copied to clipboard!")}
            className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors"
            aria-label="Share post"
          >
            <Share2 className="h-4.5 w-4.5" />
            <span>Share</span>
          </button>
        </div>

        {/* EXPANDED COMMENTS SECTION */}
        {expandedCommentsId === post.id && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-3 w-full">
            <div className="flex flex-col gap-2">
              {post.comments.map(c => (
                <div key={c.id} className="flex gap-2.5 items-start text-xs bg-white/[0.01] p-2.5 rounded-xl border border-white/5">
                  <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center font-black text-[9px] text-white shrink-0">
                    {c.avatar}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-zinc-300">{c.user} <span className="text-[8px] font-mono text-zinc-600 font-bold ml-1">{c.time}</span></span>
                    <p className="text-zinc-400 font-medium mt-0.5">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs outline-none text-zinc-300 focus:border-white/10"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="h-8 w-8 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center pt-28 pb-16">
        <div className="w-full max-w-[1440px] px-3 md:px-12 py-4 md:py-8 relative flex flex-col gap-6 overflow-y-visible">

          {/* HEADER PANEL */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col gap-4 text-left shadow-lg w-full max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-brand-cyan animate-pulse" />
            Explorer Feed
          </h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Discover adventures, stories, achievements, and real-life experiences in your explorer community.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 w-full">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Sort by</span>
            <div className="relative">
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-zinc-900 border border-white/5 rounded-lg px-2.5 py-1 text-xs text-zinc-300 font-bold outline-none cursor-pointer hover:border-white/10 transition-colors"
              >
                {sortOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              executeAuthAction("create posts", () => {
                router.push("/feed/create-post");
              });
            }}
            className="h-8 px-3 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-[10px] font-bold uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-brand-indigo/10 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Create Post
          </button>
        </div>

        {/* Filters List */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-2 px-2 scroll-smooth">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${activeFilter === filter
                  ? "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan font-black"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-6 lg:hidden w-full">
        <AnimatePresence mode="popLayout">
          {processedPosts.map((post) => renderPostCard(post))}
        </AnimatePresence>
      </div>

      {/* Desktop Layout (Masonry side-by-side columns - 3 fixed columns) */}
      <div className="hidden lg:grid grid-cols-3 gap-6 items-start w-full">
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {col1Posts.map((post) => renderPostCard(post))}
          </AnimatePresence>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {col2Posts.map((post) => renderPostCard(post))}
          </AnimatePresence>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {col3Posts.map((post) => renderPostCard(post))}
          </AnimatePresence>
        </div>
      </div>

      {/* INFINITE SCROLL SKELETON LOADERS SIMULATION */}
      {hasMore && (
        <div ref={loaderRef} className="py-6 w-full">
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {/* Skeleton Card 1 */}
              <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-900" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3 w-28 bg-zinc-900 rounded-md" />
                      <div className="h-2 w-16 bg-zinc-900 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="h-32 bg-zinc-900 rounded-2xl w-full" />
                <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
              </div>
              {/* Skeleton Card 2 */}
              <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-900" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3 w-28 bg-zinc-900 rounded-md" />
                      <div className="h-2 w-16 bg-zinc-900 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="h-32 bg-zinc-900 rounded-2xl w-full" />
                <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
              </div>
              {/* Skeleton Card 3 */}
              <div className="bg-white/[0.01] border border-white/5 p-6 rounded-3xl flex flex-col gap-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-900" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3 w-28 bg-zinc-900 rounded-md" />
                      <div className="h-2 w-16 bg-zinc-900 rounded-md" />
                    </div>
                  </div>
                </div>
                <div className="h-32 bg-zinc-900 rounded-2xl w-full" />
                <div className="h-4 bg-zinc-900 rounded-md w-3/4" />
              </div>
            </div>
          )}
        </div>
      )}

      {!hasMore && (
        <div className="py-8 text-center text-xs text-zinc-600 font-mono font-bold uppercase tracking-widest w-full">
          You've explored all feed highlights for today!
        </div>
      )}


      {/* FLOATING CONFETTI/CELEBRATION OVERLAY */}
      <AnimatePresence>
        {celebrationOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-zinc-950/20 backdrop-blur-[1px]"
          >
            {/* Particle simulation items floating up */}
            {[...Array(20)].map((_, i) => {
              const left = `${Math.random() * 100}%`;
              const delay = `${Math.random() * 2}s`;
              const duration = `${Math.random() * 2 + 2}s`;
              const colors = ["#4F46E5", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const size = `${Math.random() * 8 + 6}px`;

              return (
                <motion.div
                  key={i}
                  initial={{ y: "100vh", opacity: 1, scale: 0.5, rotate: 0 }}
                  animate={{ y: "-10vh", opacity: 0, scale: 1.2, rotate: Math.random() * 360 }}
                  transition={{ duration: Math.random() * 2.5 + 2, ease: "easeOut" }}
                  className="absolute bottom-0"
                  style={{
                    left,
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    backgroundColor: randomColor,
                    boxShadow: `0 0 10px ${randomColor}`
                  }}
                />
              );
            })}

            {/* Glowing Trophy Card popup */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="bg-zinc-900/90 border border-brand-purple/30 p-6 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center max-w-xs relative pointer-events-auto backdrop-blur-xl"
            >
              <div className="h-14 w-14 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center text-brand-cyan mb-3">
                <Sparkles className="h-7 w-7 text-brand-cyan animate-spin-slow" />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Congratulations!</h4>
              <p className="text-xs text-zinc-300 font-semibold mt-1">Celebrating completion of:</p>
              <p className="text-xs text-brand-cyan font-black mt-1.5 italic">"{celebratedTitle}"</p>
              <div className="mt-4 text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">+100 Sparks Added</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 glass-panel border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IMAGE VIEWER MODAL */}
      <AnimatePresence>
        {isModalOpen && modalImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-[110] h-10 w-10 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main Modal Box */}
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative max-w-5xl w-full flex items-center justify-center pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Arrow Button for multiple images */}
              {modalImages.length > 1 && (
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? modalImages.length - 1 : prev - 1))}
                  className="absolute left-2 md:-left-16 z-[105] h-12 w-12 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Active Image */}
              <div className="relative w-fit max-w-full max-h-[80vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-950">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={modalImages[activeImageIndex]}
                    alt={`Enlarged image ${activeImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    className="max-w-full max-h-[80vh] object-contain rounded-2xl"
                  />
                </AnimatePresence>

                {/* Progress bar / Auto-cycle timeline indicator at bottom of image if there are multiple images */}
                {modalImages.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 flex">
                    <motion.div
                      key={activeImageIndex}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="h-full bg-brand-cyan"
                    />
                  </div>
                )}
              </div>

              {/* Right Arrow Button for multiple images */}
              {modalImages.length > 1 && (
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev === modalImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 md:-right-16 z-[105] h-12 w-12 rounded-full bg-zinc-900/60 border border-white/10 hover:bg-zinc-800/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Image Indicators (dots) at the bottom */}
              {modalImages.length > 1 && (
                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                  {modalImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeImageIndex === idx 
                          ? "w-6 bg-brand-cyan" 
                          : "w-2.5 bg-zinc-600 hover:bg-zinc-400"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed Comment Modal Popup */}
      <AnimatePresence>
        {activeCommentPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
            <div className="absolute inset-0 cursor-default" onClick={() => setActiveCommentPost(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel border border-white/10 rounded-3xl p-6 max-w-lg w-full relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left"
              style={{ backgroundColor: '#09090b' }}
            >
              <button
                onClick={() => setActiveCommentPost(null)}
                className="absolute top-3 right-3 p-1.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-10"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar" data-lenis-prevent>
                
                {/* Post details inside modal */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shrink-0">
                    <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white">
                      {activeCommentPost.user.avatar}
                    </div>
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white">{activeCommentPost.user.name}</span>
                      <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-md">Lv.{activeCommentPost.user.level}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{activeCommentPost.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-2 mt-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                    {activeCommentPost.type === "experience" ? activeCommentPost.experienceName : activeCommentPost.type === "quest" ? activeCommentPost.questName : activeCommentPost.type === "memory" ? activeCommentPost.memoryTitle : "Feed Post"}
                  </h3>
                  <p className="text-[10.5px] text-zinc-300 leading-relaxed font-medium">
                    {activeCommentPost.type === "experience" ? activeCommentPost.storyText : activeCommentPost.type === "memory" ? activeCommentPost.memoryText : activeCommentPost.type === "quest" ? `Quest completion reward: ${activeCommentPost.reward}` : activeCommentPost.discussionHighlight || "Community post update."}
                  </p>
                </div>

                {/* Comment area */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Post Comments ({activeCommentPost.comments?.length || 0})</h4>
                  
                  <div className="space-y-2">
                    {activeCommentPost.comments?.map(comm => (
                      <div key={comm.id} className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl text-[10px] text-left flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-200">{comm.user}</span>
                            <span className="text-[8px] text-zinc-500 font-mono">{comm.time}</span>
                          </div>
                          <p className="text-zinc-400 leading-relaxed mt-1 break-words">{comm.text}</p>
                        </div>
                        <button
                          onClick={() => handleLikeComment(activeCommentPost.id, comm.id)}
                          className="flex items-center gap-1 text-[8.5px] font-bold font-mono text-zinc-500 hover:text-rose-500 transition-colors p-1 rounded-lg hover:bg-white/5 shrink-0 cursor-pointer"
                        >
                          <Heart className={`h-3.5 w-3.5 ${comm.likedByMe ? "text-rose-500 fill-rose-500" : "text-zinc-500"}`} />
                          <span>{comm.likes || 0}</span>
                        </button>
                      </div>
                    ))}
                    {(!activeCommentPost.comments || activeCommentPost.comments.length === 0) && (
                      <p className="text-[9px] text-zinc-500 font-mono py-2">No comments published. Write yours below!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky comment input field */}
              <div className="pt-3 border-t border-white/5 mt-3 shrink-0 bg-zinc-950/20">
                <div className="flex gap-2 bg-zinc-900 border border-white/5 p-1 rounded-xl items-center">
                  <input
                    type="text"
                    placeholder="Share your thoughts..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment(activeCommentPost.id)}
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full px-2 font-semibold"
                  />
                  <button
                    onClick={() => handleAddComment(activeCommentPost.id)}
                    className="px-3.5 py-1.5 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 text-[9px] font-black rounded-lg transition-all shrink-0 cursor-pointer"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        </div>
      </main>

      {/* GUEST MODE INTERACTION / LOGIN REQUIRED MODAL */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowLoginModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="glass-panel border-white/10 rounded-3xl p-6 md:p-8 max-w-sm w-full relative z-10 shadow-2xl overflow-hidden flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: '#09090b' }}
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 shadow-lg flex items-center justify-center mb-4">
                <div className="h-full w-full rounded-2xl bg-zinc-900 flex items-center justify-center text-white border border-white/5">
                  <User className="h-6 w-6 text-brand-cyan" />
                </div>
              </div>

              <h3 className="text-base font-black text-white uppercase tracking-wider">Authentication Required</h3>
              <p className="text-xs text-zinc-400 font-semibold mt-2 leading-relaxed">
                You need to be logged in to {pendingAction || "interact with this post"}. Join Wandercall to track your adventures and unlock quests!
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="h-10 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <Link
                  href="/login"
                  className="h-10 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg shadow-brand-indigo/15"
                >
                  Log In
                </Link>
              </div>

              {/* Quick bypass button for testing */}
              <button
                onClick={() => {
                  setIsLoggedIn(true);
                  setShowLoginModal(false);
                  triggerToast("Logged in as Rishiraj (explorer mode activated)");
                }}
                className="mt-4 text-[9px] font-mono font-bold text-zinc-500 hover:text-brand-cyan transition-colors"
              >
                [Bypass: Simulate Log In]
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mock live campfire topics
const liveCampfires = [
  { topic: "Paragliding safety checklist in Bir Billing", host: "Captain Rohit", listeners: 42 },
  { topic: "Cheapest homestay loops in Sikkim valley routes", host: "Neha Sharma", listeners: 28 }
];
