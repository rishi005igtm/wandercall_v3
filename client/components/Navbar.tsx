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
        await httpClient.post("/auth/logout", { userId });
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
    { name: "Explore", icon: Compass, href: "#explore" },
    { name: "Experiences", icon: Calendar, href: "#experiences" },
    { name: "Feed", icon: Compass, href: "/feed" },
    { name: "Campfires", icon: Radio, href: "#campfires" },
    { name: "Quests", icon: Award, href: isAuthenticated ? "/feed" : "/login" },
    { name: "AI Assistant", icon: MessageSquare, href: "#ai-assistant" },
  ];

  const getHref = (target: string, name: string) => {
    if (name === "Experiences") {
      if (pathname === "/") return "#experiences";
      return "/experiences";
    }
    if (target.startsWith("/")) return target;
    return pathname === "/" ? target : `/${target}`;
  };

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
                  href={getHref(link.href, link.name)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
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
              className={`p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors ${
                showBackButton ? "hidden lg:inline-flex" : ""
              }`}
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

            {/* Dynamic Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
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

                {/* Profile Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-zinc-900 border border-white/10 hover:border-brand-purple/40 transition-all cursor-pointer"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center text-xs font-bold text-white shadow-md">
                      {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "E"}
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
                            {currentUser?.displayName || "Explorer"}
                          </h4>
                          <span className="text-[9px] font-mono text-brand-cyan block mt-0.5">
                            @{currentUser?.username || "explorer"}
                          </span>
                        </div>

                        {/* Menu Links */}
                        <Link
                          href="/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <User className="h-4 w-4 text-brand-purple" />
                          <span>My Explorer Profile</span>
                        </Link>

                        <Link
                          href="/profile/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Bookmark className="h-4 w-4 text-brand-cyan" />
                          <span>Bookings & Trips</span>
                        </Link>

                        <Link
                          href="/profile/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Heart className="h-4 w-4 text-rose-400" />
                          <span>Wishlist & Saved</span>
                        </Link>

                        <Link
                          href="/profile/settings"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Settings className="h-4 w-4 text-zinc-400" />
                          <span>System Settings</span>
                        </Link>

                        <div className="h-px bg-white/5 my-1" />

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all w-full text-left cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-500" />
                          <span>Disconnect Node (Sign Out)</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              /* Guest Buttons */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="p-2 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo/90 hover:to-brand-purple/90 text-white shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle or Filter Button */}
            {showFilterButton ? (
              <button
                onClick={onFilterToggle}
                className="lg:hidden p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Filter"
              >
                <SlidersHorizontal className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors ${
                  showBackButton ? "hidden" : ""
                }`}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
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

      {/* Premium Side Panel Mobile Navigation */}
      {!showFilterButton && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-brand-bg/95 backdrop-blur-xl border-l border-white/5 p-8 z-50 flex flex-col justify-between shadow-2xl shadow-black/80"
              >
                <div>
                  <div className="flex items-center justify-between mb-12">
                    <span className="text-lg font-bold text-white bg-gradient-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">
                      Wandercall
                    </span>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {navLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.name} href={getHref(link.href, link.name)} passHref legacyBehavior>
                          <motion.a
                            onClick={() => setIsMobileMenuOpen(false)}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
                          >
                            <Icon className="h-5 w-5 text-brand-indigo" />
                            {link.name}
                          </motion.a>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center justify-center py-4 rounded-xl font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer"
                    >
                      Sign Out Node
                    </button>
                  ) : (
                    <>
                      <a
                        href="#host"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center py-3 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Become Host
                      </a>
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-center py-4 rounded-xl font-bold bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-lg text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
