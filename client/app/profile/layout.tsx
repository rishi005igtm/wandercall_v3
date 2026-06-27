"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Heart,
  Calendar,
  Award,
  Users,
  Radio,
  User,
  UserPlus,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home
} from "lucide-react";

// Sidebar Links
const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Wishlist", icon: Heart, href: "/profile/wishlist" },
  { name: "Bookings", icon: Calendar, href: "/profile/bookings" },
  { name: "Quests", icon: Award, href: "/profile/quests" },
  { name: "Communities", icon: Users, href: "/profile/community" },
  { name: "Campfires", icon: Radio, href: "/profile/campfires" },
  { name: "Friends", icon: UserPlus, href: "/profile/friends" },
  { name: "Settings", icon: Settings, href: "/profile/settings" },
];

const bottomMenuVariants = {
  initial: { opacity: 0, x: 15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, x: -15, transition: { duration: 0.15, ease: "easeIn" } }
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuPage, setMobileMenuPage] = useState(0);

  // Generate active mobile group dynamically using modulo logic (exactly 4 menu items)
  const activeGroup = useMemo(() => {
    const len = navItems.length;
    const start = (mobileMenuPage * 4) % len;
    const items = [];
    for (let i = 0; i < 4; i++) {
      const idx = (start + i) % len;
      items.push(navItems[idx]);
    }
    return items;
  }, [mobileMenuPage]);

  // Trigger interactive coming-soon toast for future nested pages
  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (
      item.href !== "/" &&
      item.href !== "/profile" &&
      item.href !== "/profile/wishlist" &&
      item.href !== "/profile/bookings" &&
      item.href !== "/profile/quests" &&
      item.href !== "/profile/community" &&
      item.href !== "/profile/campfires" &&
      item.href !== "/profile/friends" &&
      item.href !== "/profile/settings"
    ) {
      e.preventDefault();
      setToastMessage(`${item.name} module will unlock in the next phase!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const isChatRoute = pathname?.includes('/profile/friends/chat:');
  const isCampfireActiveRoute = pathname?.startsWith('/profile/campfires/') && pathname !== '/profile/campfires' && pathname !== '/profile/campfires/';
  
  const staticSubPaths = ['wishlist', 'bookings', 'quests', 'community', 'campfires', 'friends', 'settings'];
  const isDynamicProfileRoute = pathname?.startsWith('/profile/') && 
    !staticSubPaths.some(sub => pathname === `/profile/${sub}` || pathname.startsWith(`/profile/${sub}/`)) && 
    pathname !== '/profile' && 
    pathname !== '/profile/';

  const shouldShowBottomNav = !isCampfireActiveRoute && !isDynamicProfileRoute;

  if (isChatRoute) {
    return (
      <div className="min-h-screen bg-brand-bg text-white relative">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white font-sans flex flex-col md:flex-row relative overflow-x-hidden">

      {/* 1. FIXED LEFT SIDEBAR: Expanded on Desktop, Collapsed to icon-only on Tablet, Hidden on Mobile */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 h-screen z-40 bg-zinc-950/40 border-r border-white/5 backdrop-blur-md flex-col justify-between p-4 lg:p-6 transition-all duration-300 w-[80px] lg:w-[280px] overflow-y-auto no-scrollbar overscroll-y-contain">

        {/* Top: Branding logo and user details */}
        <div className="flex flex-col gap-8 w-full">

          {/* User passport profile avatar block */}
          <div className="flex flex-col lg:flex-row items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl w-full">
            <div className="relative h-10 w-10 shrink-0">
              {/* Profile image placeholder */}
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center font-black text-sm text-white border border-white/10 shadow-md">
                R
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-brand-emerald border-2 border-zinc-950 animate-pulse" />
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-bold truncate flex items-center gap-1 text-white">
                Rishiraj
                <span className="h-3 w-3 text-brand-cyan"><Sparkles className="h-3 w-3 fill-brand-cyan/20" /></span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono truncate">Level 12 Explorer</span>
            </div>
          </div>

          {/* XP Progress Bar (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
              <span>XP 3,240 / 4,000</span>
              <span>81%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full w-[81%]" />
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1 w-full mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/profile/community" && pathname?.startsWith("/profile/community"));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`relative flex items-center justify-center lg:justify-start gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer group ${isActive
                      ? "text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]"
                    }`}
                >
                  {/* Active Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-white/[0.03] border border-white/5 rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-1/3 bottom-1/3 w-1 rounded-r-md bg-brand-cyan" />
                  )}

                  <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105 z-10 ${isActive ? "text-brand-cyan" : "text-zinc-500 group-hover:text-zinc-300"
                    }`} />
                  <span className="hidden lg:inline truncate z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="w-full">
          <Link
            href="/login"
            className="flex items-center justify-center lg:justify-start gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5 transition-all cursor-pointer w-full group"
          >
            <LogOut className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden lg:inline">Logout</span>
          </Link>
        </div>
      </aside>

      {/* 2. SCROLLABLE RIGHT CONTENT AREA */}
      <main className={`flex-1 md:pl-[80px] lg:pl-[280px] min-h-screen flex flex-col ${(!shouldShowBottomNav) ? "pb-0" : "pb-20"} md:pb-0`}>
        <header className="h-16 w-full border-b border-white/5 px-4 md:px-12 flex items-center justify-between z-30 bg-zinc-950/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              className="h-9 w-9 rounded-full border border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center">
              Explorer Dashboard
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile-only Settings Link */}
            <Link
              href="/profile/settings"
              className="flex md:hidden h-9 w-9 rounded-full border border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer items-center justify-center shrink-0"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* Notifications Button */}
            <button
              onClick={() => {
                setToastMessage("Notifications will be configurable in Next Phase!");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex h-9 w-9 rounded-full border border-white/5 hover:bg-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer items-center justify-center shrink-0 relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-cyan" />
            </button>
          </div>
        </header>

        {/* Nested route content */}
        <div className="w-full flex-1 relative">
          {children}
        </div>
      </main>

      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION: Visually clean mobile bar with paginated menus and loop next button */}
      {shouldShowBottomNav && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-zinc-950/80 backdrop-blur-xl border border-white/5 shadow-2xl rounded-2xl h-14 flex items-center justify-between px-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={mobileMenuPage}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0, y: 10 },
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.04,
                    delayChildren: 0.02
                  }
                },
                exit: { opacity: 0, y: -10, transition: { duration: 0.12 } }
              }}
              className="flex w-full items-center justify-around h-full"
            >
              {activeGroup.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href === "/profile/community" && pathname?.startsWith("/profile/community"));

                return (
                  <motion.div
                    key={item.name}
                    variants={{
                      initial: { scale: 0.85, opacity: 0 },
                      animate: { scale: 1, opacity: 1 },
                      exit: { scale: 0.85, opacity: 0 }
                    }}
                    className="flex-1 flex justify-center"
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer group w-full max-w-[60px] ${isActive ? "text-brand-cyan" : "text-zinc-400 hover:text-white"
                        }`}
                      aria-label={item.name}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 bg-white/5 border border-white/5 rounded-xl z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className="h-4.5 w-4.5 z-10" />
                      <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10 truncate max-w-full">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Next Button Loop */}
              <motion.div
                variants={{
                  initial: { scale: 0.85, opacity: 0 },
                  animate: { scale: 1, opacity: 1 },
                  exit: { scale: 0.85, opacity: 0 }
                }}
                className="flex-1 flex justify-center"
              >
                <button
                  onClick={() => {
                    setMobileMenuPage(prev => (prev + 1) % 9);
                  }}
                  className="relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer group w-full max-w-[60px] text-zinc-400 hover:text-white"
                  aria-label="Next Menu"
                >
                  <ArrowRight className="h-4.5 w-4.5 z-10 text-brand-purple group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10 text-brand-purple">Next</span>
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 4. TOAST NOTIFICATION FOR COMING SOON MODULES */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 glass-panel border-brand-purple/20 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
