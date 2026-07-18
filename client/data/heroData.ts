import { Compass, Flame, Ghost, PartyPopper, Utensils, Tent, Mountain, Landmark, Waves, Camera, Heart, Palmtree, Activity, BookOpen, Moon, Cpu, Map, Gamepad2, Music } from "lucide-react";

export const HERO_CATEGORIES = [
  { id: "adventure", name: "Adventure", count: "1.2k", icon: Compass, color: "from-brand-indigo to-brand-purple", size: "large", image: "/categories/Adventure.webp" },
  { id: "thrill", name: "Thrill", count: "430", icon: Flame, color: "from-rose-500 to-orange-500", size: "medium", image: "/categories/Thrill.webp" },
  { id: "horror", name: "Horror", count: "120", icon: Ghost, color: "from-zinc-600 to-zinc-900", size: "medium", image: "/categories/Horror.webp" },
  { id: "party", name: "Party", count: "890", icon: PartyPopper, color: "from-fuchsia-500 to-pink-500", size: "medium", image: "/categories/party.webp" },
  { id: "food", name: "Food", count: "410", icon: Utensils, color: "from-amber-400 to-orange-500", size: "medium", image: "/categories/food.webp" },
  { id: "trekking", name: "Trekking", count: "750", icon: Mountain, color: "from-brand-emerald to-emerald-700", size: "large", image: "/categories/Trekking.webp" },
  { id: "camping", name: "Camping", count: "530", icon: Tent, color: "from-green-500 to-emerald-600", size: "large", image: "/categories/Camping.webp" },
  { id: "cultural", name: "Cultural", count: "320", icon: Landmark, color: "from-blue-400 to-brand-cyan", size: "large", image: "/categories/Cultural.webp" },
  { id: "sailing", name: "Sailing", count: "110", icon: Waves, color: "from-cyan-500 to-blue-600", size: "medium", image: "/categories/Sailing.webp" },
  { id: "safari", name: "Safari", count: "80", icon: Camera, color: "from-yellow-600 to-amber-700", size: "medium", image: "/categories/Safari.webp" },
  { id: "wellness", name: "Wellness", count: "250", icon: Heart, color: "from-pink-400 to-rose-400", size: "medium", image: "/categories/Wellness.webp" },
  { id: "art", name: "Art & DIY", count: "190", icon: Palmtree, color: "from-purple-400 to-fuchsia-500", size: "medium", image: "/categories/Art & DIY.webp" },
  { id: "sports", name: "Sports", count: "340", icon: Activity, color: "from-blue-500 to-indigo-500", size: "large", image: "/categories/Sports.webp" },
  { id: "learning", name: "Learning", count: "210", icon: BookOpen, color: "from-emerald-400 to-teal-500", size: "medium", image: "/categories/Learning.webp" },
  { id: "nightlife", name: "Nightlife", count: "550", icon: Moon, color: "from-indigo-600 to-purple-800", size: "medium", image: "/categories/Nightlife.webp" },
  { id: "technology", name: "Technology", count: "120", icon: Cpu, color: "from-zinc-500 to-zinc-700", size: "large", image: "/categories/Technology.webp" },
  { id: "travel", name: "Travel", count: "890", icon: Map, color: "from-sky-400 to-blue-500", size: "large", image: "/categories/Travel.webp" },
  { id: "gaming", name: "Gaming", count: "430", icon: Gamepad2, color: "from-pink-500 to-rose-500", size: "medium", image: "/categories/Gaming.webp" },
  { id: "photography", name: "Photography", count: "280", icon: Camera, color: "from-amber-500 to-orange-600", size: "medium", image: "/categories/Photography.webp" },
  { id: "music", name: "Music", count: "670", icon: Music, color: "from-fuchsia-500 to-pink-600", size: "large", image: "/categories/Music.webp" },
];

export const HERO_SLIDES = [
  {
    id: "scuba",
    title: "Scuba Diving in Netrani",
    category: "Adventure",
    image: "/hero-bg.png",
    xp: 120,
    price: "₹4,999",
    location: "Goa, India",
    slots: 2,
    difficulty: "Moderate",
    weather: "28°C Sunny",
    rating: 4.9,
    host: { initial: "A", color: "bg-brand-indigo" }
  },
  {
    id: "trek",
    title: "Midnight Trek to Skandagiri",
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1516939884455-1445c8652f83?q=80&w=2000&auto=format&fit=crop",
    xp: 250,
    price: "₹1,499",
    location: "Karnataka, India",
    slots: 8,
    difficulty: "Hard",
    weather: "18°C Clear",
    rating: 4.7,
    host: { initial: "R", color: "bg-brand-emerald" }
  },
  {
    id: "camp",
    title: "Riverside Camping",
    category: "Camping",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2000&auto=format&fit=crop",
    xp: 90,
    price: "₹2,299",
    location: "Coorg, India",
    slots: 12,
    difficulty: "Easy",
    weather: "22°C Breezy",
    rating: 4.8,
    host: { initial: "S", color: "bg-brand-amber" }
  }
];

export const QUICK_FILTERS = [
  "Today", "Tomorrow", "Weekend", "Near Me", "Budget", "Premium", "Trending", "New", "Solo", "Couples"
];
