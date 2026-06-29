"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Globe, 
  Sparkles, 
  Award, 
  Radio, 
  CheckCircle2, 
  ShieldCheck, 
  Fingerprint, 
  ArrowLeft,
  MapPin,
  Camera,
  AtSign,
  RefreshCw,
  Loader2,
  Trash2,
  ShieldAlert
} from "lucide-react";
import { useGeoapifyAutocomplete, GeoapifyLocation } from "@/hooks/useGeoapifyAutocomplete";
import { useCompleteProfileMutation, useUploadAvatarMutation } from "@/hooks/api/useUserMutations";
import { useAppSelector } from "@/lib/store/store";
import { mapApiError } from "@/lib/utils/errorMapper";

function SignupCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const completeProfileMutation = useCompleteProfileMutation();
  const authState = useAppSelector((state) => state.auth);
  const authUserId = authState.userId;
  const authName = authState.name;

  const userIdParam = searchParams.get("userId") || authUserId;
  const uploadAvatarMutation = useUploadAvatarMutation(userIdParam);

  const nameParam = searchParams.get("name") || authName || "Explorer";

  // Form States
  const [username, setUsername] = useState("");
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; api?: string }>({});

  // Location Geoapify autocomplete state
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<GeoapifyLocation | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationContainerRef = useRef<HTMLDivElement>(null);

  const { suggestions: locationSuggestions, loading: locationLoading, triggerSearch: searchLocation } = useGeoapifyAutocomplete();

  // Stats counting animation states
  const [explorers, setExplorers] = useState(0);
  const [experiences, setExperiences] = useState(0);
  const [communities, setCommunities] = useState(0);
  const [memories, setMemories] = useState(0);

  // Post-signup loader text sequence state
  const [loaderStep, setLoaderStep] = useState(0);
  const loaderTexts = [
    "Creating adventure profile...",
    "Aligning with local communities...",
    "Securing data encryptors...",
    "Unlocking explorer credentials..."
  ];

  // Run stats count up animation on load
  useEffect(() => {
    const duration = 1200;
    const stepsCount = 50;
    const stepTime = duration / stepsCount;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setExplorers(Math.floor((10000 / stepsCount) * currentStep));
      setExperiences(Math.floor((500 / stepsCount) * currentStep));
      setCommunities(Math.floor((200 / stepsCount) * currentStep));
      setMemories(Math.floor((50000 / stepsCount) * currentStep));

      if (currentStep >= stepsCount) {
        setExplorers(10000);
        setExperiences(500);
        setCommunities(200);
        setMemories(50000);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Generate unique username suggestions based on full name
  const generateUsernameSuggestions = (fullName: string) => {
    const clean = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "explorer";
    const first = clean.slice(0, 8);
    const rand1 = Math.floor(10 + Math.random() * 89);
    const rand2 = Math.floor(100 + Math.random() * 899);
    const rand3 = Math.floor(10 + Math.random() * 89);

    return [
      `${first}_${rand1}`,
      `${clean}.${rand2}`,
      `${first}_x_${rand3}!`,
      `${clean}_explorer`
    ];
  };

  // On mount or name load, generate username suggestions
  useEffect(() => {
    if (nameParam) {
      const suggestions = generateUsernameSuggestions(nameParam);
      setSuggestedUsernames(suggestions);
      if (suggestions.length > 0 && !username) {
        setUsername(suggestions[0]);
      }
    }
  }, [nameParam]);

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Post-signup completion sequence timer
  useEffect(() => {
    if (!authSuccess) return;

    const stepInterval = setInterval(() => {
      setLoaderStep((prev) => {
        if (prev < loaderTexts.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 250);

    return () => clearInterval(stepInterval);
  }, [authSuccess, loaderTexts.length]);

  // Decoupled router navigation to prevent state-update-during-render console warnings
  useEffect(() => {
    if (authSuccess && loaderStep === loaderTexts.length - 1) {
      const navTimer = setTimeout(() => {
        router.push("/");
      }, 500);
      return () => clearTimeout(navTimer);
    }
  }, [authSuccess, loaderStep, loaderTexts.length, router]);

  const handleRegenerateUsernames = () => {
    const fresh = generateUsernameSuggestions(nameParam);
    setSuggestedUsernames(fresh);
    if (fresh.length > 0) {
      setUsername(fresh[0]);
    }
  };

  // Handle custom avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file, {
        onSuccess: (data) => {
          setUploadedAvatarUrl(data.avatarUrl || null);
        },
      });
    }
  };

  // Final Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setErrors({ username: "Username is required" });
      return;
    }

    if (username.trim().length < 3) {
      setErrors({ username: "Username must be at least 3 characters" });
      return;
    }

    setErrors({});

    completeProfileMutation.mutate(
      {
        userId: authUserId || userIdParam || "mock_user_id",
        username: username.trim(),
        displayName: nameParam,
        bio: bio.trim() || undefined,
        locationFormatted: locationInput.trim() || undefined,
        locationLat: selectedLocation?.lat,
        locationLon: selectedLocation?.lon,
        avatarUrl: uploadedAvatarUrl || undefined,
      },
      {
        onSuccess: () => {
          setAuthSuccess(true);
        },
        onError: (err) => {
          setErrors({ api: mapApiError(err) });
        },
      }
    );
  };

  // Get first letter of user's name
  const firstLetter = nameParam ? nameParam.trim().charAt(0).toUpperCase() : "U";

  return (
    <div className="h-[100dvh] w-full flex flex-col lg:flex-row bg-brand-bg text-white overflow-x-hidden font-sans relative select-none">
      
      {/* Back Button */}
      <Link 
        href="/signup" 
        className="fixed top-6 left-6 lg:left-[55%] lg:ml-6 z-40 p-2.5 rounded-full glass-panel border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg"
        aria-label="Back to signup"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      {/* Background Cinematic Adventure Photo */}
      <div className="hidden sm:block absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop"
          alt="Cinematic Camping Tent Under Starry Night Sky"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 mix-blend-luminosity scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-brand-bg/70 via-brand-bg/90 to-brand-bg" />
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.02] pointer-events-none" />
      </div>

      {/* LEFT PANEL: Immersive Brand Experience */}
      <section className="hidden lg:flex lg:w-[55%] h-full z-20 flex-col justify-between p-12 overflow-hidden bg-transparent">
        <Link href="/" className="relative z-10 flex items-center gap-2 self-start cursor-pointer hover:opacity-90 transition-opacity">
          <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple">
            <Globe className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-40" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            Wandercall
          </span>
        </Link>

        <div className="relative z-10 my-auto hidden lg:flex flex-col items-start text-left max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4 text-white">
            Discover Experiences <br />
            <span className="text-gradient-brand">Worth Remembering</span>
          </h1>
          
          <div className="space-y-2 text-sm text-zinc-400 font-medium mb-8">
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" /> Book adventures.</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-purple" /> Join communities.</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-indigo" /> Meet explorers.</p>
            <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-amber" /> Create real-life memories.</p>
          </div>

          <div className="relative w-full h-32 mt-6">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 top-0 glass-panel border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg"
            >
              <div className="h-8 w-8 rounded-xl bg-brand-amber/15 border border-brand-amber/20 flex items-center justify-center text-brand-amber">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Active Quest</p>
                <p className="text-xs font-extrabold text-white">Scuba Diving Netrani +120 XP</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-4 bottom-0 glass-panel border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg"
            >
              <div className="h-8 w-8 rounded-xl bg-brand-purple/15 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Live campfire</p>
                <p className="text-xs font-extrabold text-white">Solo Backpacking (89 listeners)</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 w-full pt-4 lg:pt-8 border-t border-white/5 flex justify-between items-center max-w-xl gap-4">
          <div className="text-left">
            <p className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Explorers</p>
            <p className="text-sm sm:text-base font-black text-white font-mono">{(explorers / 1000).toFixed(0)}K+</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-left">
            <p className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Experiences</p>
            <p className="text-sm sm:text-base font-black text-white font-mono">{experiences}+</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-left">
            <p className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Communities</p>
            <p className="text-sm sm:text-base font-black text-white font-mono">{communities}+</p>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div className="text-left">
            <p className="text-[8px] sm:text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">Memories</p>
            <p className="text-sm sm:text-base font-black text-gradient-brand font-mono">{(memories / 1000).toFixed(0)}K+</p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: Profile Completion Form */}
      <section className="w-full lg:w-[45%] h-full overflow-y-auto flex flex-col items-center justify-center px-2 py-4 sm:p-8 md:p-12 z-10 relative">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="my-auto w-full max-w-[460px] glass-panel glass-glow-indigo phone-borderless px-4 py-6 sm:p-8 rounded-3xl flex flex-col gap-5 shadow-xl relative"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Final Step
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Profile Setup</span>
          </div>

          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-none mb-1.5">
              Complete your profile
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Customize how other explorers see you on Wandercall.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            
            {/* PROFILE PICTURE SECTION: First Letter Fallback or Upload Preview */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Profile Picture (Optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar Display Container */}
                <div className="relative h-16 w-16 rounded-full p-0.5 bg-gradient-to-tr from-brand-indigo to-brand-purple flex-shrink-0 shadow-lg flex items-center justify-center overflow-hidden">
                  {uploadAvatarMutation.isPending ? (
                    <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-purple" />
                    </div>
                  ) : uploadedAvatarUrl ? (
                    <Image
                      src={uploadedAvatarUrl}
                      alt="Uploaded profile avatar"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-tr from-brand-indigo via-brand-purple to-brand-cyan shadow-lg flex items-center justify-center font-black text-2xl text-white drop-shadow-md select-none">
                      {firstLetter}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <label className={`h-9 px-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold text-zinc-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${uploadAvatarMutation.isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
                      <Camera className="h-3.5 w-3.5 text-brand-cyan" />
                      {uploadedAvatarUrl ? "Change Photo" : "Upload Photo"}
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadAvatarMutation.isPending} className="hidden" />
                    </label>

                    {uploadedAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setUploadedAvatarUrl(null)}
                        className="h-9 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-bold text-rose-400 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {uploadedAvatarUrl ? "Custom image active" : "Defaulting to initial letter fallback"}
                  </p>
                </div>
              </div>
            </div>

            {/* UNIQUE USERNAME GENERATOR FIELD */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="username" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Unique Username
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateUsernames}
                  className="text-[10px] font-bold text-brand-cyan hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. john_doe_92"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${
                    errors.username ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
                  }`}
                />
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
              {errors.username && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.username}
                </p>
              )}
            </div>

            {/* LOCATION FIELD (GEOAPIFY API) */}
            <div className="flex flex-col gap-1.5 relative" ref={locationContainerRef}>
              <label htmlFor="location" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Current Location</span>
                <span className="text-zinc-500 font-normal text-[9px]">Powered by Geoapify</span>
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  placeholder="Search city, country (e.g. Tokyo, Japan)..."
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setSelectedLocation(null);
                    searchLocation(e.target.value);
                    setShowLocationDropdown(true);
                  }}
                  onFocus={() => {
                    if (locationInput.trim()) setShowLocationDropdown(true);
                  }}
                  className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all"
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-cyan" />
                {locationLoading && (
                  <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
                )}
              </div>

              {/* Dropdown Suggestions */}
              <AnimatePresence>
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-[#0E131F] border border-white/20 rounded-xl overflow-hidden shadow-2xl max-h-48 overflow-y-auto opacity-100"
                  >
                    {locationSuggestions.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(item);
                          setLocationInput(item.formatted);
                          setShowLocationDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 bg-[#0E131F] hover:bg-white/10 transition-colors flex items-start gap-2.5 border-b border-white/10 last:border-b-0 cursor-pointer"
                      >
                        <MapPin className="h-4 w-4 text-brand-purple flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-white">{item.formatted}</p>
                          {(item.city || item.country) && (
                            <p className="text-[10px] text-zinc-400 font-medium">
                              {[item.city, item.state, item.country].filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BIO FIELD (OPTIONAL) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="bio" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Short Bio (Optional)
                </label>
                <span className="text-[9px] text-zinc-500">{bio.length}/160</span>
              </div>
              <div className="relative">
                <textarea
                  id="bio"
                  rows={2}
                  maxLength={160}
                  placeholder="Passionate traveler, solo backpacker, food explorer..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all resize-none"
                />
              </div>
            </div>

            {/* API Error Banner */}
            {errors.api && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{errors.api}</span>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={completeProfileMutation.isPending}
              className={`w-full h-[52px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer ${
                completeProfileMutation.isPending
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-lg shadow-brand-indigo/25 active:scale-[0.98]"
              }`}
            >
              {completeProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Finalizing Account...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Account & Launch
                </>
              )}
            </button>
          </form>
        </motion.div>
      </section>

      {/* POST SIGNUP ASSEMBLY EXPERIENCE OVERLAY */}
      <AnimatePresence>
        {authSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-bg/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
          >
            <div className="relative h-16 w-16 mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple shadow-xl shadow-brand-indigo/20">
              <Globe className="h-8 w-8 text-white animate-spin-slow" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-50" />
            </div>

            <motion.p
              key={loaderStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold tracking-wider text-zinc-300 uppercase"
            >
              {loaderTexts[loaderStep]}
            </motion.p>

            <div className="flex gap-1.5 mt-4">
              {loaderTexts.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    i === loaderStep 
                      ? "w-4 bg-brand-cyan" 
                      : i < loaderStep 
                        ? "bg-brand-emerald" 
                        : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SignupCompletePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-brand-bg flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    }>
      <SignupCompleteContent />
    </Suspense>
  );
}
