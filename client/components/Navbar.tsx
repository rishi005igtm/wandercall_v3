"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Calendar,
  Radio,
  Award,
  MessageSquare,
  Search,
  Menu,
  X,
  Globe,
  User,
  ArrowLeft,
  SlidersHorizontal,
  Bell,
  LogOut,
  Settings,
  Heart,
  Bookmark,
  Sparkles,
  ChevronDown,
  LogIn,
  Home,
  Info,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { clearAuthSession } from "@/lib/store/slices/authSlice";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";
import { useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/lib/api/httpClient";

export default function Navbar({
  showBackButton,
  backHref,
  showFilterButton,
  onFilterToggle,
}: {
  showBackButton?: boolean;
  backHref?: string;
  showFilterButton?: boolean;
  onFilterToggle?: () => void;
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const { isAuthenticated, userId } = useAppSelector((state) => state.auth);
  const { data: currentUser } = useCurrentUserQuery(isAuthenticated);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));

      const lastScrollY = lastScrollYRef.current;
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setIsVisible((prev) => (prev !== false ? false : prev));
      } else {
        setIsVisible((prev) => (prev !== true ? true : prev));
      }
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (userId) {
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("wc_refresh_token") : null;
        await httpClient.post("/auth/logout", { userId, refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      queryClient.clear();
      dispatch(clearAuthSession());
      setProfileMenuOpen(false);
      router.push("/");
    }
  };

  const navLinks = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Experiences", icon: Calendar, href: "/experiences" },
    { name: "Feed", icon: Radio, href: "/feed" },
    { name: "About Us", icon: Info, href: "/about" },
  ];

  const getHref = (target: string) => {
    return target;
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const showBottomNav = pathname === "/" || pathname.startsWith("/experiences") || pathname.startsWith("/feed");

  return (
    <>
      <motion.nav
        initial={{
          y: 0,
          backgroundColor: "rgba(11, 11, 11, 0)",
          backdropFilter: "blur(0px)",
          boxShadow: "0 0 0px rgba(0,0,0,0)",
        }}
        animate={{
          y: isVisible ? 0 : -100,
          backgroundColor: isScrolled ? "rgba(11, 11, 11, 0.85)" : "rgba(11, 11, 11, 0)",
          backdropFilter: isScrolled ? "blur(8px)" : "blur(0px)",
          boxShadow: isScrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)" : "0 0 0px rgba(0,0,0,0)",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-none"
      >
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={() => {
                  if (backHref) {
                    router.push(backHref);
                  } else {
                    router.back();
                  }
                }}
                className="lg:hidden p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple">
                <Globe className="h-5 w-5 text-white animate-pulse" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text">
                Wandercall
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={getHref(link.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? "text-brand-cyan bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right side interactions */}
          <div className="flex items-center gap-3">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors hidden lg:inline-flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Become Host */}
            {!isAuthenticated && (
              <a
                href="#host"
                className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-brand-cyan hover:text-white transition-colors"
              >
                Become Host
              </a>
            )}

            {/* Right Header Controls (Auth & Guest Dropdown) */}
            <div className="flex items-center gap-3">
                {isAuthenticated && (
                  <>
                    {/* Notification Bell */}
                    <button
                      onClick={() => router.push("/profile/settings")}
                      className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-cyan animate-ping" />
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-cyan" />
                    </button>

                    {/* Explorer Level Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 rounded-full text-[10px] font-black uppercase tracking-wider text-brand-purple">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span>Level {currentUser?.level || 1}</span>
                    </div>
                  </>
                )}

                {/* Profile Avatar Dropdown for both Auth Users and Guests */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-zinc-900 border border-white/10 hover:border-brand-purple/40 transition-all cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-xs font-bold text-white shadow-md overflow-hidden">
                      {isAuthenticated ? (
                        currentUser?.avatarUrl ? (
                          <img src={currentUser.avatarUrl} alt={currentUser.displayName || "Avatar"} className="h-full w-full object-cover" />
                        ) : (
                          currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "E"
                        )
                      ) : (
                        <User className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-64 bg-zinc-950/95 border border-white/10 rounded-3xl p-3 shadow-2xl backdrop-blur-2xl z-50 flex flex-col gap-1 text-left select-none"
                      >
                        {/* User Header */}
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl mb-1">
                          <h4 className="text-xs font-black text-white truncate">
                            {isAuthenticated ? (currentUser?.displayName || "Explorer") : "Guest Explorer"}
                          </h4>
                          <span className="text-[9px] font-mono text-brand-cyan block mt-0.5">
                            {isAuthenticated ? `@${currentUser?.username || "explorer"}` : "@guest"}
                          </span>
                        </div>

                        {/* Menu Links */}
                        <Link
                          href="/feed"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Radio className="h-4 w-4 text-brand-indigo" />
                          <span>Feed</span>
                        </Link>

                        <Link
                          href="/experiences"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Calendar className="h-4 w-4 text-brand-cyan" />
                          <span>Experiences</span>
                        </Link>

                        <Link
                          href={isAuthenticated ? "/profile" : "/login"}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <User className="h-4 w-4 text-brand-purple" />
                          <span>My Explorer Profile</span>
                        </Link>

                        <Link
                          href={isAuthenticated ? "/profile/settings" : "/login"}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Bookmark className="h-4 w-4 text-amber-400" />
                          <span>Bookings & Trips</span>
                        </Link>

                        <Link
                          href={isAuthenticated ? "/profile/settings" : "/login"}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Heart className="h-4 w-4 text-rose-400" />
                          <span>Wishlist & Saved</span>
                        </Link>

                        <Link
                          href={isAuthenticated ? "/profile/settings" : "/login"}
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings className="h-4 w-4 text-zinc-400" />
                          <span>System Settings</span>
                        </Link>

                        <div className="h-px bg-white/5 my-1" />

                        {/* Action Button: Logout for Auth, Login for Guest */}
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all w-full text-left cursor-pointer"
                          >
                            <LogOut className="h-4 w-4 text-rose-500" />
                            <span>Disconnect Node (Sign Out)</span>
                          </button>
                        ) : (
                          <Link
                            href="/login"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-brand-cyan hover:text-cyan-300 hover:bg-brand-cyan/10 transition-all w-full text-left cursor-pointer"
                          >
                            <LogIn className="h-4 w-4 text-brand-cyan" />
                            <span>Login to Wandercall</span>
                          </Link>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            {/* Mobile Filter Button if active */}
            {showFilterButton && (
              <button
                onClick={onFilterToggle}
                className="lg:hidden p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Filter"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Global Expandable Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-0 right-0 top-full bg-brand-bg/95 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-center"
            >
              <div className="w-full max-w-2xl relative">
                <input
                  type="text"
                  placeholder="Search adventures, hosts, campfire topics..."
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs font-semibold"
                >
                  ESC
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Global Mobile Floating Bottom Action Row */}
      <AnimatePresence>
        {showBottomNav && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed bottom-6 left-4 right-4 z-50 glass-panel bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center justify-between shadow-2xl"
          >
            <button onClick={() => router.push('/')} className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors cursor-pointer ${pathname === '/' ? 'text-brand-cyan' : 'text-zinc-400 hover:text-white'}`}>
              <Home className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 flex-1 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <Search className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Search</span>
            </button>
            <div className="flex-1 flex justify-center -mt-8 relative z-50">
              <button onClick={() => router.push('/experiences')} className={`h-14 w-14 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center shadow-xl shadow-brand-indigo/30 border-4 cursor-pointer hover:scale-105 transition-all duration-300 ${pathname.startsWith('/experiences') ? 'border-brand-cyan scale-105 shadow-brand-cyan/20' : 'border-[#0B0B0B]'}`}>
                <Sparkles className="h-6 w-6 text-white" />
              </button>
            </div>
            <button onClick={() => router.push('/feed')} className={`flex flex-col items-center gap-1 flex-1 py-2 transition-colors cursor-pointer ${pathname.startsWith('/feed') ? 'text-brand-cyan' : 'text-zinc-400 hover:text-white'}`}>
              <Radio className="h-5 w-5" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Feed</span>
            </button>
            <button className="flex flex-col items-center gap-1 flex-1 py-2 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="text-[9px] font-bold uppercase tracking-wider">Near Me</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
