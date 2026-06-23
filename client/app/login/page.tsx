"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Globe, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Sparkles, 
  Award, 
  Radio, 
  Users, 
  CheckCircle2, 
  Fingerprint, 
  KeyRound,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Stats counting animation states
  const [explorers, setExplorers] = useState(0);
  const [experiences, setExperiences] = useState(0);
  const [communities, setCommunities] = useState(0);
  const [memories, setMemories] = useState(0);

  // Post-login loader text sequence state
  const [loaderStep, setLoaderStep] = useState(0);
  const loaderTexts = [
    "Loading adventure profile...",
    "Preparing recommendations...",
    "Loading communities...",
    "Loading quests..."
  ];

  // Run stats count up animation on load
  useEffect(() => {
    const duration = 1200; // 1.2 seconds animation
    const steps = 50;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setExplorers(Math.floor((10000 / steps) * step));
      setExperiences(Math.floor((500 / steps) * step));
      setCommunities(Math.floor((200 / steps) * step));
      setMemories(Math.floor((50000 / steps) * step));

      if (step >= steps) {
        setExplorers(10000);
        setExperiences(500);
        setCommunities(200);
        setMemories(50000);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Post-login sequence timer
  useEffect(() => {
    if (!authSuccess) return;

    const stepInterval = setInterval(() => {
      setLoaderStep((prev) => {
        if (prev < loaderTexts.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          // Redirect to home page
          router.push("/");
          return prev;
        }
      });
    }, 200); // cycle texts quickly (approx 800ms total)

    return () => clearInterval(stepInterval);
  }, [authSuccess, router]);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    // Basic validation
    if (!email) {
      newErrors.email = "Email Address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Mock API Auth Call
    setTimeout(() => {
      setIsSubmitting(false);
      setAuthSuccess(true);
    }, 1500);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col lg:flex-row bg-brand-bg text-white overflow-hidden font-sans relative select-none">
      
      {/* Back Button (fixed, sits at top-left on mobile, top-left of form column on desktop) */}
      <Link 
        href="/" 
        className="fixed top-6 left-6 lg:left-[55%] lg:ml-6 z-40 p-2.5 rounded-full glass-panel border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-lg"
        aria-label="Back to home"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      
      {/* Background Cinematic Adventure Photo stretching across the page */}
      <div className="hidden sm:block absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format&fit=crop"
          alt="Cinematic Campfire Under Starry Sky"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 mix-blend-luminosity scale-102"
        />
        {/* Horizontal linear gradient overlay from left (transparent/low dark) to right (solid dark) */}
        <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-brand-bg/70 via-brand-bg/90 to-brand-bg" />
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.02] pointer-events-none" />
      </div>

      {/* LEFT PANEL: Immersive Brand Experience (hidden on mobile, sticky on desktop) */}
      <section className="hidden lg:flex lg:w-[55%] h-full z-20 flex-col justify-between p-12 overflow-hidden bg-transparent">
        {/* Top Section: Logo & Mark */}
        <Link href="/" className="relative z-10 flex items-center gap-2 self-start cursor-pointer hover:opacity-90 transition-opacity">
          <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple">
            <Globe className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-40" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-sans">
            Wandercall
          </span>
        </Link>

        {/* Middle Section: Title, Badges, & Floating Widgets (Hidden/collapsible on small screens) */}
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

          {/* Subtly Floating Widgets */}
          <div className="relative w-full h-32 mt-6">
            {/* Quest Widget */}
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
                <p className="text-xs font-extrabold text-white">Scuba Diving netrani +120 XP</p>
              </div>
            </motion.div>

            {/* Campfire Badge */}
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

        {/* Bottom Section: Smooth counting stats (smaller/compact on mobile) */}
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

      {/* RIGHT PANEL: Authentication Form Container */}
      <section className="w-full lg:w-[45%] h-full overflow-y-auto flex flex-col items-center p-4 sm:p-8 md:p-12 z-10 relative">
        
        {/* Background glow field */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

        {/* Login Container (Glass card, perfect alignment) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-auto w-full max-w-[420px] glass-panel glass-glow-indigo phone-borderless p-6 sm:p-10 rounded-3xl flex flex-col gap-6 shadow-xl relative"
        >
          {/* Header */}
          <div className="text-left">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              Welcome Back Explorer
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-2">
              Sign in to Wandercall
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Continue your adventures and discover new experiences.
            </p>
          </div>

          {/* OAuth Authentication Grid */}
          <div className="flex flex-col gap-3 w-full">
            <button 
              type="button"
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {/* Google Flat SVG */}
              <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1l3.2,2.48c1.87,-1.72 2.95,-4.27 2.95,-7.22C21.48,11.75 21.43,11.4 21.35,11.1z" fill="#4285F4" />
                  <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.2,-2.48c-0.89,0.6 -2.03,0.95 -3.37,0.95c-2.34,0 -4.32,-1.58 -5.02,-3.7L3.1,15.65C4.58,18.6 7.64,20.6 12,20.6z" fill="#34A853" />
                  <path d="M6.98,13.17c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7L3.8,7.3c-0.6,1.2 -0.95,2.56 -0.95,4c0,1.44 0.35,2.8 0.95,4L6.98,13.17z" fill="#FBBC05" />
                  <path d="M12,6.05c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.35 14.42,2.6 12,2.6C7.64,2.6 4.58,4.6 3.1,7.55L6.98,10.6C7.68,8.48 9.66,6.05 12,6.05z" fill="#EA4335" />
                </g>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Credentials Authentication Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            
            {/* Email Address */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="email" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="name@domain.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${
                    errors.email ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
                  }`}
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
              {errors.email && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="password" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${
                    errors.password ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
                  }`}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between mt-1 text-xs select-none">
              <label className="flex items-center gap-2 text-zinc-400 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-brand-purple focus:ring-brand-purple accent-brand-purple"
                />
                Remember Me
              </label>
              
              <a href="#forgot" className="font-semibold text-brand-cyan hover:underline hover:text-white transition-all">
                Forgot Password?
              </a>
            </div>

            {/* Sign In Trigger Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-[52px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer ${
                isSubmitting
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-lg shadow-brand-indigo/25 active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-white animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Secure indicator footer */}
          <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Fingerprint className="h-3.5 w-3.5 text-brand-cyan" /> Secure Auth
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-purple" /> Encrypted
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-emerald" /> GDPR Protected
            </span>
          </div>

          {/* Create account trigger */}
          <p className="text-xs font-medium text-zinc-400">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-brand-cyan hover:underline transition-all">
              Create Account
            </Link>
          </p>
        </motion.div>
      </section>

      {/* POST LOGIN ASSEMBLY EXPERIENCE OVERLAY */}
      <AnimatePresence>
        {authSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-bg/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6"
          >
            {/* Spinning Loader */}
            <div className="relative h-16 w-16 mb-8 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple shadow-xl shadow-brand-indigo/20">
              <Globe className="h-8 w-8 text-white animate-spin-slow" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-50" />
            </div>

            {/* Dynamic Status Loading Message */}
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

            {/* Progress indicators dots */}
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
