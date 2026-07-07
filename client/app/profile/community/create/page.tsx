"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Globe,
  Lock,
  Plus,
  Sparkles,
  Check,
  CheckCircle2,
  MapPin,
  Volume2,
  Search
} from "lucide-react";
import LocationSearch from "../../../../components/location/LocationSearch";
import { useAppSelector } from "@/lib/store/store";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";
import { useCreateCommunity, useCategories } from "@/hooks/useCommunity";
import { useFriends } from "@/hooks/api/useFriends";
import { httpClient } from "@/lib/api/httpClient";

// Types
interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  sharedDNA: "Explorer" | "Creative" | "Socializer";
  compatibility: number;
}

interface LocationData {
  formatted_address: string;
  country: string;
  state?: string;
  district?: string;
  region?: string;
  city: string;
  latitude: number;
  longitude: number;
}

const CATEGORY_STYLES: Record<string, any> = {
  "Adventure": { icon: "🏔️", color: "from-cyan-500 to-blue-500", glow: "rgba(6, 182, 212, 0.4)", stroke: "stroke-brand-cyan", border: "border-brand-cyan/30", text: "text-brand-cyan" },
  "Food & Eats": { icon: "🍛", color: "from-purple-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.4)", stroke: "stroke-brand-purple", border: "border-brand-purple/30", text: "text-brand-purple" },
  "Photography": { icon: "📸", color: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.4)", stroke: "stroke-brand-emerald", border: "border-brand-emerald/30", text: "text-brand-emerald" },
  "Storytelling": { icon: "🖋️", color: "from-amber-500 to-orange-500", glow: "rgba(245, 158, 11, 0.4)", stroke: "stroke-brand-amber", border: "border-brand-amber/30", text: "text-brand-amber" },
  "Travel & Nomads": { icon: "✈️", color: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.4)", stroke: "stroke-rose-500", border: "border-rose-500/30", text: "text-rose-500" },
  "Fitness & Runs": { icon: "🚴", color: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.4)", stroke: "stroke-blue-500", border: "border-blue-500/30", text: "text-blue-500" },
  "Learning & Craft": { icon: "🎒", color: "from-orange-500 to-red-500", glow: "rgba(249, 115, 22, 0.4)", stroke: "stroke-orange-500", border: "border-orange-500/30", text: "text-orange-500" },
  "Nightlife": { icon: "🌌", color: "from-pink-500 to-purple-500", glow: "rgba(236, 72, 153, 0.4)", stroke: "stroke-pink-500", border: "border-pink-500/30", text: "text-pink-500" }
};

const TEMPLATE_WALLPAPERS = [
  { name: "Mountain Ridge", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" },
  { name: "Deep Reef", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop" },
  { name: "Monsoon Valley", url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop" },
  { name: "Forest Camp", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop" },
  { name: "Starlit Sky", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop" },
  { name: "Highway Ride", url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop" }
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const authState = useAppSelector((state) => state.auth);
  const { data: currentUser } = useCurrentUserQuery(authState.isAuthenticated);
  const displayName = currentUser?.displayName || authState.name || "Explorer";
  const avatarUrl = currentUser?.avatarUrl;
  const initial = displayName.trim().charAt(0).toUpperCase() || "E";
  const createCommunity = useCreateCommunity();
  // Customize States
  const [invitedFriends, setInvitedFriends] = useState<Friend[]>([]);
  const [wallpaper, setWallpaper] = useState(TEMPLATE_WALLPAPERS[0].url);
  const [privacy, setPrivacy] = useState<"Public" | "Private">("Public");
  const [isDragOver, setIsDragOver] = useState(false);
  const [friendSearchInput, setFriendSearchInput] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [passcode, setPasscode] = useState(["", "", "", "", "", ""]);

  const { data: categoriesData } = useCategories();
  const { data: friendsData } = useFriends(20, friendSearchQuery);

  const mappedCategories = useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      ...CATEGORY_STYLES[cat.name] || CATEGORY_STYLES["Adventure"]
    }));
  }, [categoriesData]);

  const mappedFriends = useMemo(() => {
    if (!friendsData?.pages) return [];
    return friendsData.pages.flatMap((page: any) => page.items || []).map((f: any) => ({
      id: f.userId,
      name: f.displayName,
      username: f.username,
      avatar: f.avatarUrl || "👤",
      sharedDNA: "Explorer" as const,
      compatibility: f.compatibility || 85
    }));
  }, [friendsData]);

  // Wizard state
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Structured Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (mappedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(mappedCategories[0].id);
    }
  }, [mappedCategories, selectedCategory]);

  const pin1Ref = useRef<HTMLInputElement>(null);
  const pin2Ref = useRef<HTMLInputElement>(null);
  const pin3Ref = useRef<HTMLInputElement>(null);
  const pin4Ref = useRef<HTMLInputElement>(null);
  const pin5Ref = useRef<HTMLInputElement>(null);
  const pin6Ref = useRef<HTMLInputElement>(null);
  const passcodeRefs = useMemo(() => [pin1Ref, pin2Ref, pin3Ref, pin4Ref, pin5Ref, pin6Ref], [
    pin1Ref, pin2Ref, pin3Ref, pin4Ref, pin5Ref, pin6Ref
  ]);

  // UI state
  const [validationError, setValidationError] = useState<string | null>(null);

  const activeCategoryMeta = useMemo(() => {
    return mappedCategories.find((c: any) => c.id === selectedCategory) || mappedCategories[0];
  }, [selectedCategory, mappedCategories]);

  // Filter friends based on search query
  const filteredFriends = useMemo(() => {
    return mappedFriends; // The backend already handles the semantic search based on friendSearchQuery
  }, [mappedFriends]);

  const handleSearchFriends = () => {
    setFriendSearchQuery(friendSearchInput);
  };

  const handleFriendToggle = (friend: Friend) => {
    if (invitedFriends.some(f => f.id === friend.id)) {
      setInvitedFriends(prev => prev.filter(f => f.id !== friend.id));
    } else {
      setInvitedFriends(prev => [...prev, friend]);
    }
  };

  // Passcode Helpers
  const handlePasscodeChange = (index: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const newPasscode = [...passcode];
    newPasscode[index] = val;
    setPasscode(newPasscode);
    if (val && index < 5) {
      passcodeRefs[index + 1].current?.focus();
    }
  };

  const handlePasscodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!passcode[index] && index > 0) {
        const newPasscode = [...passcode];
        newPasscode[index - 1] = "";
        setPasscode(newPasscode);
        passcodeRefs[index - 1].current?.focus();
      } else {
        const newPasscode = [...passcode];
        newPasscode[index] = "";
        setPasscode(newPasscode);
      }
    }
  };

  const handlePasscodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(pastedData)) return;
    const digits = pastedData.split("");
    setPasscode(digits);
    passcodeRefs[5].current?.focus();
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setValidationError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setWallpaper(e.target.result as string);
        setValidationError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Submit Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setValidationError("Please enter a community title.");
      return;
    }

    if (!description.trim()) {
      setValidationError("Please provide a short description.");
      return;
    }

    if (!selectedLocation) {
      setValidationError("Please select a valid location from the search results.");
      return;
    }

    if (privacy === "Private" && passcode.some(digit => digit === "")) {
      setValidationError("Please enter a valid 6-digit passcode for your private community.");
      return;
    }

    if (!selectedCategory) {
      setValidationError("Please select a category.");
      return;
    }

    try {
      let finalWallpaperUrl = wallpaper;

      // If it's a data URL, we need to upload it via StorageService first
      if (wallpaper.startsWith("data:image")) {
        // Convert data URL to Blob
        const response = await fetch(wallpaper);
        const blob = await response.blob();
        const file = new File([blob], "community-wallpaper.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await httpClient.post("/storage/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        finalWallpaperUrl = uploadRes.data.url;
      }

      // Build JoinedCommunity object to save
      const payload = {
        name: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        primaryCategoryId: selectedCategory, // Use the dynamically fetched UUID
        visibility: privacy.toUpperCase(),
        avatar: finalWallpaperUrl,
        cover: finalWallpaperUrl,
        invitedUserIds: invitedFriends.map(f => f.id),
        coordinateName: selectedLocation ? (selectedLocation.city || selectedLocation.formatted_address.split(',')[0]) : title.trim(),
        latitude: selectedLocation?.latitude || 0,
        longitude: selectedLocation?.longitude || 0,
        city: selectedLocation?.city || "",
        region: selectedLocation?.region || "",
        country: selectedLocation?.country || "",
      };

      createCommunity.mutate(payload, {
        onSuccess: (data: any) => {
          if (data && data.id) {
            router.replace(`/community/${data.id}`);
          } else {
            router.push("/profile/community");
          }
        },
        onError: (err: any) => {
          setValidationError(err?.response?.data?.message || "Failed to create community");
        }
      });
    } catch (error: any) {
      setValidationError("Failed to upload image. Please try again.");
    }
  };

  const isFormValid = 
    title.trim() !== "" && 
    description.trim() !== "" && 
    selectedLocation !== null &&
    (privacy === "Public" || passcode.every(digit => /^\d$/.test(digit)));

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-6 text-white relative">
      
      <AnimatePresence mode="wait">
        {step === 1 ? (
          /* STEP 1: INITIAL CORE DETAILS */
          <motion.div
            key="details-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-[760px] mx-auto w-full bg-zinc-950/20 border border-white/5 p-5 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-[250px] w-[250px] rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />

            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-3 py-1 rounded-full">
                Step 1 of 2 • Core Details
              </span>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-white mt-3">
                <Sparkles className="h-6 w-6 text-brand-purple animate-pulse" /> Establish New Community
              </h1>
              <p className="text-xs text-zinc-400 font-medium mt-1 leading-relaxed">
                Provide the details of your community coordinate cluster. Explain what coordinates you explore and map together.
              </p>
            </div>

            {/* Validation Message */}
            {validationError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl p-3.5 text-xs font-semibold">
                ⚠️ {validationError}
              </div>
            )}

            {/* Top row: Title and Location Search side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full items-start">
              {/* 1. Title/Name input */}
              <div className="flex flex-col gap-2">
                <label htmlFor="comm-title" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Community Title *
                </label>
                <input
                  id="comm-title"
                  type="text"
                  maxLength={32}
                  placeholder="e.g., Cliff Trekkers, Bangalore Coffee Guild..."
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full h-12 px-4 rounded-2xl bg-zinc-950/40 border border-white/10 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple focus:shadow-[0_0_12px_rgba(139,92,246,0.15)] outline-none text-sm text-white font-semibold transition-all placeholder-zinc-600 shadow-md"
                />
              </div>

              {/* 2. Geoapify Autocomplete Search Field */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Exploration Coordinates & Region *
                </label>
                <LocationSearch
                  selectedLocation={selectedLocation}
                  onSelect={(loc) => {
                    setSelectedLocation(loc);
                    if (validationError) setValidationError(null);
                  }}
                />
              </div>
            </div>

            {/* 3. Description input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="comm-desc" className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Description (Why this community exists) *
              </label>
              <textarea
                id="comm-desc"
                rows={3}
                maxLength={200}
                placeholder="e.g., Organizing weekly coordinate crawls, heritage breakfast reviews, and high-altitude hiking challenges..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                className="w-full p-4 rounded-2xl bg-zinc-950/40 border border-white/10 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple focus:shadow-[0_0_12px_rgba(139,92,246,0.15)] outline-none text-sm text-white font-semibold transition-all placeholder-zinc-600 resize-none leading-relaxed shadow-md"
              />
            </div>

            {/* 4. Focus Category (Ecosystem Cluster Mapping) */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Focus Category (Ecosystem Cluster Mapping)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {mappedCategories.map((c: any) => {
                  const isSelected = selectedCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer select-none ${
                        isSelected 
                          ? `bg-zinc-900 ${c.border}` 
                          : "bg-zinc-950/40 border-white/5 hover:border-white/15"
                      }`}
                      style={{
                        boxShadow: isSelected ? `0 0 12px ${c.glow.replace("0.4", "0.2")}` : "none"
                      }}
                    >
                      <span className="text-xl mb-1">{c.icon}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wide ${isSelected ? c.text : "text-zinc-500"}`}>
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="border-t border-white/5 pt-5 mt-2">
              <button
                type="button"
                disabled={!isFormValid}
                onClick={() => {
                  if (isFormValid) {
                    setStep(2);
                    setValidationError(null);
                  } else {
                    if (!title.trim() || !description.trim()) {
                      setValidationError("Please fill out all required fields marked with an asterisk (*).");
                    } else if (!selectedLocation) {
                      setValidationError("Please select a valid location from the search results.");
                    }
                  }
                }}
                className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isFormValid
                    ? "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 active:scale-[0.99] text-white shadow-lg hover:shadow-brand-purple/20"
                    : "bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed opacity-50"
                }`}
              >
                Next: Customize & Preview <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>
        ) : (
          /* STEP 2: CUSTOMIZE & PREVIEW (TWO COLUMN) */
          <motion.div
            key="preview-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-8 items-start w-full"
          >
            
            {/* LEFT COLUMN: VISUAL PREVIEW & SPECIMENS */}
            <div className="flex flex-col gap-6 xl:sticky xl:top-6 w-full">
              
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Real-Time Community Previews
                </h3>
                <span className="text-[9px] font-mono font-bold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                  Step 2 of 2
                </span>
              </div>

              {/* Card Preview */}
              <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
                <div className="aspect-[21/9] w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                  <img
                    src={wallpaper}
                    alt="Wallpaper Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-zinc-950/20" />
                  
                  {/* Category tag */}
                  <span className={`absolute top-3 left-3 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-zinc-950/80 border-white/10 ${activeCategoryMeta.text}`}>
                    {activeCategoryMeta.icon} {activeCategoryMeta.name}
                  </span>

                  {/* Privacy badge */}
                  <span className="absolute top-3 right-3 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-zinc-950/80 border-white/10 flex items-center gap-1">
                    {privacy === "Public" ? <Globe className="h-2.5 w-2.5 text-brand-cyan" /> : <Lock className="h-2.5 w-2.5 text-rose-500" />}
                    {privacy}
                  </span>
                </div>

                {/* Content info */}
                <div className="p-5 flex flex-col gap-3 text-left">
                  <div>
                    <h4 className="text-lg font-black uppercase tracking-wide truncate">
                      {title || "Tribe Name"}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-brand-amber" /> {selectedLocation?.formatted_address || "Location Locked"}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-300 font-semibold leading-relaxed line-clamp-2 min-h-[32px]">
                    {description || "Give your community a clear purpose."}
                  </p>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Invited Friends Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Members:</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple border border-zinc-950 text-[9px] font-black flex items-center justify-center select-none text-white shrink-0 overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                          ) : (
                            initial
                          )}
                        </div>
                        {invitedFriends.length + 1 <= 8 ? (
                          invitedFriends.map(f => (
                            <div
                              key={f.id}
                              className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-950 text-[9px] flex items-center justify-center select-none shadow-md shrink-0 overflow-hidden"
                              title={f.name}
                            >
                              {f.avatar.startsWith('http') || f.avatar.startsWith('data:') ? (
                                <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" />
                              ) : (
                                f.avatar
                              )}
                            </div>
                          ))
                        ) : (
                          <>
                            {invitedFriends.slice(0, 7).map(f => (
                              <div
                                key={f.id}
                                className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-950 text-[9px] flex items-center justify-center select-none shadow-md shrink-0 overflow-hidden"
                                title={f.name}
                              >
                                {f.avatar.startsWith('http') || f.avatar.startsWith('data:') ? (
                                  <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" />
                                ) : (
                                  f.avatar
                                )}
                              </div>
                            ))}
                            <div
                              className="h-5 px-1.5 rounded-full bg-zinc-900 border border-zinc-950 text-[8px] font-black flex items-center justify-center select-none text-zinc-400 shadow-md leading-none shrink-0"
                              title={`${invitedFriends.length + 1 - 8} more members`}
                            >
                              {invitedFriends.length + 1 - 8}+ more
                            </div>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {invitedFriends.length + 1} Explorers
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCK & GALAXY PREVIEW SPECIMENS */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Dock Item Specimen */}
                <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                    Dock Bubble
                  </span>
                  <div className="h-16 w-16 rounded-2xl bg-zinc-950 border border-brand-purple flex items-center justify-center shadow-lg relative overflow-hidden transition-all hover:scale-105 duration-300">
                    <img
                      src={wallpaper}
                      alt="Dock preview"
                      className="absolute inset-0 object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-center truncate max-w-full">
                    {title || "Tribe"}
                  </span>
                </div>

                {/* Galaxy Cluster Node Specimen */}
                <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-3 relative overflow-hidden">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                    Galaxy Node
                  </span>
                  
                  {/* Fake SVG Space Node */}
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <div
                      className="absolute h-14 w-14 rounded-full transition-all duration-300"
                      style={{
                        boxShadow: `0 0 16px ${activeCategoryMeta.glow}`,
                        backgroundColor: `${activeCategoryMeta.glow.replace("0.4", "0.1")}`
                      }}
                    />
                    <div
                      className={`h-11 w-11 rounded-full border-2 bg-zinc-900 overflow-hidden z-10 transition-transform duration-300 hover:scale-110`}
                      style={{ borderColor: activeCategoryMeta.glow.replace("0.4", "0.9") }}
                    >
                      <img src={wallpaper} className="w-full h-full object-cover" alt="Node Preview" />
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 text-center truncate max-w-full">
                    {(title || "Tribe").split(" ")[0]}
                  </span>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: CREATOR CONTROLS */}
            <div className="bg-zinc-950/20 border border-white/5 p-5 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6 text-left relative overflow-hidden">
              
              <div className="absolute top-0 right-0 h-[250px] w-[250px] rounded-full bg-brand-purple/5 blur-3xl pointer-events-none" />

              {/* Heading */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-cyan">
                  {(activeCategoryMeta?.name || "ADVENTURE").toUpperCase()} CLUSTER &bull; {selectedLocation?.city.toUpperCase() || "LOCATION"}
                </span>
                <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
                  Customize & Invite
                </h1>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Establish wallpapers and drag-and-drop themes. Search and select friends to pre-populate coordinates.
                </p>
              </div>

              <form onSubmit={handleCreate} className="flex flex-col gap-6 z-10">
                
                {/* Validation Message */}
                {validationError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl p-3.5 text-xs font-semibold">
                    ⚠️ {validationError}
                  </div>
                )}

                {/* 5. Wallpaper Image Selector */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Community Wallpaper (Aspect Ratio Fixed)
                  </span>

                  {/* Drag & Drop File Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:bg-white/[0.01] ${
                      isDragOver 
                        ? "border-brand-purple bg-brand-purple/5" 
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Camera className="h-6 w-6 text-zinc-500 animate-pulse" />
                    <div className="text-center">
                      <span className="text-xs font-bold text-white block">Drag & drop your wallpaper image</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">Supports JPG, PNG, WebP. Max 4MB.</span>
                    </div>
                  </div>

                  {/* Curated Templates */}
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">
                      Or select a premium template:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {TEMPLATE_WALLPAPERS.map(tw => {
                        const isSelected = wallpaper === tw.url;
                        return (
                          <button
                            key={tw.name}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setWallpaper(tw.url);
                              if (validationError) setValidationError(null);
                            }}
                            className={`relative aspect-[3/2] rounded-lg overflow-hidden border cursor-pointer ${
                              isSelected ? "border-brand-purple scale-102 shadow-lg" : "border-white/5 hover:border-white/10 hover:scale-101"
                            }`}
                          >
                            <img src={tw.url} alt={tw.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-brand-purple/20 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 6. Friends Selector */}
                <div className="flex flex-col gap-3 border-t border-white/5 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Invite Friends to Community
                      </span>
                      <p className="text-[9.5px] text-zinc-500 font-semibold mt-0.5">
                        Select friends from your active explorer circles.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg w-full sm:max-w-[250px]">
                      <Search className="h-3.5 w-3.5 text-zinc-500 ml-1" />
                      <input
                        type="text"
                        placeholder="Search friends..."
                        value={friendSearchInput}
                        onChange={(e) => setFriendSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSearchFriends();
                        }}
                        className="bg-transparent border-none outline-none text-[11px] text-white placeholder-zinc-500 w-full font-semibold px-1"
                      />
                      <button 
                        type="button" 
                        onClick={handleSearchFriends}
                        className="bg-brand-purple/20 text-brand-purple hover:bg-brand-purple/30 text-[10px] px-2 py-1 rounded font-bold transition-colors"
                      >
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Friends Box */}
                  <div 
                    data-lenis-prevent
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto no-scrollbar border border-white/5 rounded-xl p-3 bg-zinc-950/40"
                  >
                    {filteredFriends.length > 0 ? (
                      filteredFriends.map(friend => {
                        const isInvited = invitedFriends.some(f => f.id === friend.id);
                        return (
                          <button
                            key={friend.id}
                            type="button"
                            onClick={() => handleFriendToggle(friend)}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-left cursor-pointer transition-all select-none ${
                              isInvited 
                                ? "bg-brand-purple/10 border-brand-purple/35 text-white"
                                : "bg-zinc-950/60 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 text-xs">
                                {friend.avatar.startsWith('http') || friend.avatar.startsWith('data:') ? (
                                  <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
                                ) : (
                                  friend.avatar
                                )}
                              </div>
                              <div className="flex flex-col min-w-0 leading-tight">
                                <span className="text-[11px] font-bold text-white truncate">{friend.name}</span>
                                <span className="text-[8.5px] text-zinc-500 font-mono">@{friend.username}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[7.5px] font-mono font-bold text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded">
                                {friend.sharedDNA}
                              </span>
                              <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                isInvited ? "border-brand-purple bg-brand-purple" : "border-white/10"
                              }`}>
                                {isInvited && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-6 text-zinc-500 text-xs font-semibold">
                        No friends matched your search query.
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Settings Options Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                  
                  {/* Privacy Setting Card */}
                  <div className="bg-zinc-950/40 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex flex-col text-left leading-tight min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">
                        Coordinates Privacy
                      </span>
                      <span className="text-[9px] text-zinc-500 mt-1 font-semibold leading-relaxed">
                        Public groups appear in the Galaxy clusters.
                      </span>
                    </div>
                    <div className="flex shrink-0 p-0.5 bg-zinc-950 border border-white/15 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPrivacy("Public")}
                        className={`px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-md cursor-pointer ${
                          privacy === "Public" ? "bg-brand-cyan text-zinc-950 font-black" : "text-zinc-500"
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivacy("Private")}
                        className={`px-2.5 py-1 text-[8.5px] font-black uppercase tracking-wider rounded-md cursor-pointer ${
                          privacy === "Private" ? "bg-rose-500 text-white font-black" : "text-zinc-500"
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>

                  {/* Passcode Setting Card (Conditional on Privacy) */}
                  {privacy === "Private" ? (
                    <div className="bg-zinc-950/40 border border-brand-purple/20 p-3.5 rounded-xl flex flex-col gap-3 text-left">
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-brand-purple animate-pulse" /> Coordinate Passcode (6 Digits) *
                        </span>
                        <span className="text-[9px] text-zinc-500 mt-0.5 font-semibold">
                          Required for guests to view this private cluster.
                        </span>
                      </div>
                      
                      <div className="flex gap-2 justify-between mt-1">
                        {passcode.map((digit, idx) => (
                          <input
                            key={`pin-${idx}`}
                            ref={passcodeRefs[idx]}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handlePasscodeChange(idx, e.target.value)}
                            onKeyDown={(e) => handlePasscodeKeyDown(idx, e)}
                            onPaste={handlePasscodePaste}
                            className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/10 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-center text-sm font-black text-white outline-none transition-all shadow-inner"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-950/20 border border-white/5 opacity-50 p-3.5 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex flex-col text-left leading-tight min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <Lock className="h-3 w-3" /> Passcode Protection
                        </span>
                        <span className="text-[9px] text-zinc-600 mt-1 font-semibold leading-relaxed">
                          Passcode is only required for private coordinate clusters.
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* 8. Action Buttons Stack */}
                <div className="border-t border-white/5 pt-5 mt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 active:scale-[0.99] text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg hover:shadow-brand-purple/20 transition-all flex items-center justify-center gap-2 select-none"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" /> Establish Community Coordinates
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setValidationError(null);
                    }}
                    className="w-full h-10 border border-white/10 hover:border-white/20 hover:bg-white/[0.02] text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center select-none"
                  >
                    Back to Details Edit
                  </button>
                  
                  <p className="text-[8.5px] text-zinc-500 text-center font-mono mt-1">
                    By establishing these coordinates you agree to Wandercall exploration guidelines.
                  </p>
                </div>

              </form>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
