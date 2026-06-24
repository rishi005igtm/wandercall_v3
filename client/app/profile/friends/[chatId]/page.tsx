'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Phone,
  Flame,
  Info,
  Send,
  Mic,
  Share2,
  Calendar,
  Compass,
  MapPin,
  Heart,
  Flag,
  ShieldAlert
} from "lucide-react";

// Mock Companion Data definition matching friends/page.tsx
interface Companion {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "Available" | "In Campfire" | "Exploring" | "Hosting" | "Offline" | "Busy";
  compatibility: number;
  sharedDNA: "Explorer" | "Creative" | "Learner" | "Storyteller";
  mutualExperiences: number;
  mutualCommunities: number;
  bio: string;
  location: string;
  tags: string[];
  isFavorite: boolean;
  isAdventurePartner: boolean;
  lastActive: string;
}

const COMPANIONS: Companion[] = [
  {
    id: "f-1",
    name: "Arjun Mehta",
    username: "@arjun_m",
    avatar: "🏔️",
    status: "Exploring",
    compatibility: 92,
    sharedDNA: "Explorer",
    mutualExperiences: 8,
    mutualCommunities: 5,
    bio: "Summit bagger & dive master. Lives in the water. Trekking the Western Ghats this weekend.",
    location: "Bangalore, India",
    tags: ["High Altitude", "Scuba", "Adrenaline"],
    isFavorite: true,
    isAdventurePartner: true,
    lastActive: "Active now"
  },
  {
    id: "f-2",
    name: "Sara Khan",
    username: "@sara_k",
    avatar: "📸",
    status: "Available",
    compatibility: 88,
    sharedDNA: "Creative",
    mutualExperiences: 5,
    mutualCommunities: 3,
    bio: "Landscape photographer & twilight stargazer. Documenting heritage cafes and old roads.",
    location: "Mumbai, India",
    tags: ["Astro Photo", "Culinary", "Road Trips"],
    isFavorite: true,
    isAdventurePartner: false,
    lastActive: "Active 5m ago"
  },
  {
    id: "f-3",
    name: "Divya Kapoor",
    username: "@divya_k",
    avatar: "🖋️",
    status: "In Campfire",
    compatibility: 76,
    sharedDNA: "Storyteller",
    mutualExperiences: 3,
    mutualCommunities: 4,
    bio: "Backpacker across Southeast Asia. Hosting campfire chatrooms on local folklore and myths.",
    location: "Delhi, India",
    tags: ["Journaling", "History", "Folklore"],
    isFavorite: false,
    isAdventurePartner: true,
    lastActive: "Active now"
  },
  {
    id: "f-4",
    name: "Karan Johar",
    username: "@karan_j",
    avatar: "🎒",
    status: "Hosting",
    compatibility: 84,
    sharedDNA: "Learner",
    mutualExperiences: 4,
    mutualCommunities: 6,
    bio: "Ecology researcher and off-grid pathfinder. Passionate about forest biodiversity preservation.",
    location: "Coorg, India",
    tags: ["Forestry", "Biodiversity", "Mapping"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 15m ago"
  },
  {
    id: "f-5",
    name: "Neha Nair",
    username: "@neha_n",
    avatar: "⛺",
    status: "Busy",
    compatibility: 72,
    sharedDNA: "Explorer",
    mutualExperiences: 2,
    mutualCommunities: 3,
    bio: "Hammock camper and solo highway rider. Always searching for lakeside campsites and starry skies.",
    location: "Kochi, India",
    tags: ["Solo Camp", "Motorcycling", "Stargazing"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 2h ago"
  },
  {
    id: "f-6",
    name: "Rohan Das",
    username: "@rohan_d",
    avatar: "🌊",
    status: "Offline",
    compatibility: 68,
    sharedDNA: "Creative",
    mutualExperiences: 1,
    mutualCommunities: 2,
    bio: "Marine conservation volunteer. Surfer, diver, and underwater video creator.",
    location: "Goa, India",
    tags: ["Conservation", "Surfing", "Vlogging"],
    isFavorite: false,
    isAdventurePartner: false,
    lastActive: "Active 1d ago"
  }
];

const INITIAL_MESSAGES: Record<string, any[]> = {
  "f-1": [
    { id: "m-1", sender: "friend", text: "Hey! Are you heading to Coorg this weekend? The coffee estate trails are fully open.", type: "text", timestamp: "10:24 AM" },
    { id: "m-2", sender: "me", text: "Yes! Planning a 14km loop through the valleys. The weather looks perfect.", type: "text", timestamp: "10:26 AM" },
    {
      id: "m-3",
      sender: "friend",
      type: "experience",
      timestamp: "10:28 AM",
      metadata: {
        title: "Western Ghats Ridge Walk",
        host: "Tenzing N.",
        date: "Tomorrow at 8:00 AM",
        category: "Adventure",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=300&auto=format&fit=crop"
      }
    },
    { id: "m-4", sender: "friend", text: "Here is the audio description of the steep ridge sections. Check this out:", type: "text", timestamp: "10:29 AM" },
    { id: "m-5", sender: "friend", type: "audio", timestamp: "10:29 AM", metadata: { duration: "0:42", waves: [20, 45, 15, 60, 80, 25, 40, 70, 95, 30, 50, 10] } },
    {
      id: "m-6",
      sender: "me",
      type: "plan",
      timestamp: "10:31 AM",
      metadata: {
        title: "Weekend Coorg Ridge Trek",
        date: "June 27-28",
        location: "Kakkabe, Coorg",
        companions: ["Rishiraj", "Arjun Mehta"],
        status: "Planning"
      }
    }
  ],
  "f-2": [
    { id: "m2-1", sender: "friend", text: "Hey Rishiraj, did you check the twilight photography guidelines I posted?", type: "text", timestamp: "Yesterday" },
    { id: "m2-2", sender: "me", text: "Yes! Loved the exposure timings guide. Planning to try it next week.", type: "text", timestamp: "Yesterday" }
  ]
};

// Helper to generate dynamic, unique icebreaker prompts based on companion profile details
function getIcebreakers(friend: Companion) {
  const name = friend.name.split(" ")[0];
  const tags = friend.tags || [];
  
  const baseIcebreakers = [
    `Hey ${name}, let's align our coordinate maps and plan an adventure! 🧭`,
    `Saw you share my adventure DNA! Up for a quick chat? 🎒`,
  ];
  
  if (tags.some(t => ["Surfing", "Scuba", "Conservation"].includes(t))) {
    return [
      `Hey ${name}, up for hitting the waves or a beach dive sometime? 🌊`,
      `Saw you do marine/surf activities. What's your favorite coastal spot? 🏄‍♂️`,
      ...baseIcebreakers
    ].slice(0, 3);
  }
  
  if (tags.some(t => ["High Altitude", "Trekking", "Forestry"].includes(t))) {
    return [
      `Hey ${name}, are you planning any steep treks or peak climbs soon? 🏔️`,
      `I'd love to join you on one of those wilderness trail explorations! 🌲`,
      ...baseIcebreakers
    ].slice(0, 3);
  }

  if (tags.some(t => ["Astro Photo", "Creative", "Journaling"].includes(t))) {
    return [
      `Hey ${name}, what gear do you use for twilight photography and stargazing? 📸`,
      `Let's sync up for a stargazing field trip sometime! 🌌`,
      ...baseIcebreakers
    ].slice(0, 3);
  }

  return [
    `Hey ${name}, let's align our coordinate grids and start planning! 🗺️`,
    `Saw you're active nearby! What community quests are you doing? 💎`,
    `Up for joining a campfire room or planning a trek together? ⛺`
  ];
}

export default function MobileChatPage({ params }: { params: React.Usable<{ chatId: string }> }) {
  const { chatId } = React.use(params);

  // Clean parameter (extract the userId from e.g. 'chat:f-1')
  const userId = chatId.startsWith("chat:") ? chatId.substring(5) : chatId;

  const router = useRouter();

  const [activeFriend, setActiveFriend] = useState<Companion | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showInspector, setShowInspector] = useState(false);

  const chatStreamRef = useRef<HTMLDivElement>(null);

  // Initialize data on mount
  useEffect(() => {
    const friend = COMPANIONS.find(c => c.id === userId) || COMPANIONS[0];
    setActiveFriend(friend);
    setMessages(INITIAL_MESSAGES[friend.id] || []);
  }, [userId]);

  // Scroll to bottom instantly when messages load or change
  useEffect(() => {
    const container = chatStreamRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  if (!activeFriend) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-bg text-zinc-400">
        Loading Chat...
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `m-custom-${Date.now()}`,
      sender: "me",
      text: chatInput,
      type: "text",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput("");
  };

  const handleSendExperience = () => {
    const newMsg = {
      id: `m-exp-${Date.now()}`,
      sender: "me",
      type: "experience",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        title: "Alpine Cliff Dive Experience",
        host: "Bear G.",
        date: "June 29 at 3:00 PM",
        category: "Adventure",
        image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=300&auto=format&fit=crop"
      }
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendPlan = () => {
    const newMsg = {
      id: `m-plan-${Date.now()}`,
      sender: "me",
      type: "plan",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        title: `Weekend Coorg Ridge Trek`,
        date: "June 27-28",
        location: "Kakkabe, Coorg",
        companions: ["Rishiraj", activeFriend.name],
        status: "Planning"
      }
    };
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-brand-bg text-white relative overflow-hidden">

      {/* 1. HEADER SECTION */}
      <header className="h-16 w-full border-b border-white/5 px-4 flex items-center justify-between bg-zinc-950/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/profile/friends')}
            className="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-white shrink-0 cursor-pointer animate-none"
            title="Go Back"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-white truncate flex items-center gap-1.5">
              {activeFriend.name}
            </h3>
            <p className="text-[9px] text-zinc-500 truncate">{activeFriend.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => alert(`Calling ${activeFriend.name}...`)}
            className="p-2 rounded-xl bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Voice Call"
          >
            <Phone className="h-4 w-4" />
          </button>
          <button
            onClick={() => alert(`Inviting ${activeFriend.name} to a campfire lobby...`)}
            className="p-2 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
            title="Invite to Campfire"
          >
            <Flame className="h-4 w-4" /> Invite
          </button>
          <button
            onClick={() => setShowInspector(true)}
            className="p-2 rounded-xl border border-white/5 text-zinc-400 hover:text-white cursor-pointer"
            title="Explorer Info"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* 2. MESSAGES STREAM */}
      <div
        ref={chatStreamRef}
        className="flex-1 py-4 overflow-y-auto space-y-3 custom-scrollbar px-4"
        data-lenis-prevent
      >
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender === "me";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  {msg.type === "text" && (
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed ${isMe
                        ? "bg-brand-cyan text-zinc-950 rounded-tr-none font-semibold shadow-md shadow-brand-cyan/5"
                        : "bg-white/5 text-zinc-200 rounded-tl-none border border-white/5"
                      }`}>
                      {msg.text}
                    </div>
                  )}

                  {msg.type === "audio" && (
                    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center gap-3 w-60">
                      <button
                        onClick={() => alert("Playing audio note...")}
                        className="h-8 w-8 rounded-full bg-brand-cyan text-zinc-950 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Compass className="h-4 w-4 fill-zinc-950" />
                      </button>
                      <div className="flex-1 flex items-center gap-1">
                        {msg.metadata.waves.map((h: number, i: number) => (
                          <span
                            key={i}
                            className="h-3 bg-zinc-650 flex-1 rounded-full"
                            style={{ height: `${h * 0.4}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">{msg.metadata.duration}</span>
                    </div>
                  )}

                  {msg.type === "experience" && (
                    <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-lg w-60 text-left">
                      <div className="h-24 w-full relative">
                        <img src={msg.metadata.image} className="h-full w-full object-cover opacity-80" alt="" />
                        <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider font-extrabold bg-brand-cyan text-zinc-950 px-2 py-0.5 rounded-full">
                          {msg.metadata.category}
                        </span>
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                        <p className="text-[9px] text-zinc-500">{msg.metadata.date} • Host: {msg.metadata.host}</p>
                        <button
                          onClick={() => alert(`Booking slot for ${msg.metadata.title}...`)}
                          className="w-full py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-zinc-950 border border-brand-cyan/20 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer"
                        >
                          Request Slot
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.type === "plan" && (
                    <div className="glass-panel border border-white/10 p-3.5 rounded-2xl shadow-lg w-60 text-left space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold bg-brand-purple text-white px-2 py-0.5 rounded-full">
                          Adventure Plan
                        </span>
                        <span className="text-[8px] font-mono text-brand-cyan font-bold">{msg.metadata.status}</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white truncate">{msg.metadata.title}</h4>
                        <p className="text-[9px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-zinc-400" /> {msg.metadata.location}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-mono">Date: {msg.metadata.date}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        {msg.metadata.companions.map((name: string, i: number) => (
                          <span key={i} className="h-5 px-2 bg-white/5 border border-white/5 text-[8px] font-bold rounded-md text-zinc-300">
                            {name.split(" ")[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[8px] text-zinc-650 mt-1 font-mono">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-4 py-8 select-none animate-none">
            {/* Premium enterprise-level glowing SVG illustration representing digital alignment */}
            <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
              {/* Inner glowing pulse */}
              <div className="absolute inset-0 bg-brand-cyan/5 rounded-full filter blur-xl animate-pulse" />
              
              {/* Custom Animated SVG Illustration */}
              <svg className="w-32 h-32 relative z-10 text-brand-cyan" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Orbital Ring 1 */}
                <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4 4" className="animate-[spin_40s_linear_infinite]" />
                {/* Orbital Ring 2 */}
                <circle cx="100" cy="100" r="50" stroke="url(#cyan-glow-grad-mob)" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="8 6" className="animate-[spin_20s_linear_infinite_reverse]" />
                {/* Orbital Ring 3 */}
                <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" />
                
                {/* Connections */}
                <line x1="100" y1="100" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="100" y1="100" x2="140" y2="60" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
                <line x1="100" y1="100" x2="100" y2="150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />

                {/* Node 1: User coordinates */}
                <g className="animate-[bounce_3s_ease-in-out_infinite]">
                  <circle cx="60" cy="60" r="8" fill="url(#cyan-glow-grad-mob)" className="shadow-lg shadow-brand-cyan/20" />
                  <circle cx="60" cy="60" r="4" fill="#09090b" />
                </g>
                {/* Node 2: Companion coordinates */}
                <g className="animate-[bounce_4s_ease-in-out_infinite_1s]">
                  <circle cx="140" cy="60" r="10" fill="url(#purple-glow-grad-mob)" />
                  <text x="140" y="63" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">👤</text>
                </g>
                {/* Node 3: Quest target coordinates */}
                <g className="animate-[pulse_2s_infinite]">
                  <circle cx="100" cy="150" r="7" fill="url(#amber-glow-grad-mob)" />
                  <path d="M100 146L103 152L97 152Z" fill="#09090b" />
                </g>

                {/* Center Star / Explorer Compass Emblem */}
                <g className="animate-[pulse_3s_infinite]">
                  <circle cx="100" cy="100" r="16" fill="#09090b" stroke="url(#cyan-glow-grad-mob)" strokeWidth="2" />
                  {/* 4-point Compass Star */}
                  <path d="M100 88L103 97L112 100L103 103L100 112L97 103L88 100L97 97Z" fill="url(#cyan-glow-grad-mob)" />
                </g>

                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="cyan-glow-grad-mob" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="purple-glow-grad-mob" x1="120" y1="40" x2="160" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="amber-glow-grad-mob" x1="80" y1="130" x2="120" y2="170" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Orbiting particles */}
              <div className="absolute top-[20%] left-[20%] w-2 h-2 rounded-full bg-brand-cyan/40 animate-ping duration-1000" />
              <div className="absolute bottom-[25%] right-[22%] w-1.5 h-1.5 rounded-full bg-brand-purple/40 animate-ping duration-1500" />
            </div>

            {/* Heading & description */}
            <h3 className="text-xs font-black tracking-wider uppercase text-zinc-200 mt-2">
              Connect with {activeFriend.name}
            </h3>
            <p className="text-[10px] text-zinc-400 max-w-[280px] leading-relaxed mt-1">
              Establish coordinate link alignment & collaborate on treks. Send an icebreaker below to invite them as an Adventure Partner!
            </p>

            {/* Icebreaker Suggestions */}
            <div className="flex flex-col gap-1.5 w-full max-w-[320px] mt-4 shrink-0">
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">
                Suggested Icebreakers (Click to fill)
              </span>
              {getIcebreakers(activeFriend).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(prompt)}
                  className="text-left text-[9px] font-bold px-3 py-2 bg-white/[0.01] hover:bg-brand-cyan/10 border border-white/5 hover:border-brand-cyan/20 text-zinc-400 hover:text-brand-cyan rounded-xl transition-all cursor-pointer truncate w-full flex items-center gap-2 group"
                >
                  <span className="text-brand-cyan group-hover:scale-110 transition-transform">🧭</span>
                  <span className="truncate">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. INPUT CONTROLS */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-2 bg-zinc-950/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendExperience}
            className="px-2 py-1 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 shrink-0"
          >
            <Share2 className="h-3 w-3 text-brand-cyan" /> Experience
          </button>
          <button
            onClick={handleSendPlan}
            className="px-2 py-1 bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-white/10 text-[9px] font-bold uppercase tracking-wider rounded-lg text-zinc-400 hover:text-white cursor-pointer transition-all flex items-center gap-1 shrink-0"
          >
            <Calendar className="h-3 w-3 text-brand-purple" /> Plan Trek
          </button>
        </div>

        <div className="flex items-center gap-2 bg-zinc-950/80 border border-white/10 p-1.5 rounded-2xl w-full">
          <button
            onClick={() => alert("Simulating mic trigger...")}
            className="p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            <Mic className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Write message to explorer..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-semibold px-2"
          />

          <button
            onClick={handleSendMessage}
            className="p-2 bg-brand-cyan hover:bg-cyan-400 text-zinc-950 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0 shadow-md shadow-brand-cyan/15"
          >
            <Send className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      </div>

      {/* 4. DETAILS OVERLAY PANEL (INSPECTOR) */}
      {showInspector && (
        <div className="absolute inset-0 bg-zinc-950 z-50 flex flex-col p-6 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Explorer Profile</span>
            <button
              onClick={() => setShowInspector(false)}
              className="p-1 rounded-lg border border-white/10 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-6 text-left flex-1">
            {/* Passport Card */}
            <div className="bg-white/[0.01] border border-white/5 p-4 rounded-3xl space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-cyan/20 border border-brand-cyan/20 px-2 py-0.5 rounded-full font-mono text-[8px] font-bold text-brand-cyan">
                {activeFriend.compatibility}% match
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeFriend.avatar}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{activeFriend.name}</h4>
                  <span className="text-[9px] text-zinc-500">{activeFriend.username}</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal">{activeFriend.bio}</p>

              <div className="flex flex-wrap gap-1">
                {activeFriend.tags.map(tag => (
                  <span key={tag} className="text-[8px] font-semibold bg-white/5 border border-white/5 text-zinc-400 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Compatibility Breakdown */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Compatibility breakdown</h4>
              <div className="space-y-2 bg-black/20 border border-white/5 p-3 rounded-2xl">
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-brand-cyan">Adventure Overlap</span>
                    <span>{activeFriend.compatibility}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-cyan" style={{ width: `${activeFriend.compatibility}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-brand-purple">Community Overlap</span>
                    <span>{activeFriend.mutualCommunities * 15}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-purple" style={{ width: `${activeFriend.mutualCommunities * 15}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold">
                    <span className="text-brand-emerald">Experiences Shared</span>
                    <span>{activeFriend.mutualExperiences * 12}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-emerald" style={{ width: `${activeFriend.mutualExperiences * 12}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => {
                  alert("User reported.");
                  setShowInspector(false);
                }}
                className="w-full py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Flag className="h-3.5 w-3.5" /> Report Explorer
              </button>
              <button
                onClick={() => {
                  alert(activeFriend.isFavorite ? "Removed from Favorites" : "Added to Favorites");
                  setActiveFriend(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
                  setShowInspector(false);
                }}
                className="w-full py-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Heart className="h-3.5 w-3.5" /> {activeFriend.isFavorite ? "Unfavorite" : "Favorite"}
              </button>
              <button
                onClick={() => {
                  alert(`${activeFriend.name} has been blocked.`);
                  router.push('/profile/friends');
                }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Block Explorer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
