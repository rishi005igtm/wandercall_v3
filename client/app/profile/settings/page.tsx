"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Shield,
  Lock,
  Eye,
  Bell,
  Radio,
  Users,
  UserPlus,
  Compass,
  Link as LinkIcon,
  Database,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Smartphone,
  Globe,
  Settings as SettingsIcon,
  Mic,
  VolumeX,
  Volume2,
  Calendar,
  Share2,
  Power,
  X,
  ArrowRight,
  ShieldAlert,
  Info,
  Download,
  Check,
  Loader2,
  CreditCard
} from "lucide-react";

// ==========================================
// Types & Data Structures
// ==========================================

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  blockedAt: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  country: string;
  lastActive: string;
  isCurrent: boolean;
}

// Initial Mock Datasets
const INITIAL_BLOCKED_USERS: BlockedUser[] = [
  { id: "b-1", name: "Dianne Russell", username: "@dianne_r", blockedAt: "Blocked June 22, 2026" },
  { id: "b-2", name: "Cody Fisher", username: "@cody_f", blockedAt: "Blocked June 18, 2026" },
  { id: "b-3", name: "Devon Lane", username: "@devon_l", blockedAt: "Blocked June 15, 2026" }
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: "s-1", device: "MacBook Pro M3", browser: "Arc Browser", country: "Bangalore, India", lastActive: "Active Now", isCurrent: true },
  { id: "s-2", device: "iPhone 15 Pro", browser: "Safari Mobile", country: "Bangalore, India", lastActive: "2 hours ago", isCurrent: false },
  { id: "s-3", device: "Windows Gaming PC", browser: "Chrome Desktop", country: "Mumbai, India", lastActive: "3 days ago", isCurrent: false }
];

const ADVENTURE_DNA_DNA_BADGES = [
  { name: "Explorer", value: 95, color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
  { name: "Thrill Seeker", value: 90, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { name: "Creator", value: 65, color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20" },
  { name: "Learner", value: 75, color: "text-brand-indigo bg-brand-indigo/10 border-brand-indigo/20" }
];

const ADVENTURE_CATEGORIES_LIST = [
  "Adventure", "Food", "Learning", "Nightlife", "Photography", "Storytelling", "Fitness", "Travel", "Water Activities"
];

// ==========================================
// Settings Navigation Config
// ==========================================
const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile Settings", sub: "Explorer Identity", icon: User, badge: "85%" },
  { id: "account", label: "Account Control", sub: "Core Controls", icon: SettingsIcon },
  { id: "plans", label: "Plan Management", sub: "Billing & Subscriptions", icon: Sparkles, badge: "Active" },
  { id: "security", label: "Security Hub", sub: "Shield & Keys", icon: Shield, badge: "Secure" },
  { id: "privacy", label: "Privacy Matrix", sub: "Visibility Rules", icon: Eye },
  { id: "notifications", label: "Notification Desk", sub: "Group Alerts", icon: Bell },
  { id: "adventure", label: "Adventure Preferences", sub: "Travel Ranges", icon: Compass },
  { id: "integrations", label: "Connected Networks", sub: "API Links", icon: LinkIcon, badge: "6 Active" }
] as const;

type SettingsTab = typeof SETTINGS_SECTIONS[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic States
  const [displayName, setDisplayName] = useState("Rishiraj");
  const [username, setUsername] = useState("@rishi005");
  const [bio, setBio] = useState("Digital nomad and thrill seeker. Always looking for the next off-grid adventure, mountain summit, or campfire story.");
  const [location, setLocation] = useState("Bangalore, India");
  const [website, setWebsite] = useState("https://wandercall.io/rishi");
  
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(INITIAL_BLOCKED_USERS);
  
  // Notification category toggles
  const [notifications, setNotifications] = useState({
    bookings: true,
    communities: true,
    campfires: false,
    friends: true,
    messages: true,
    quests: true,
    experiences: false,
    promotions: false,
    system: true
  });
  
  // Privacy matrices
  const [privacyMatrix, setPrivacyMatrix] = useState({
    profile: "public",
    friends: "friends",
    memories: "friends",
    communities: "public",
    campfires: "friends",
    experiences: "public"
  });

  // Audio settings
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [pushToTalk, setPushToTalk] = useState(false);
  const [roomVisibility, setRoomVisibility] = useState("friends");

  // Adventure Preferences
  const [travelRadius, setTravelRadius] = useState(150); // in km
  const [budgetRange, setBudgetRange] = useState(250); // maximum budget slider
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Legendary">("Hard");
  const [groupSize, setGroupSize] = useState<"Solo" | "Small (2-5)" | "Medium (6-10)" | "Large (10+)">("Small (2-5)");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Adventure", "Photography", "Travel"]);

  // Connected integrations state
  const [integrations, setIntegrations] = useState({
    google: { connected: true, email: "rishi005.dev@gmail.com" },
    apple: { connected: false },
    discord: { connected: true, username: "rishi_nomad" },
    instagram: { connected: true, username: "@rishi_adventure" },
    x: { connected: false },
    github: { connected: true, username: "rishi005igtm" }
  });

  // Notification preview simulation state
  const [previewNotificationType, setPreviewNotificationType] = useState<keyof typeof notifications>("bookings");

  // Plans Management States
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedTier, setSelectedTier] = useState<"standard" | "premium" | "legendary">("premium");
  const [addOns, setAddOns] = useState({
    storage: false,
    priority: false,
    badge: false,
  });
  const [paymentCard, setPaymentCard] = useState({
    name: "RISHIRAJ",
    number: "•••• •••• •••• 8843",
    expiry: "08/29",
    cvv: "•••",
  });
  const [cardEditing, setCardEditing] = useState(false);
  const [cardEditForm, setCardEditForm] = useState({
    name: "RISHIRAJ",
    number: "4321 8765 0987 8843",
    expiry: "08/29",
    cvv: "123",
  });
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const activeNavItem = useMemo(() => {
    return SETTINGS_SECTIONS.find(s => s.id === activeTab) || SETTINGS_SECTIONS[0];
  }, [activeTab]);

  // Search filter settings items
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_SECTIONS;
    const query = searchQuery.toLowerCase();
    return SETTINGS_SECTIONS.filter(
      item =>
        item.label.toLowerCase().includes(query) ||
        item.sub.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Auto-switch to first match if search changes
  useEffect(() => {
    if (searchQuery.trim() && filteredNavItems.length > 0) {
      // Find if current tab is still in filtered items, if not switch to first matching item
      const isStillVisible = filteredNavItems.some(i => i.id === activeTab);
      if (!isStillVisible) {
        setActiveTab(filteredNavItems[0].id);
      }
    }
  }, [searchQuery, filteredNavItems, activeTab]);

  const handleSignOutSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleUnblockUser = (id: string) => {
    setBlockedUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleIntegration = (key: keyof typeof integrations) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        connected: !prev[key].connected,
        ...(key === 'google' && !prev[key].connected ? { email: "rishi005.dev@gmail.com" } : {}),
        ...(key === 'discord' && !prev[key].connected ? { username: "rishi_nomad" } : {}),
        ...(key === 'instagram' && !prev[key].connected ? { username: "@rishi_adventure" } : {}),
        ...(key === 'github' && !prev[key].connected ? { username: "rishi005igtm" } : {})
      }
    }));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 text-white flex flex-col gap-6 select-none font-sans overflow-x-hidden">
      
      {/* ==========================================
          SETTINGS SEARCH & TOP COMMAND HEADER
          ========================================== */}
      <div className="flex items-center justify-between gap-4 shrink-0 flex-wrap sm:flex-nowrap">
        <div className="text-left">
          <h1 className="text-xl font-black uppercase tracking-wider text-white">System Settings</h1>
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1">Explorer Digital Identity Control</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-white/5 rounded-2xl w-full sm:max-w-[320px] shadow-inner focus-within:border-brand-cyan/20 transition-all">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search system settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full font-bold"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          1. SETTINGS COMMAND CENTER STATUS STRIP
          ========================================== */}
      <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-6 overflow-x-auto no-scrollbar shrink-0 select-none">
        <div className="flex items-center gap-8 min-w-max">
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Account Health</span>
              <span className="text-xs font-bold text-zinc-200">Excellent Status</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan animate-pulse">
              <Shield className="h-4.5 w-4.5 fill-brand-cyan/10" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Security Score</span>
              <span className="text-xs font-bold text-brand-cyan">92/100 Shielded</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              {/* Mini radial ring representation */}
              <svg className="w-6 h-6 transform -rotate-90">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="transparent" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="transparent" strokeDasharray="56" strokeDashoffset="8.4" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Profile Completeness</span>
              <span className="text-xs font-bold text-zinc-200">85% Complete</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center text-brand-indigo">
              <LinkIcon className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Integrations</span>
              <span className="text-xs font-bold text-zinc-200">4 Accounts Linked</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/5" />

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <Eye className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Privacy Level</span>
              <span className="text-xs font-bold text-brand-amber">Semi-Private</span>
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          MOBILE CATEGORY SELECTOR BUTTON
          ========================================== */}
      <div className="lg:hidden w-full flex">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-full flex items-center justify-between p-3.5 bg-zinc-900 border border-white/5 rounded-2xl font-black text-xs uppercase tracking-wider text-brand-cyan hover:bg-white/[0.02]"
        >
          <span className="flex items-center gap-2">
            <activeNavItem.icon className="h-4.5 w-4.5 text-brand-cyan" />
            {activeNavItem.label}
          </span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ==========================================
          2. SETTINGS WORKSPACE CONTAINER
          ========================================== */}
      <div className="w-full flex items-start gap-6 min-h-[580px] h-auto">
        
        {/* Settings Navigation Rail */}
        <aside className="hidden lg:flex w-[260px] shrink-0 glass-panel border border-white/5 rounded-3xl p-4 flex-col justify-between lg:h-[700px] overflow-y-auto no-scrollbar">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pb-2 border-b border-white/5 text-left px-2">
              Workspace Categories
            </div>
            <nav className="flex flex-col gap-1 mt-2">
              {filteredNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`relative flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                      isActive ? "bg-white/[0.03] border-brand-cyan/20 border" : "bg-transparent border border-transparent hover:bg-white/[0.01]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-brand-cyan" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-brand-cyan" : "text-zinc-500 group-hover:text-zinc-300"}`} />
                      <div className="min-w-0">
                        <span className={`text-[11px] font-extrabold block truncate ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                          {item.label}
                        </span>
                        <span className="text-[8px] text-zinc-500 block truncate">{item.sub}</span>
                      </div>
                    </div>
                    {"badge" in item && (
                      <span className={`text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        isActive ? "bg-brand-cyan/25 text-brand-cyan" : "bg-white/5 text-zinc-500"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredNavItems.length === 0 && (
                <div className="text-center py-8 text-zinc-650 text-xs font-bold uppercase tracking-wider">
                  No matching settings
                </div>
              )}
            </nav>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="p-3 bg-zinc-950/20 border border-white/5 rounded-2xl flex items-center gap-3 text-left">
              <Info className="h-4.5 w-4.5 text-zinc-500 shrink-0" />
              <p className="text-[8px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wider">
                All identity configurations sync securely to the vector client matrix.
              </p>
            </div>
            
            <button
              onClick={() => {
                triggerToast("Initiating secure logout node sequence...");
                setTimeout(() => {
                  window.location.href = "/login";
                }, 800);
              }}
              className="flex items-center justify-between p-3 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-2xl text-left transition-all cursor-pointer group mt-1"
            >
              <div className="flex items-center gap-3">
                <Power className="h-4.5 w-4.5 shrink-0 text-rose-500" />
                <div>
                  <span className="text-[11px] font-extrabold block text-rose-400 group-hover:text-rose-350">
                    Sign Out Node
                  </span>
                  <span className="text-[8px] text-zinc-500 block font-bold uppercase tracking-wider">Disconnect current session</span>
                </div>
              </div>
            </button>
          </div>
        </aside>

        {/* Dynamic Settings Workspace Panel */}
        <main className={`flex-1 glass-panel border border-white/5 rounded-3xl p-6 flex flex-col justify-between text-left relative ${
          activeTab === "plans" ? "h-auto min-h-[700px] overflow-visible" : "overflow-hidden h-[700px]"
        }`}>
          <div className={`flex-1 pr-1 ${activeTab === "plans" ? "overflow-visible" : "overflow-y-auto no-scrollbar"}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={activeTab === "plans" ? "h-auto" : "min-h-full"}
              >
                
                {/* PROFILE SETTINGS */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Explorer Identity</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure your public-facing explorer credentials and identity card</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/5 pb-6">
                      
                      {/* Radial Profile Completion */}
                      <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                        {/* Glow effect */}
                        <div className="absolute inset-0 rounded-full bg-brand-purple/5 filter blur-lg animate-pulse" />
                        
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                          <circle cx="48" cy="48" r="42" stroke="#8b5cf6" strokeWidth="4" fill="transparent" strokeDasharray="264" strokeDashoffset="39.6" strokeLinecap="round" />
                        </svg>
                        
                        <div className="absolute inset-2 bg-zinc-950 rounded-full border border-white/10 flex items-center justify-center text-3xl select-none">
                          🏔️
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-between flex-wrap gap-2 justify-center md:justify-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">Rishiraj</h4>
                            <span className="text-[9px] text-brand-purple font-mono uppercase font-black">Level 12 Explorer</span>
                          </div>
                          <button onClick={() => alert("Avatar triggers in full client integration.")} className="px-3 py-1.5 bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/20 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                            Upload Avatar
                          </button>
                        </div>
                        <p className="text-[9px] leading-relaxed text-zinc-400 font-bold uppercase tracking-wide">
                          Your profile card is 85% complete. Add your travel website link to reach 100%.
                        </p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Display Name</label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Username Handle</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Adventure Bio</label>
                        <textarea
                          rows={3}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-semibold resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Default Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Travel Portfolio Website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                    </div>

                    {/* DNA Badges */}
                    <div className="space-y-2">
                      <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">DNA Alignment Badges</span>
                      <div className="flex flex-wrap gap-2">
                        {ADVENTURE_DNA_DNA_BADGES.map(badge => (
                          <div key={badge.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-extrabold ${badge.color}`}>
                            <span>{badge.name}</span>
                            <span className="h-1 w-1 rounded-full bg-white/50" />
                            <span>{badge.value}% match</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACCOUNT SETTINGS */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Account Control</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Manage email coordinates, subscription states, and login identifiers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Identifiers</h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[8px] uppercase font-black text-zinc-500 tracking-wider block mb-1">Primary Email</span>
                            <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-white/5 rounded-xl text-xs font-bold">
                              <span>rishi005.dev@gmail.com</span>
                              <span className="text-[8.5px] font-black uppercase text-brand-emerald">Verified</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-black text-zinc-500 tracking-wider block mb-1">Phone Coordinate</span>
                            <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-white/5 rounded-xl text-xs font-bold text-zinc-400">
                              <span>+91 98765 43210</span>
                              <button onClick={() => alert("Verification codes simulate in live server.")} className="text-[8.5px] font-black uppercase text-brand-cyan hover:underline cursor-pointer">Modify</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Wandercall Tier</h4>
                        <div className="bg-gradient-to-r from-brand-indigo/15 to-brand-purple/15 border border-brand-purple/20 p-4 rounded-2xl relative overflow-hidden">
                          <div className="absolute -top-3 -right-3 h-10 w-10 bg-brand-purple rounded-full filter blur-xl opacity-30" />
                          <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" />
                            Premium Explorer Cohort
                          </h5>
                          <p className="text-[9px] text-zinc-400 font-semibold leading-relaxed mt-1">
                            Fully unlocked access to all vector matching algorithms, regional daily quests, and private voice lobbies.
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 font-bold">
                            <span>Next bill: July 15, 2026</span>
                            <span>$12 / Month</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="bg-zinc-950/10 border border-white/5 p-4 rounded-2xl space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Credentials</h4>
                      <div className="flex flex-wrap gap-4 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider mt-2">
                        <div>Account ID: <span className="text-white">usr_005rishi38d</span></div>
                        <div className="hidden sm:block">•</div>
                        <div>Passport Issued: <span className="text-white">June 10, 2024</span></div>
                        <div className="hidden sm:block">•</div>
                        <div>Node Cluster: <span className="text-white">IN-BLR-01</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECURITY CENTER */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Security Hub</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">Secure your travel credentials, active logins, and security shields</p>
                      </div>
                      <div className="flex items-center gap-2 bg-brand-emerald/10 border border-brand-emerald/20 px-3 py-1 rounded-full text-[10px] font-black text-brand-emerald uppercase tracking-wider">
                        <Shield className="h-3.5 w-3.5 fill-brand-emerald/20" /> Excellent Shield
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Authenticator Controls</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-white/5 rounded-2xl">
                            <div>
                              <h5 className="text-xs font-bold text-white">Password Credentials</h5>
                              <p className="text-[8.5px] text-zinc-500 mt-0.5">Last updated 3 months ago</p>
                            </div>
                            <button onClick={() => alert("Change password flow triggers in security modules.")} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                              Change
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-white/5 rounded-2xl">
                            <div>
                              <h5 className="text-xs font-bold text-white">Two-Factor Auth (2FA)</h5>
                              <p className="text-[8.5px] text-zinc-500 mt-0.5">Protects your account with standard SMS/TOTP</p>
                            </div>
                            <button 
                              onClick={() => {
                                setIs2faEnabled(!is2faEnabled);
                                alert(`2FA has been ${!is2faEnabled ? "Enabled" : "Disabled"}.`);
                              }}
                              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border ${
                                is2faEnabled ? "bg-brand-cyan/15 hover:bg-brand-cyan/20 border-brand-cyan/20 text-brand-cyan" : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400"
                              }`}
                            >
                              {is2faEnabled ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Security Score Matrix</h4>
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            <span>Score Metrics</span>
                            <span className="text-brand-emerald">92%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-emerald rounded-full w-[92%]" />
                          </div>
                          <p className="text-[8.5px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wider mt-1">
                            Your recovery node is aligned. Enable hardware keys to reach 100% full shield status.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Active Sessions */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Active Client Lobbies ({sessions.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.map(sess => (
                          <div key={sess.id} className="bg-zinc-950/20 border border-white/5 p-3 rounded-2xl flex flex-col justify-between gap-3 text-left">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h5 className="text-[11px] font-extrabold text-white truncate">{sess.device}</h5>
                                {sess.isCurrent && (
                                  <span className="text-[7.5px] font-black uppercase tracking-wide bg-brand-cyan/20 text-brand-cyan px-1.5 py-0.2 rounded border border-brand-cyan/20">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-zinc-500 mt-1 font-bold">{sess.browser} • {sess.country}</p>
                              <span className="text-[8px] font-mono text-zinc-650 block mt-0.5">{sess.lastActive}</span>
                            </div>
                            {!sess.isCurrent && (
                              <button 
                                onClick={() => handleSignOutSession(sess.id)}
                                className="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                              >
                                Revoke Session
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PRIVACY CONTROL CENTER */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Privacy Matrix</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure visibility criteria, memory grids, and maps coordinate nodes</p>
                    </div>

                    <p className="text-[10px] leading-relaxed text-zinc-500 font-bold uppercase tracking-wider">
                      Specify which explorer categories can see your coordinates, experiences, and logs. Changes propagate instantly to search filters.
                    </p>

                    {/* Privacy Matrix Grid */}
                    <div className="bg-zinc-950/20 border border-white/5 rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-12 bg-white/[0.01] border-b border-white/5 p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                        <div className="col-span-5 text-left">Visibility Node</div>
                        <div className="col-span-7 grid grid-cols-4 gap-2 text-center">
                          <span>Public</span>
                          <span>Friends</span>
                          <span>Private</span>
                          <span>Custom</span>
                        </div>
                      </div>

                      <div className="divide-y divide-white/5">
                        {(Object.keys(privacyMatrix) as Array<keyof typeof privacyMatrix>).map(key => {
                          const val = privacyMatrix[key];
                          const label = key.charAt(0).toUpperCase() + key.slice(1) + " Visibility";
                          
                          return (
                            <div key={key} className="grid grid-cols-12 p-3 text-xs items-center">
                              <div className="col-span-5 text-left">
                                <span className="font-extrabold text-zinc-200 block text-[11px]">{label}</span>
                                <span className="text-[8.5px] text-zinc-500 font-mono">Controls details shown on page lists</span>
                              </div>
                              <div className="col-span-7 grid grid-cols-4 gap-2 justify-items-center">
                                {(["public", "friends", "private", "custom"] as const).map(option => (
                                  <button
                                    key={option}
                                    onClick={() => setPrivacyMatrix(prev => ({ ...prev, [key]: option }))}
                                    className={`h-4 w-4 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                      val === option ? "border-brand-cyan bg-brand-cyan/20" : "border-white/10 hover:border-white/20"
                                    }`}
                                  >
                                    {val === option && <div className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATION CONTROL CENTER */}
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Notification Desk</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Mute or sync alerts, messaging channels, and daily explorer prompts</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left toggles */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Channels</h4>
                        <div className="space-y-2">
                          {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => {
                            const val = notifications[key];
                            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            return (
                              <div 
                                key={key} 
                                className="flex items-center justify-between p-2.5 bg-zinc-950/15 border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.01] transition-all"
                                onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                              >
                                <span className="text-xs font-bold text-zinc-300">{label} Alerts</span>
                                <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-205 flex items-center ${
                                  val ? "bg-brand-cyan" : "bg-zinc-800"
                                }`}>
                                  <div className={`bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-205 ${
                                    val ? "translate-x-3.5" : "translate-x-0"
                                  }`} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Previewer */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Alert Simulator Sandbox</h4>
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-4">
                          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Select notification template</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(["bookings", "campfires", "friends", "quests"] as const).map(type => (
                              <button
                                key={type}
                                onClick={() => setPreviewNotificationType(type)}
                                className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                  previewNotificationType === type ? "bg-brand-cyan text-zinc-950" : "bg-white/5 hover:bg-white/10 text-zinc-400"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>

                          <div className="glass-panel border-brand-cyan/20 p-3.5 rounded-2xl flex items-start gap-3 shadow-lg shadow-brand-cyan/5">
                            <div className="h-8 w-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0 animate-bounce">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div className="text-left min-w-0">
                              {previewNotificationType === "bookings" && (
                                <>
                                  <h5 className="text-[11px] font-extrabold text-white">Booking Coordinates Confirmed!</h5>
                                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">Your scuba ticket for Netrani is locked. Code: <span className="font-mono text-white">#NET-83D</span></p>
                                </>
                              )}
                              {previewNotificationType === "campfires" && (
                                <>
                                  <h5 className="text-[11px] font-extrabold text-white">Live Campfire: Himalayan Hiking</h5>
                                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">Sara K. is speaking about trail preparations in the Western Ghats room.</p>
                                </>
                              )}
                              {previewNotificationType === "friends" && (
                                <>
                                  <h5 className="text-[11px] font-extrabold text-white">Coordinate Request Sent</h5>
                                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">Aditya R. requests link alignment to unlock your shared memory logs.</p>
                                </>
                              )}
                              {previewNotificationType === "quests" && (
                                <>
                                  <h5 className="text-[11px] font-extrabold text-white">Daily Quests Recharged!</h5>
                                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-relaxed">Align your GPS tracker coordinates today to earn +200 Sparks bonus.</p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* PLAN MANAGEMENT */}
                {activeTab === "plans" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Plan Management</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">Optimize your explorer tier, review billing history, and manage payment configurations</p>
                      </div>
                      <div className="bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full text-[10px] font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="h-3.5 w-3.5" /> Premium Explorer Active
                      </div>
                    </div>

                    {/* Cycle Selector & Add-on Calculator */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {/* Left: Billing Cycle Switcher & Features */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Billing Cycle</h4>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-white/5 rounded-2xl">
                          <div>
                            <span className="text-xs font-bold text-white block">Billing Interval</span>
                            <span className="text-[8.5px] text-brand-cyan font-mono font-bold uppercase tracking-wider mt-0.5 block">Save 20% on Annual Tiers</span>
                          </div>
                          
                          {/* Toggle */}
                          <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
                            <button
                              onClick={() => {
                                setBillingCycle("monthly");
                                triggerToast("Switched to monthly billing view.");
                              }}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                billingCycle === "monthly" ? "bg-white/5 text-white" : "text-zinc-500 hover:text-zinc-350"
                              }`}
                            >
                              Monthly
                            </button>
                            <button
                              onClick={() => {
                                setBillingCycle("annual");
                                triggerToast("Switched to annual billing view (20% discount applied!).");
                              }}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                                billingCycle === "annual" ? "bg-brand-cyan/20 border-brand-cyan/20 border text-brand-cyan" : "text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              Annual
                            </button>
                          </div>
                        </div>

                        {/* Smart Custom Add-ons Configurator */}
                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl space-y-3">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Smart Custom Add-ons</h5>
                          <p className="text-[8.5px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider">
                            Scale your resources dynamically. Add-ons automatically recalculate overall pricing indicators.
                          </p>
                          
                          <div className="space-y-2">
                            {/* Toggle 1: Vector Storage */}
                            <label className="flex items-center justify-between p-2.5 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 rounded-xl cursor-pointer transition-all select-none">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={addOns.storage}
                                  onChange={(e) => {
                                    setAddOns(prev => ({ ...prev, storage: e.target.checked }));
                                    triggerToast(e.target.checked ? "Added Vector Storage (+5GB)" : "Removed Vector Storage");
                                  }}
                                  className="accent-brand-cyan h-3.5 w-3.5"
                                />
                                <div className="text-left">
                                  <span className="text-xs font-bold text-zinc-200 block">Vector Storage Node (+5GB)</span>
                                  <span className="text-[8.5px] text-zinc-500 font-mono block">Store maps, audio logs, and media</span>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold text-brand-cyan">+$2/mo</span>
                            </label>

                            {/* Toggle 2: Priority AI Companion Matching */}
                            <label className="flex items-center justify-between p-2.5 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 rounded-xl cursor-pointer transition-all select-none">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={addOns.priority}
                                  onChange={(e) => {
                                    setAddOns(prev => ({ ...prev, priority: e.target.checked }));
                                    triggerToast(e.target.checked ? "Added Priority AI Companion Matching" : "Removed Priority Matching");
                                  }}
                                  className="accent-brand-cyan h-3.5 w-3.5"
                                />
                                <div className="text-left">
                                  <span className="text-xs font-bold text-zinc-200 block">Priority AI Companion Matching</span>
                                  <span className="text-[8.5px] text-zinc-500 font-mono block">Zero queue matching latency</span>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold text-brand-cyan">+$3/mo</span>
                            </label>

                            {/* Toggle 3: Exclusive Badge */}
                            <label className="flex items-center justify-between p-2.5 bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 rounded-xl cursor-pointer transition-all select-none">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={addOns.badge}
                                  onChange={(e) => {
                                    setAddOns(prev => ({ ...prev, badge: e.target.checked }));
                                    triggerToast(e.target.checked ? "Enabled Gold Passport Badge" : "Disabled Gold Passport Badge");
                                  }}
                                  className="accent-brand-cyan h-3.5 w-3.5"
                                />
                                <div className="text-left">
                                  <span className="text-xs font-bold text-zinc-200 block">Exclusive Gold Passport Badge</span>
                                  <span className="text-[8.5px] text-zinc-500 font-mono block">Glow decoration on identity card</span>
                                </div>
                              </div>
                              <span className="text-[9.5px] font-bold text-brand-cyan">+$1/mo</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment Card Display & Visual Updates */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Payment Configuration</h4>
                        
                        {/* Interactive Visual Credit Card */}
                        <div className="relative h-44 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl group">
                          {/* Decorative overlay glow */}
                          <div className="absolute -top-12 -right-12 h-36 w-36 bg-brand-cyan rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                          <div className="absolute -bottom-12 -left-12 h-36 w-36 bg-brand-purple rounded-full filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                          
                          {/* Chip & Logo */}
                          <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="text-[9px] uppercase font-black tracking-widest text-brand-cyan">Wandercall Node Passport</span>
                              <span className="text-[7.5px] text-zinc-500 font-mono">Secured Payment Access</span>
                            </div>
                            <div className="h-6 w-9 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-[8px] tracking-wide text-zinc-400">
                              VISA
                            </div>
                          </div>

                          {/* Card Number */}
                          <div className="text-left text-lg font-mono font-bold tracking-widest text-zinc-100 py-1.5 z-10 shrink-0">
                            {paymentCard.number}
                          </div>

                          {/* Cardholder Name & Expiry */}
                          <div className="flex justify-between items-end z-10">
                            <div className="text-left">
                              <span className="text-[6.5px] font-mono text-zinc-500 block uppercase">Cardholder Name</span>
                              <span className="text-[10px] font-extrabold uppercase text-white truncate max-w-[150px] block mt-0.5">{paymentCard.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[6.5px] font-mono text-zinc-500 block uppercase">Expires</span>
                              <span className="text-[10px] font-extrabold text-white block mt-0.5">{paymentCard.expiry}</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit payment method button / inline editor form */}
                        <div className="bg-zinc-950/20 border border-white/5 rounded-2xl overflow-hidden p-3.5">
                          {!cardEditing ? (
                            <button
                              onClick={() => setCardEditing(true)}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-brand-cyan" /> Edit Card Information
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block text-left">Update Payment Method</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-left">
                                <div className="col-span-2 space-y-1">
                                  <label className="text-[7.5px] uppercase font-bold text-zinc-500">Cardholder Name</label>
                                  <input
                                    type="text"
                                    value={cardEditForm.name}
                                    onChange={(e) => setCardEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-2 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-brand-cyan/20"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[7.5px] uppercase font-bold text-zinc-500">Card Number</label>
                                  <input
                                    type="text"
                                    value={cardEditForm.number}
                                    onChange={(e) => setCardEditForm(prev => ({ ...prev, number: e.target.value }))}
                                    className="w-full px-2 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-brand-cyan/20"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div className="space-y-1">
                                    <label className="text-[7.5px] uppercase font-bold text-zinc-500">Expiry</label>
                                    <input
                                      type="text"
                                      value={cardEditForm.expiry}
                                      placeholder="MM/YY"
                                      onChange={(e) => setCardEditForm(prev => ({ ...prev, expiry: e.target.value }))}
                                      className="w-full px-2 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-brand-cyan/20"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[7.5px] uppercase font-bold text-zinc-500">CVV</label>
                                    <input
                                      type="password"
                                      value={cardEditForm.cvv}
                                      maxLength={3}
                                      onChange={(e) => setCardEditForm(prev => ({ ...prev, cvv: e.target.value }))}
                                      className="w-full px-2 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-xs text-white outline-none focus:border-brand-cyan/20"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    // Mask card number visual
                                    const rawNum = cardEditForm.number.replace(/\s+/g, '');
                                    const last4 = rawNum.slice(-4) || "8843";
                                    setPaymentCard({
                                      name: cardEditForm.name.toUpperCase(),
                                      number: `•••• •••• •••• ${last4}`,
                                      expiry: cardEditForm.expiry,
                                      cvv: "•••",
                                    });
                                    setCardEditing(false);
                                    triggerToast("Payment method updated successfully.");
                                  }}
                                  className="flex-1 py-1.5 bg-brand-cyan text-zinc-950 text-[9px] font-black uppercase rounded-lg hover:bg-cyan-400 cursor-pointer"
                                >
                                  Save Card
                                </button>
                                <button
                                  onClick={() => setCardEditing(false)}
                                  className="px-3 py-1.5 bg-zinc-900 text-zinc-400 text-[9px] font-black uppercase rounded-lg hover:text-white cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Tiers Grid */}
                    <div className="space-y-3 text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Subscription Tiers</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
                        {/* 1. Standard Scout */}
                        {(() => {
                          let baseCost = 0;
                          let addOnCost = (addOns.storage ? 2 : 0) + (addOns.priority ? 3 : 0) + (addOns.badge ? 1 : 0);
                          let finalCost = baseCost + addOnCost;
                          const isActive = selectedTier === "standard";
                          return (
                            <div className={`relative bg-zinc-950/20 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                              isActive ? "border-zinc-700 shadow-xl bg-zinc-900/10" : "border-white/5 hover:border-white/10"
                            }`}>
                              <div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 font-mono">Tier 01</span>
                                <h5 className="text-sm font-extrabold text-zinc-300 mt-1">Standard Scout</h5>
                                <p className="text-[8.5px] text-zinc-500 leading-relaxed font-semibold mt-1.5">
                                  Standard features for casual explorers. AI pathfinding limited to base regions.
                                </p>
                                
                                <div className="mt-4 flex items-baseline gap-1 text-white">
                                  <span className="text-2xl font-black">${finalCost}</span>
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase">/ month</span>
                                </div>

                                <ul className="mt-4 space-y-2 text-[9px] text-zinc-400 font-medium">
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-zinc-500" /> Basic Search Discovery</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-zinc-500" /> 1 Active Campfire Room</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-zinc-500" /> 2 Companion Swaps/Day</li>
                                </ul>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedTier("standard");
                                  triggerToast("Downgraded to Standard Scout (Mock plan updated).");
                                }}
                                className={`w-full mt-6 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                                  isActive 
                                    ? "bg-zinc-800 border-zinc-700 text-white cursor-default" 
                                    : "bg-transparent border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
                                }`}
                                disabled={isActive}
                              >
                                {isActive ? "Active Plan" : "Downgrade Tier"}
                              </button>
                            </div>
                          );
                        })()}

                        {/* 2. Premium Explorer */}
                        {(() => {
                          const isMonthly = billingCycle === "monthly";
                          let baseCost = isMonthly ? 15 : 12;
                          let addOnCost = (addOns.storage ? 2 : 0) + (addOns.priority ? 3 : 0) + (addOns.badge ? 1 : 0);
                          let finalCost = baseCost + addOnCost;
                          const isActive = selectedTier === "premium";
                          return (
                            <div className={`relative bg-zinc-950/30 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                              isActive ? "border-brand-cyan/40 shadow-xl shadow-brand-cyan/5 bg-brand-cyan/[0.01]" : "border-white/5 hover:border-white/10"
                            }`}>
                              {/* Most Popular Tag */}
                              <div className="absolute -top-2.5 right-6 bg-brand-cyan text-zinc-950 text-[7.5px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md animate-pulse animate-duration-1000">
                                Most Popular
                              </div>
                              
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-cyan font-mono">Tier 02</span>
                                </div>
                                <h5 className="text-sm font-extrabold text-white mt-1 flex items-center gap-1.5">
                                  Premium Explorer <Sparkles className="h-3.5 w-3.5 text-brand-cyan animate-pulse" />
                                </h5>
                                <p className="text-[8.5px] text-zinc-400 leading-relaxed font-semibold mt-1.5">
                                  Optimized algorithms, full audio node lobbies, and custom maps coordinate outputs.
                                </p>
                                
                                <div className="mt-4 flex items-baseline gap-1 text-white">
                                  <span className="text-2xl font-black text-brand-cyan">${finalCost}</span>
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase">/ month</span>
                                </div>

                                <ul className="mt-4 space-y-2 text-[9px] text-zinc-300 font-medium">
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-cyan" /> Unlimited Companion Swaps</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-cyan" /> HD Campfire Audio Rooms</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-cyan" /> Real-time Vector AI Matching</li>
                                </ul>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedTier("premium");
                                  triggerToast("Tier updated to Premium Explorer (Mock plan updated).");
                                }}
                                className={`w-full mt-6 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                                  isActive 
                                    ? "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan cursor-default" 
                                    : "bg-transparent border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
                                }`}
                                disabled={isActive}
                              >
                                {isActive ? "Active Plan" : "Upgrade Tier"}
                              </button>
                            </div>
                          );
                        })()}

                        {/* 3. Legendary Nomad */}
                        {(() => {
                          const isMonthly = billingCycle === "monthly";
                          let baseCost = isMonthly ? 39 : 31;
                          let addOnCost = (addOns.storage ? 2 : 0) + (addOns.priority ? 3 : 0) + (addOns.badge ? 1 : 0);
                          let finalCost = baseCost + addOnCost;
                          const isActive = selectedTier === "legendary";
                          return (
                            <div className={`relative bg-zinc-950/20 border rounded-3xl p-5 flex flex-col justify-between transition-all ${
                              isActive ? "border-brand-purple/40 shadow-xl shadow-brand-purple/5 bg-zinc-900/10" : "border-white/5 hover:border-white/10"
                            }`}>
                              <div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-brand-purple font-mono">Tier 03</span>
                                <h5 className="text-sm font-extrabold text-white mt-1">Legendary Nomad</h5>
                                <p className="text-[8.5px] text-zinc-400 leading-relaxed font-semibold mt-1.5">
                                  Full-access VIP node package, priority server slots, and exclusive early test features.
                                </p>
                                
                                <div className="mt-4 flex items-baseline gap-1 text-white">
                                  <span className="text-2xl font-black text-brand-purple">${finalCost}</span>
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase">/ month</span>
                                </div>

                                <ul className="mt-4 space-y-2 text-[9px] text-zinc-300 font-medium">
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-purple" /> VIP Concierge Support</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-purple" /> Early Access Maps Coordinates</li>
                                  <li className="flex items-center gap-1.5"><Check className="h-3 w-3 text-brand-purple" /> Unlimited Storage & Audio Export</li>
                                </ul>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedTier("legendary");
                                  triggerToast("Tier upgraded to Legendary Nomad (Mock plan updated).");
                                }}
                                className={`w-full mt-6 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border ${
                                  isActive 
                                    ? "bg-brand-purple/15 border-brand-purple/20 text-brand-purple cursor-default" 
                                    : "bg-transparent border-white/15 text-zinc-400 hover:border-white/30 hover:text-white"
                                }`}
                                disabled={isActive}
                              >
                                {isActive ? "Active Plan" : "Upgrade Tier"}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Invoice Ledger Table */}
                    <div className="space-y-3 text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Billing Invoice Ledger</h4>
                      <div className="bg-zinc-950/20 border border-white/5 rounded-2xl overflow-hidden mt-3">
                        <div className="grid grid-cols-12 bg-white/[0.01] border-b border-white/5 p-3 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          <div className="col-span-3 text-left">Invoice ID</div>
                          <div className="col-span-3 text-left">Date</div>
                          <div className="col-span-2 text-left">Tier</div>
                          <div className="col-span-2 text-left">Amount</div>
                          <div className="col-span-2 text-right">Action</div>
                        </div>

                        <div className="divide-y divide-white/5 text-[11px] font-bold text-zinc-300">
                          {/* Invoice 1 */}
                          <div className="grid grid-cols-12 p-3 items-center">
                            <div className="col-span-3 font-mono text-zinc-400">INV-2026-004</div>
                            <div className="col-span-3 text-zinc-400">June 15, 2026</div>
                            <div className="col-span-2 text-zinc-300">Premium</div>
                            <div className="col-span-2 text-white">$12.00</div>
                            <div className="col-span-2 text-right">
                              <button 
                                onClick={() => {
                                  setDownloadingInvoiceId("INV-2026-004");
                                  setTimeout(() => {
                                    setDownloadingInvoiceId(null);
                                    triggerToast("Invoice INV-2026-004 downloaded successfully!");
                                  }, 1500);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 hover:border-brand-cyan/20 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                {downloadingInvoiceId === "INV-2026-004" ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Syncing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3" />
                                    <span>PDF</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Invoice 2 */}
                          <div className="grid grid-cols-12 p-3 items-center">
                            <div className="col-span-3 font-mono text-zinc-400">INV-2026-003</div>
                            <div className="col-span-3 text-zinc-400">May 15, 2026</div>
                            <div className="col-span-2 text-zinc-300">Premium</div>
                            <div className="col-span-2 text-white">$12.00</div>
                            <div className="col-span-2 text-right">
                              <button 
                                onClick={() => {
                                  setDownloadingInvoiceId("INV-2026-003");
                                  setTimeout(() => {
                                    setDownloadingInvoiceId(null);
                                    triggerToast("Invoice INV-2026-003 downloaded successfully!");
                                  }, 1500);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 hover:border-brand-cyan/20 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                {downloadingInvoiceId === "INV-2026-003" ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Syncing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3" />
                                    <span>PDF</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Invoice 3 */}
                          <div className="grid grid-cols-12 p-3 items-center">
                            <div className="col-span-3 font-mono text-zinc-400">INV-2026-002</div>
                            <div className="col-span-3 text-zinc-400">April 15, 2026</div>
                            <div className="col-span-2 text-zinc-300">Premium</div>
                            <div className="col-span-2 text-white">$12.00</div>
                            <div className="col-span-2 text-right">
                              <button 
                                onClick={() => {
                                  setDownloadingInvoiceId("INV-2026-002");
                                  setTimeout(() => {
                                    setDownloadingInvoiceId(null);
                                    triggerToast("Invoice INV-2026-002 downloaded successfully!");
                                  }, 1500);
                                }}
                                className="px-2.5 py-1.5 bg-zinc-900 border border-white/5 hover:border-brand-cyan/20 hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ml-auto cursor-pointer"
                              >
                                {downloadingInvoiceId === "INV-2026-002" ? (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Syncing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3 w-3" />
                                    <span>PDF</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ADVENTURE PREFERENCES */}
                {activeTab === "adventure" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Adventure Preferences</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure Travel Radius bounds, budgets, levels, and adventure tag logs</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Sliders</h4>
                        
                        <div className="space-y-4">
                          {/* Travel Radius */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                              <span>Max Travel Radius</span>
                              <span className="text-brand-cyan">{travelRadius} km</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="1000"
                              step="10"
                              value={travelRadius}
                              onChange={(e) => setTravelRadius(Number(e.target.value))}
                              className="w-full accent-brand-cyan bg-white/5 h-1.5 rounded-full outline-none"
                            />
                            <p className="text-[8.5px] text-zinc-500 font-bold uppercase tracking-wider">
                              Suggests experience guides inside this geographical distance node.
                            </p>
                          </div>

                          {/* Budget */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-zinc-400">
                              <span>Max Budget Cap</span>
                              <span className="text-brand-cyan">${budgetRange}</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="1500"
                              step="25"
                              value={budgetRange}
                              onChange={(e) => setBudgetRange(Number(e.target.value))}
                              className="w-full accent-brand-cyan bg-white/5 h-1.5 rounded-full outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Difficulty & Groups</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Intensity Mode</span>
                            <div className="relative">
                              <select 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(e.target.value as any)}
                                className="w-full px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs text-white outline-none font-bold"
                              >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                                <option value="Legendary">Legendary</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Cohort Size</span>
                            <select 
                              value={groupSize} 
                              onChange={(e) => setGroupSize(e.target.value as any)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs text-white outline-none font-bold"
                            >
                              <option value="Solo">Solo</option>
                              <option value="Small (2-5)">Small (2-5)</option>
                              <option value="Medium (6-10)">Medium (6-10)</option>
                              <option value="Large (10+)">Large (10+)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Tag selectors */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Interactive Adventure DNA Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {ADVENTURE_CATEGORIES_LIST.map(tag => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => toggleTagSelection(tag)}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                                isSelected ? "bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan" : "bg-transparent border-white/5 hover:border-white/10 text-zinc-400"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* CONNECTED ACCOUNTS */}
                {activeTab === "integrations" && (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Connected Networks</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Manage API authorization codes and linked third-party servers</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Object.keys(integrations) as Array<keyof typeof integrations>).map(key => {
                        const data = integrations[key];
                        const label = key.toUpperCase();
                        
                        return (
                          <div key={key} className="bg-zinc-950/20 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-black text-white">{label}</span>
                              <span className="text-[9px] text-zinc-500 block truncate mt-0.5">
                                {data.connected ? ("username" in data ? data.username : "email" in data ? data.email : "Authorized") : "Disconnected"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleIntegration(key)}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                                data.connected ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400" : "bg-brand-cyan/15 hover:bg-brand-cyan/20 border-brand-cyan/20 text-brand-cyan"
                              }`}
                            >
                              {data.connected ? "Disconnect" : "Connect"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}





              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 shrink-0 flex-wrap sm:flex-nowrap mt-4">
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
              Selected: {activeNavItem.label} • System synced
            </span>
            <button 
              onClick={() => alert("Configuration settings saved successfully!")}
              className="px-4 py-2 bg-brand-cyan text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-cyan-400 transition-all cursor-pointer shadow-md shadow-brand-cyan/10"
            >
              Save Configuration
            </button>
          </div>
        </main>

      </div>

      {/* MOBILE CATEGORIES BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Bottom Sheet content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-zinc-950 border-t border-white/10 rounded-t-3xl p-5 flex flex-col gap-4 z-10 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Settings Workspace</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-white/10 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {SETTINGS_SECTIONS.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl text-left border ${
                        isActive ? "bg-white/[0.03] border-brand-cyan/20 text-brand-cyan" : "bg-white/[0.01] border-white/5 text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4.5 w-4.5" />
                        <div>
                          <span className="text-[11px] font-extrabold block">{item.label}</span>
                          <span className="text-[8px] text-zinc-500 block">{item.sub}</span>
                        </div>
                      </div>
                      {"badge" in item && (
                        <span className="text-[7px] font-mono font-black uppercase bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    triggerToast("Initiating secure logout node sequence...");
                    setTimeout(() => {
                      window.location.href = "/login";
                    }, 800);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl text-left border bg-rose-500/5 border-rose-500/15 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-3">
                    <Power className="h-4.5 w-4.5 text-rose-500" />
                    <div>
                      <span className="text-[11px] font-extrabold block text-rose-450">Sign Out Node</span>
                      <span className="text-[8px] text-zinc-500 block font-bold uppercase tracking-wider">Disconnect current session</span>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 glass-panel border-brand-cyan/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 bg-zinc-950/90 backdrop-blur-xl"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-cyan/15 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {showToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Radial Gradients */}
      <svg className="h-0 w-0 absolute">
        <defs>
          <radialGradient id="system-radial-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

    </div>
  );
}
