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
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home
} from "lucide-react";

import { useAppSelector } from "@/lib/store/store";
import { useCurrentUserQuery } from "@/hooks/api/useUserQueries";

// Sidebar Links
const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Wishlist", icon: Heart, href: "/profile/wishlist" },
  { name: "Bookings", icon: Calendar, href: "/profile/bookings" },
  { name: "Quests", icon: Award, href: "/profile/quests", comingSoon: true },
  { name: "Chat", icon: MessageSquare, href: "/profile/friends" },
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

  const authState = useAppSelector((state) => state.auth);
  const { data: currentUser } = useCurrentUserQuery(authState.isAuthenticated);

  const displayName = currentUser?.displayName || authState.name || "Explorer";
  const avatarUrl = currentUser?.avatarUrl;
  const initial = displayName.trim().charAt(0).toUpperCase() || "E";
  const level = currentUser?.level || 1;
  const xpCurrent = currentUser?.xpCurrent || 1000;
  const xpNext = currentUser?.xpNext || 2000;
  const xpPercentage = Math.min(Math.round((xpCurrent / xpNext) * 100), 100);

  // Mobile Bottom Nav items ordered explicitly: Home (left), Wishlist, Profile (middle), Bookings, Chat (right)
  const mobileNavItems = useMemo(() => {
    const getNavItem = (name: string) => navItems.find(item => item.name === name)!;
    return [
      getNavItem("Home"),
      getNavItem("Wishlist"),
      getNavItem("Profile"),
      getNavItem("Bookings"),
      getNavItem("Chat"),
    ];
  }, []);

  // Trigger interactive coming-soon toast for future nested pages
  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (
      item.comingSoon || (
        item.href !== "/" &&
        item.href !== "/profile" &&
        item.href !== "/profile/wishlist" &&
        item.href !== "/profile/bookings" &&
        item.href !== "/profile/friends" &&
        item.href !== "/profile/settings"
      )
    ) {
      e.preventDefault();
      setToastMessage(`${item.name} module will unlock in the next phase!`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const isChatRoute =
    pathname?.startsWith('/profile/friends/') &&
    pathname !== '/profile/friends' &&
    pathname !== '/profile/friends/' &&
    !pathname?.startsWith('/profile/friends/search');

  const staticSubPaths = ['wishlist', 'bookings', 'quests', 'friends', 'settings'];
  const isDynamicProfileRoute = pathname?.startsWith('/profile/') &&
    !staticSubPaths.some(sub => pathname === `/profile/${sub}` || pathname.startsWith(`/profile/${sub}/`)) &&
    pathname !== '/profile' &&
    pathname !== '/profile/';

  const isSearchRoute = pathname?.startsWith('/profile/friends/search');
  const isFriendsWorkspace = pathname?.startsWith('/profile/friends');

  const shouldShowBottomNav = !isDynamicProfileRoute && !isChatRoute && !isSearchRoute;

  const handleSmartBack = () => {
    if (pathname === '/profile/friends/search') {
      router.replace('/profile/friends');
    } else if (pathname === '/profile/friends' || pathname === '/profile/friends/') {
      router.push('/profile');
    } else if (pathname === '/profile' || pathname === '/profile/') {
      router.push('/');
    } else if (pathname?.startsWith('/profile/')) {
      router.push('/profile');
    } else {
      router.push('/profile');
    }
  };

  if (isChatRoute) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-mesh-premium text-gray-900 overflow-hidden touch-none">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh-premium text-gray-900 font-sans flex flex-col md:flex-row relative overflow-x-hidden">

      {/* 1. FIXED LEFT SIDEBAR: Expanded on Desktop, Collapsed to icon-only on Tablet, Hidden on Mobile */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 h-screen z-40 bg-white/60 border-r border-gray-200 backdrop-blur-xl flex-col justify-between p-4 lg:p-6 transition-all duration-300 w-[80px] lg:w-[280px] overflow-y-auto no-scrollbar overscroll-y-contain">

        {/* Top: Branding logo and user details */}
        <div className="flex flex-col gap-6 w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2 mb-2 justify-center lg:justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-cyan via-brand-indigo to-brand-purple flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">W</div>
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent hidden lg:block">wandercall</span>
          </div>

          {/* User passport profile avatar block */}
          <div className="flex flex-col lg:flex-row items-center gap-3 bg-white border border-gray-200 p-3 rounded-2xl w-full shadow-sm">
            <div className="relative h-10 w-10 shrink-0">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center font-black text-sm text-white border border-gray-100 shadow-sm overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-brand-emerald border-2 border-white animate-pulse" />
            </div>
            <div className="hidden lg:flex flex-col text-left min-w-0">
              <span className="text-xs font-black truncate flex items-center gap-1 text-gray-900">
                {displayName}
                <span className="h-3 w-3 text-brand-indigo"><Sparkles className="h-3 w-3 fill-brand-indigo/20" /></span>
              </span>
              <span className="text-[10px] text-gray-500 font-mono truncate">Level {level} Explorer</span>
            </div>
          </div>

          {/* XP Progress Bar (Desktop only) */}
          <div className="hidden lg:flex flex-col gap-1.5 px-1">
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-600 font-bold">
              <span>XP {xpCurrent.toLocaleString()} / {xpNext.toLocaleString()}</span>
              <span>{xpPercentage}%</span>
            </div>
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan rounded-full transition-all duration-500" style={{ width: `${xpPercentage}%` }} />
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
                  className={`relative flex items-center justify-center lg:justify-start gap-3.5 px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer group ${isActive
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm"
                    }`}
                >
                  {/* Active Indicator Pill */}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan rounded-xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105 z-10 ${isActive ? "text-white" : "text-gray-500 group-hover:text-gray-900"
                    }`} />
                  <span className="hidden lg:inline truncate z-10 flex-1">{item.name}</span>
                  {(item as any).comingSoon && (
                    <span className={`hidden lg:inline z-10 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border ml-auto ${isActive ? "text-white bg-white/20 border-white/30" : "text-brand-amber bg-brand-amber/10 border-brand-amber/20"}`}>
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="w-full">
          <Link
            href="/login"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-rose-600 bg-white border border-gray-100 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all cursor-pointer w-full group"
          >
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex h-7 w-7 rounded-full bg-brand-indigo items-center justify-center shrink-0">
                <span className="text-white font-black text-[10px]">W</span>
              </div>
              <span className="hidden lg:inline text-rose-600">Logout</span>
            </div>
            <LogOut className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform text-rose-500" />
          </Link>
        </div>
      </aside>

      {/* 2. TOP HEADER & MAIN WORKSPACE AREA */}
      <main className={`flex-1 min-w-0 md:pl-[80px] lg:pl-[280px] flex flex-col ${isFriendsWorkspace
          ? "h-[100dvh] md:h-screen max-h-[100dvh] md:max-h-screen overflow-hidden"
          : "h-[100dvh] md:h-auto max-h-[100dvh] md:max-h-none overflow-hidden md:overflow-visible"
        } ${shouldShowBottomNav ? "pb-20 md:pb-0" : "pb-0"} md:pb-0`}>
        <header className={`h-20 w-full px-4 lg:px-8 ${pathname?.startsWith('/profile/friends/search') ? "hidden md:flex" : "flex"} items-center justify-between bg-transparent shrink-0 pt-4`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSmartBack}
              className="md:hidden flex h-9 w-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all cursor-pointer items-center justify-center shrink-0 shadow-sm"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-widest text-brand-indigo flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-purple" />
                Explorer Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-[10px] font-black text-gray-700 tracking-wider">
              <span className="h-2 w-2 rounded-full bg-brand-emerald animate-pulse" />
              <span>Node Active</span>
            </div>

            {/* Quick Settings Icon */}
            <button
              onClick={() => router.push('/profile/settings')}
              className="flex h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all cursor-pointer items-center justify-center shrink-0"
              aria-label="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => {
                setToastMessage("Notifications will be configurable in Next Phase!");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition-all cursor-pointer items-center justify-center shrink-0 relative"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border border-white" />
            </button>
          </div>
        </header>

        {/* Nested route content */}
        <div className={`w-full flex-1 relative flex flex-col min-h-0 ${isFriendsWorkspace
            ? "overflow-hidden"
            : "overflow-y-auto md:overflow-visible overscroll-contain"
          }`}>
          {children}
        </div>
      </main>

      {/* 3. MOBILE FLOATING BOTTOM NAVIGATION: Visually clean mobile bar with paginated menus and loop next button */}
      {shouldShowBottomNav && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#111] backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl h-14 p-1 px-2 flex items-center justify-between overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="mobile-nav"
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
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/" ? pathname === "/" :
                    item.href === "/profile" ? pathname === "/profile" || pathname === "/profile/" :
                      pathname?.startsWith(item.href);

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
                      className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer group w-full max-w-[60px] ${isActive ? "text-white" : "text-zinc-400 hover:text-white"
                        }`}
                      aria-label={item.name}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobile-nav-pill"
                          className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl z-0"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className="h-4.5 w-4.5 z-10" />
                      <span className="text-[7.5px] font-extrabold uppercase tracking-wider mt-0.5 z-10 truncate max-w-full">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
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
