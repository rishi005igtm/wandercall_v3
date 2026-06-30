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
  CheckCircle2,
  Fingerprint,
  UserPlus,
  User,
  ShieldAlert,
  ArrowLeft
} from "lucide-react";
import { useSignupMutation, useGoogleAuthMutation, useVerifyEmailMutation, useResendVerificationMutation } from "@/hooks/api/useAuthMutations";
import { useAppSelector } from "@/lib/store/store";
import { mapApiError } from "@/lib/utils/errorMapper";
import { Loader2, KeyRound } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const signupMutation = useSignupMutation();
  const googleAuthMutation = useGoogleAuthMutation();
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendVerificationMutation();

  const authState = useAppSelector((state) => state.auth);
  const authUserId = authState.userId;
  const authEmail = authState.email;
  const authName = authState.name;
  const authIsAuthenticated = authState.isAuthenticated;
  const authIsEmailVerified = authState.isEmailVerified;

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; terms?: string; api?: string }>({});

  // 6-Digit OTP verification state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);
  const otpInputsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  // Automatically open verification modal if user is registered but not verified yet
  useEffect(() => {
    if (authIsAuthenticated && !authIsEmailVerified) {
      setShowVerifyModal(true);
      if (authEmail) setEmail(authEmail);
      if (authName) setName(authName);
    }
  }, [authIsAuthenticated, authIsEmailVerified, authEmail, authName]);

  // Stats counting animation states
  const [explorers, setExplorers] = useState(0);
  const [experiences, setExperiences] = useState(0);
  const [communities, setCommunities] = useState(0);
  const [memories, setMemories] = useState(0);

  // Run stats count up animation on load
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setExplorers(Math.floor(10000 * progress));
      setExperiences(Math.floor(500 * progress));
      setCommunities(Math.floor(200 * progress));
      setMemories(Math.floor(50000 * progress));

      if (step >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validation
    if (!name.trim()) {
      newErrors.name = "Full Name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Full Name must be at least 3 characters";
    }

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

    if (!termsAccepted) {
      newErrors.terms = "You must agree to the Terms & Conditions";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    signupMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password,
        termsAccepted,
      },
      {
        onSuccess: () => {
          setShowVerifyModal(true);
        },
        onError: (err) => {
          setErrors({ api: mapApiError(err) });
        },
      }
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);
    setVerifyError(null);
    setVerifySuccess(null);

    if (cleanValue && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setVerifyError("Please enter the complete 6-digit verification code");
      return;
    }
    setVerifyError(null);
    setVerifySuccess(null);

    verifyEmailMutation.mutate(
      { email: email.trim(), code },
      {
        onSuccess: () => {
          setShowVerifyModal(false);
          const userId = authUserId || signupMutation.data?.user?.id || "";
          router.push(`/signup/complete?name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}&userId=${encodeURIComponent(userId)}`);
        },
        onError: (err) => {
          setVerifyError(mapApiError(err));
        },
      }
    );
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
          src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop"
          alt="Cinematic Camping Tent Under Starry Night Sky"
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

        {/* Middle Section: Title, Badges, & Floating Widgets */}
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

          {/* Floating Widgets */}
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

        {/* Bottom Section: Smooth counting stats */}
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
      <section className="w-full lg:w-[45%] h-full overflow-y-auto flex flex-col items-center justify-center px-2 py-4 sm:p-8 md:p-12 z-10 relative">

        {/* Background glow field */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />

        {/* Signup Container (Glass card, perfect alignment) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="my-auto w-full max-w-[420px] glass-panel glass-glow-indigo phone-borderless px-4 py-6 sm:p-10 rounded-3xl flex flex-col gap-6 shadow-xl relative"
        >
          {/* Header */}
          <div className="text-left">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3 animate-spin-slow" />
              Begin Your Journey
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none mb-2">
              Create your account
            </h2>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
              Join exclusive communities, track quests, and share memories.
            </p>
          </div>

          {/* OAuth Signup */}
          <div className="flex flex-col gap-3 w-full">
            {errors.api && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{errors.api}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => googleAuthMutation.mutate({ idToken: "mock_google_id_token" })}
              disabled={googleAuthMutation.isPending}
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
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
              {googleAuthMutation.isPending ? "Connecting..." : "Sign up with Google"}
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              OR REGISTER WITH EMAIL
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">

            {/* Full Name */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="name" className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${errors.name ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
                    }`}
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
              {errors.name && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

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
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${errors.email ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-11 bg-white/5 border rounded-xl pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-purple focus:border-brand-purple transition-all ${errors.password ? "border-rose-500/50 focus:ring-rose-500 focus:border-rose-500" : "border-white/10"
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

            {/* Terms & Conditions Agreement */}
            <div className="flex flex-col gap-1 mt-1 text-xs select-none">
              <label className="flex items-start gap-2.5 text-zinc-400 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="h-4 w-4 rounded border-white/10 bg-white/5 text-brand-purple focus:ring-brand-purple accent-brand-purple mt-0.5"
                />
                <span className="leading-tight">
                  I agree to the{" "}
                  <a href="#terms" className="text-brand-cyan hover:underline transition-all">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#privacy" className="text-brand-cyan hover:underline transition-all">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Sign Up Submit Button */}
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className={`w-full h-[52px] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer ${signupMutation.isPending
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                  : "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-lg shadow-brand-indigo/25 active:scale-[0.98]"
                }`}
            >
              {signupMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus className="h-4 w-4" />
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

          {/* Sign in page link */}
          <p className="text-xs font-medium text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand-cyan hover:underline transition-all">
              Sign In
            </Link>
          </p>
        </motion.div>
      </section>

      {/* SMART 6-DIGIT EMAIL VERIFICATION MODAL */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md glass-panel glass-glow-indigo p-6 sm:p-8 rounded-3xl flex flex-col gap-6 shadow-2xl border border-white/15 relative text-left bg-[#0E131F]"
            >
              <div className="flex flex-col gap-2">
                <div className="h-12 w-12 rounded-2xl bg-brand-purple/15 border border-brand-purple/30 flex items-center justify-center text-brand-purple mb-1">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Verify your email</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We sent a 6-digit security code to{" "}
                  <span className="text-brand-cyan font-semibold">{email}</span>. Enter it below to activate your registration.
                </p>
              </div>

              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifySuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <span>{verifySuccess}</span>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="flex flex-col gap-6">
                {/* 6 Individual Numeric OTP Input Boxes */}
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputsRef.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 bg-white/5 border border-white/15 rounded-xl text-center font-mono text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-brand-purple transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={verifyEmailMutation.isPending || otp.join("").length < 6}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand-indigo/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {verifyEmailMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={resendVerificationMutation.isPending}
                    onClick={() => {
                      setVerifyError(null);
                      setVerifySuccess(null);
                      resendVerificationMutation.mutate(email.trim(), {
                        onSuccess: (data) => {
                          setVerifySuccess(data.message || "Verification code successfully resent!");
                        },
                        onError: (err) => {
                          setVerifyError(mapApiError(err));
                        }
                      });
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors text-center cursor-pointer py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendVerificationMutation.isPending ? (
                      <span className="flex items-center justify-center gap-1">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-cyan" />
                        Resending code...
                      </span>
                    ) : (
                      <>
                        Didn't receive code? <span className="text-brand-cyan hover:underline">Resend email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
