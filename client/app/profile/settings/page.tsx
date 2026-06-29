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
  CreditCard,
} from "lucide-react";
import { useAppSelector } from "@/lib/store/store";
import { useUserProfileQuery, useUserSettingsQuery, useUserPlanQuery } from "@/hooks/api/useUserQueries";
import { useUpdateProfileMutation, useUpdateSettingsMutation, useUpdatePlanMutation } from "@/hooks/api/useUserMutations";
import { useActiveSessionsQuery, useRevokeSessionMutation } from "@/hooks/api/useAuthMutations";
import { UserSession } from "@/lib/services/auth.service";

// ==========================================
// Types & Data Structures
// ==========================================

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  country: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionDisplayItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  isCurrent?: boolean;
}

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
  { id: "integrations", label: "Connected Networks", sub: "API Links", icon: LinkIcon, badge: "4 Active" }
] as const;

type SettingsTab = typeof SETTINGS_SECTIONS[number]["id"];

export default function SettingsPage() {
  const authState = useAppSelector((state) => state.auth);
  const authUserId = authState.userId;
  const authEmail = authState.email || "rishi005.dev@gmail.com";

  const { data: userProfile } = useUserProfileQuery(authUserId);
  const { data: userSettings } = useUserSettingsQuery(authUserId);
  const { data: userPlan } = useUserPlanQuery(authUserId);
  const { data: activeSessionsList } = useActiveSessionsQuery(Boolean(authUserId));

  const updateProfileMutation = useUpdateProfileMutation(authUserId);
  const updateSettingsMutation = useUpdateSettingsMutation(authUserId);
  const updatePlanMutation = useUpdatePlanMutation(authUserId);
  const revokeSessionMutation = useRevokeSessionMutation();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic States
  const [displayName, setDisplayName] = useState("Rishiraj");
  const [username, setUsername] = useState("@rishi005");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);

  const displaySessions: SessionDisplayItem[] = useMemo(() => {
    if (activeSessionsList && activeSessionsList.length > 0) {
      return activeSessionsList.map((s: UserSession, idx: number) => ({
        id: s.id,
        deviceInfo: s.deviceInfo || 'Explorer Node',
        ipAddress: s.ipAddress || '127.0.0.1',
        isCurrent: idx === 0,
      }));
    }
    return sessions.map((s: ActiveSession) => ({
      id: s.id,
      deviceInfo: `${s.device} • ${s.browser}`,
      ipAddress: s.country,
      isCurrent: s.isCurrent,
    }));
  }, [activeSessionsList, sessions]);

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
    friends: "public",
    communities: "public",
    campfires: "friends",
  });

  // Adventure Preferences
  const [travelRadius, setTravelRadius] = useState(150); // in km
  const [budgetRange, setBudgetRange] = useState(250); // maximum budget slider
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | "Legendary">("Medium");
  const [selectedTags, setSelectedTags] = useState<string[]>(ADVENTURE_CATEGORIES_LIST);

  // Connected integrations state
  const [integrations, setIntegrations] = useState<Record<string, { connected: boolean; email?: string; username?: string }>>({
    google: { connected: false },
    discord: { connected: false },
    instagram: { connected: false },
    x: { connected: false }
  });

  // Notification preview simulation state
  const [previewNotificationType, setPreviewNotificationType] = useState<keyof typeof notifications>("bookings");

  // Plans Management States
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [selectedTier, setSelectedTier] = useState<string>("free");
  const [paymentCard, setPaymentCard] = useState<{ name: string; number: string; expiry: string; cvv: string } | null>(null);
  const [cardEditing, setCardEditing] = useState(false);
  const [cardEditForm, setCardEditForm] = useState({
    name: "RISHIRAJ",
    number: "4321 8765 0987 8843",
    expiry: "08/29",
    cvv: "123",
  });

  // Sync state when backend data loads
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName) setDisplayName(userProfile.displayName);
      if (userProfile.username) setUsername(`@${userProfile.username}`);
      if (userProfile.bio !== undefined) setBio(userProfile.bio || "");
      if (userProfile.locationFormatted !== undefined) setLocation(userProfile.locationFormatted || "");
      if (userProfile.profileUrl !== undefined) setWebsite(userProfile.profileUrl || `https://wandercall.io/${userProfile.username}`);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userSettings) {
      if (userSettings.is2faEnabled !== undefined) setIs2faEnabled(userSettings.is2faEnabled);
      if (userSettings.privacyMatrix) setPrivacyMatrix(userSettings.privacyMatrix as any);
      if (userSettings.notifications) setNotifications(userSettings.notifications as any);
      if (userSettings.travelRadius) setTravelRadius(userSettings.travelRadius);
      if (userSettings.budgetRange) setBudgetRange(userSettings.budgetRange);
      if (userSettings.difficulty) setDifficulty(userSettings.difficulty as any);
      if (userSettings.selectedTags) setSelectedTags(userSettings.selectedTags);
      if (userSettings.connectedNetworks) setIntegrations(userSettings.connectedNetworks as any);
    }
  }, [userSettings]);

  useEffect(() => {
    if (userPlan) {
      if (userPlan.billingCycle) setBillingCycle(userPlan.billingCycle as any);
      if (userPlan.selectedTier) setSelectedTier(userPlan.selectedTier);
      if (userPlan.paymentCard !== undefined) setPaymentCard(userPlan.paymentCard);
    }
  }, [userPlan]);

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
      const isStillVisible = filteredNavItems.some(i => i.id === activeTab);
      if (!isStillVisible) {
        setActiveTab(filteredNavItems[0].id);
      }
    }
  }, [searchQuery, filteredNavItems, activeTab]);

  const handleSignOutSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleIntegration = (key: string) => {
    setIntegrations(prev => {
      const item = prev[key] || { connected: false };
      return {
        ...prev,
        [key]: {
          ...item,
          connected: !item.connected,
        }
      };
    });
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
            <div className="h-8 w-8 rounded-full bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
              <Radio className="h-4.5 w-4.5" />
            </div>
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Integrations</span>
              <span className="text-xs font-bold text-zinc-200">4 Accounts Linked</span>
            </div>
          </div>

        </div>
      </div>

      {/* ==========================================
          2. MAIN SETTINGS WORKSPACE SPLIT PANELS
          ========================================== */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT DESKTOP NAVIGATION SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-zinc-950/20 border border-white/5 rounded-3xl p-3 space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-3 py-2 text-left">Navigation Workspace</span>
          
          {filteredNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  isActive 
                    ? "bg-white/[0.03] border-brand-cyan/20 text-brand-cyan shadow-lg shadow-brand-cyan/5" 
                    : "bg-transparent border-transparent text-zinc-400 hover:bg-white/[0.01] hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-brand-cyan" : "text-zinc-500"}`} />
                  <div>
                    <span className="text-xs font-extrabold block leading-tight">{item.label}</span>
                    <span className="text-[8.5px] text-zinc-500 block leading-tight mt-0.5">{item.sub}</span>
                  </div>
                </div>
              </button>
            );
          })}
          
          <div className="pt-2">
            <button
              onClick={() => {
                triggerToast("Initiating secure logout node sequence...");
                setTimeout(() => {
                  window.location.href = "/login";
                }, 800);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-2xl text-left border bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <Power className="h-4.5 w-4.5 text-rose-500" />
              <div>
                <span className="text-xs font-extrabold block text-rose-400 leading-tight">Sign Out Node</span>
                <span className="text-[8.5px] text-zinc-500 block leading-tight mt-0.5">Disconnect session</span>
              </div>
            </button>
          </div>
        </aside>

        {/* RIGHT DYNAMIC SETTINGS FORM PANEL */}
        <main className="flex-1 w-full bg-zinc-950/20 border border-white/5 rounded-3xl p-4 md:p-8 flex flex-col justify-between min-h-[550px]">
          <div>
            
            {/* Mobile Category Trigger Header */}
            <div className="lg:hidden flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <activeNavItem.icon className="h-5 w-5 text-brand-cyan" />
                <div className="text-left">
                  <h3 className="text-sm font-extrabold text-white">{activeNavItem.label}</h3>
                  <span className="text-[9px] text-zinc-500 block">{activeNavItem.sub}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5"
              >
                <span>Switch Tab</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content Tab Animations */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* EXPLORER IDENTITY */}
                {activeTab === "profile" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-purple">Explorer Identity</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure your public-facing explorer credentials and identity card</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center border-b border-white/5 pb-6">
                      <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                        <div className="absolute inset-0 rounded-full bg-brand-purple/5 filter blur-lg animate-pulse" />
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                          <circle cx="48" cy="48" r="42" stroke="#8b5cf6" strokeWidth="4" fill="transparent" strokeDasharray="264" strokeDashoffset="39.6" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-2 bg-zinc-950 rounded-full border border-white/10 flex items-center justify-center text-2xl font-black text-white select-none overflow-hidden">
                          {userProfile?.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            displayName ? displayName.trim().charAt(0).toUpperCase() : "E"
                          )}
                        </div>
                      </div>

                      <div className="flex-1 space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-between flex-wrap gap-2 justify-center md:justify-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">{displayName}</h4>
                            <span className="text-[9px] text-brand-purple font-mono uppercase font-black">Explorer Level 1</span>
                          </div>
                          <button onClick={() => triggerToast("Avatar upload feature ready.")} className="px-3 py-1.5 bg-brand-purple/10 hover:bg-brand-purple text-brand-purple hover:text-white border border-brand-purple/20 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                            Upload
                          </button>
                        </div>
                        <p className="text-[9px] leading-relaxed text-zinc-400 font-bold uppercase tracking-wide">
                          Your profile card is active. Customize bio and location coordinates.
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
                          placeholder="Tell explorers about your journey..."
                          onChange={(e) => setBio(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-semibold resize-none leading-relaxed"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Default Location</label>
                        <input
                          type="text"
                          value={location}
                          placeholder="e.g. Surat, India"
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-zinc-500 tracking-wider">Travel Portfolio URL</label>
                        <input
                          type="text"
                          value={website}
                          placeholder="https://wandercall.io/username"
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-brand-purple/30 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ACCOUNT SETTINGS */}
                {activeTab === "account" && (
                  <div className="space-y-6 text-left">
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
                              <span>{authEmail}</span>
                              <span className="text-[8.5px] font-black uppercase text-brand-emerald">Verified</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase font-black text-zinc-500 tracking-wider block mb-1">Phone Coordinate</span>
                            <div className="flex items-center justify-between p-2.5 bg-zinc-950/20 border border-white/5 rounded-xl text-xs font-bold text-zinc-400">
                              <span>Not set</span>
                              <button onClick={() => triggerToast("Phone update workflow active.")} className="text-[8.5px] font-black uppercase text-brand-cyan hover:underline cursor-pointer">Modify</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Wandercall Tier</h4>
                        <div className="bg-gradient-to-r from-brand-indigo/15 to-brand-purple/15 border border-brand-purple/20 p-4 rounded-2xl relative overflow-hidden">
                          <h5 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" />
                            Standard Explorer Tier
                          </h5>
                          <p className="text-[9px] text-zinc-400 font-semibold leading-relaxed mt-1">
                            Base tier active. Free explorer tools initialized across server clusters.
                          </p>
                          <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500 font-bold">
                            <span>Status: Inactive / Free</span>
                            <span>$0</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-zinc-950/10 border border-white/5 p-4 rounded-2xl space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Credentials</h4>
                      <div className="flex flex-wrap gap-4 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider mt-2">
                        <div>Account ID: <span className="text-white">{username.replace(/^@/, '')}</span></div>
                        <div className="hidden sm:block">•</div>
                        <div>Passport Issued: <span className="text-white">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'June 10, 2024'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PLAN MANAGEMENT */}
                {activeTab === "plans" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Plan Management</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">Optimize your explorer tier, review billing history, and manage payment configurations</p>
                      </div>
                      <div className="bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full text-[10px] font-black text-brand-purple uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" /> Free Tier Active
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Billing Cycle</h4>
                        <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-white/5 rounded-2xl">
                          <div>
                            <span className="text-xs font-bold text-white block">Billing Interval</span>
                            <span className="text-[8.5px] text-brand-cyan font-mono font-bold uppercase tracking-wider mt-0.5 block">Standard Monthly</span>
                          </div>
                          <div className="flex bg-zinc-900 border border-white/5 p-1 rounded-xl">
                            <button
                              onClick={() => { setBillingCycle("monthly"); triggerToast("Switched to monthly view."); }}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${billingCycle === "monthly" ? "bg-white/5 text-white" : "text-zinc-500"}`}
                            >
                              Monthly
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Payment Configuration</h4>
                        <div className="relative h-44 w-full bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-2xl group">
                          <div className="flex justify-between items-start z-10">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="text-[9px] uppercase font-black tracking-widest text-brand-cyan">Wandercall Passport</span>
                              <span className="text-[7.5px] text-zinc-500 font-mono">Secured Access</span>
                            </div>
                            <div className="h-6 w-9 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center font-bold text-[8px] tracking-wide text-zinc-400">
                              VISA
                            </div>
                          </div>
                          <div className="text-left text-lg font-mono font-bold tracking-widest text-zinc-100 py-1.5 z-10 shrink-0">
                            {paymentCard?.number || "•••• •••• •••• 8843"}
                          </div>
                          <div className="flex justify-between items-end z-10">
                            <div className="text-left">
                              <span className="text-[6.5px] font-mono text-zinc-500 block uppercase">Cardholder Name</span>
                              <span className="text-[10px] font-extrabold uppercase text-white truncate max-w-[150px] block mt-0.5">{paymentCard?.name || "EXPLORER"}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[6.5px] font-mono text-zinc-500 block uppercase">Expires</span>
                              <span className="text-[10px] font-extrabold text-white block mt-0.5">{paymentCard?.expiry || "08/29"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-left">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Subscription Tiers</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                        <div className={`relative bg-zinc-950/20 border rounded-3xl p-5 flex flex-col justify-between transition-all ${selectedTier === "free" ? "border-brand-cyan/40 bg-zinc-900/10" : "border-white/5"}`}>
                          <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 font-mono">Free Tier</span>
                            <h5 className="text-sm font-extrabold text-white mt-1">Explorer Base</h5>
                            <div className="mt-4 flex items-baseline gap-1 text-white">
                              <span className="text-2xl font-black">$0</span>
                            </div>
                          </div>
                          <button
                            onClick={() => { setSelectedTier("free"); triggerToast("Set tier to Free."); }}
                            className="w-full mt-6 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl border bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan"
                          >
                            {selectedTier === "free" ? "Active Plan" : "Select Free"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECURITY CENTER */}
                {activeTab === "security" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Security Hub</h3>
                        <p className="text-[10px] text-zinc-400 mt-1">Secure your travel credentials, active logins, and security shields</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Authenticator Controls</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-zinc-950/20 border border-white/5 rounded-2xl">
                            <div>
                              <h5 className="text-xs font-bold text-white">Two-Factor Auth (2FA)</h5>
                              <p className="text-[8.5px] text-zinc-500 mt-0.5">Protects account security</p>
                            </div>
                            <button 
                              onClick={() => {
                                setIs2faEnabled(!is2faEnabled);
                                triggerToast(`2FA set to ${!is2faEnabled ? "Enabled" : "Disabled"}.`);
                              }}
                              className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border ${
                                is2faEnabled ? "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan" : "bg-white/5 border-white/10 text-zinc-400"
                              }`}
                            >
                              {is2faEnabled ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Active Client Lobbies ({displaySessions.length})</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {displaySessions.map((sess: SessionDisplayItem, idx: number) => (
                          <div key={sess.id} className="bg-zinc-950/20 border border-white/5 p-3 rounded-2xl flex flex-col justify-between gap-3 text-left">
                            <div>
                              <h5 className="text-[11px] font-extrabold text-white truncate">{sess.deviceInfo}</h5>
                              <p className="text-[9px] text-zinc-500 mt-1 font-bold">IP: {sess.ipAddress}</p>
                            </div>
                            {!sess.isCurrent && (
                              <button 
                                onClick={() => {
                                  revokeSessionMutation.mutate(sess.id);
                                  triggerToast("Session revoke initiated.");
                                }}
                                className="w-full py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400 rounded-lg cursor-pointer transition-all"
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
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Privacy Matrix</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure visibility criteria and node settings</p>
                    </div>

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
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Notification Desk</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Manage explorer prompts and group alerts</p>
                    </div>

                    <div className="space-y-2">
                      {(Object.keys(notifications) as Array<keyof typeof notifications>).map(key => {
                        const val = notifications[key];
                        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        
                        return (
                          <div 
                            key={key} 
                            className="flex items-center justify-between p-2.5 bg-zinc-950/15 border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.01]"
                            onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                          >
                            <span className="text-xs font-bold text-zinc-300">{label} Alerts</span>
                            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-205 flex items-center ${val ? "bg-brand-cyan" : "bg-zinc-800"}`}>
                              <div className={`bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-205 ${val ? "translate-x-3.5" : "translate-x-0"}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ADVENTURE PREFERENCES */}
                {activeTab === "adventure" && (
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Adventure Preferences</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Configure Travel Radius bounds, budgets, levels, and adventure tags</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
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
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-black text-zinc-500 tracking-wider block">Intensity Mode</span>
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
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5 pb-1">Adventure Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {ADVENTURE_CATEGORIES_LIST.map(tag => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() => toggleTagSelection(tag)}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all cursor-pointer ${
                                isSelected ? "bg-brand-cyan/20 border-brand-cyan/40 text-brand-cyan" : "bg-transparent border-white/5 text-zinc-400"
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
                  <div className="space-y-6 text-left">
                    <div className="border-b border-white/5 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-brand-cyan">Connected Networks</h3>
                      <p className="text-[10px] text-zinc-400 mt-1">Manage API authorization links</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(integrations).map(key => {
                        const data = integrations[key];
                        const label = key.toUpperCase();
                        
                        return (
                          <div key={key} className="bg-zinc-950/20 border border-white/5 p-4 rounded-3xl flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-black text-white">{label}</span>
                              <span className="text-[9px] text-zinc-500 block truncate mt-0.5">
                                {data.connected ? "Authorized" : "Disconnected"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleToggleIntegration(key)}
                              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border cursor-pointer ${
                                data.connected ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-brand-cyan/15 border-brand-cyan/20 text-brand-cyan"
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
          
          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4 shrink-0 flex-wrap sm:flex-nowrap mt-6">
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
              Selected: {activeNavItem.label} • System synced
            </span>
            <button 
              onClick={() => {
                if (authUserId) {
                  updateProfileMutation.mutate({
                    displayName,
                    bio,
                    locationFormatted: location,
                    profileUrl: website,
                  });
                  updateSettingsMutation.mutate({
                    is2faEnabled,
                    privacyMatrix,
                    notifications,
                    travelRadius,
                    budgetRange,
                    difficulty,
                    selectedTags,
                    connectedNetworks: integrations,
                  });
                  updatePlanMutation.mutate({
                    selectedTier,
                    billingCycle,
                    paymentCard,
                  });
                }
                triggerToast("Configuration settings synced securely!");
              }}
              className="px-4 py-2 bg-brand-cyan text-zinc-950 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-cyan-400 transition-all cursor-pointer shadow-md shadow-brand-cyan/10 flex items-center gap-1.5"
            >
              {(updateProfileMutation.isPending || updateSettingsMutation.isPending || updatePlanMutation.isPending) && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Save Configuration
            </button>
          </div>
        </main>

      </div>

      {/* MOBILE CATEGORIES BOTTOM SHEET MODAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center select-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
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
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
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
    </div>
  );
}
