"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Calendar, Users, Radio, Award, MessageSquare, Search, Menu, X, Globe, User } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Use a mutable ref for scroll offset tracking to bypass React state updates on every frame
  const lastScrollYRef = React.useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Glass effect toggle - only update state if value actually changes
      const scrolled = currentScrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
      
      // Hide on scroll down, show on scroll up - only update state if value actually changes
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

  const navLinks = [
    { name: "Explore", icon: Compass, href: "#explore" },
    { name: "Experiences", icon: Calendar, href: "#experiences" },
    { name: "Community", icon: Users, href: "#community" },
    { name: "Campfires", icon: Radio, href: "#campfires" },
    { name: "Quests", icon: Award, href: "#quests" },
    { name: "AI Assistant", icon: MessageSquare, href: "#ai-assistant" }
  ];

  return (
    <>
      <motion.nav
        initial={{ 
          y: 0, 
          backgroundColor: "rgba(11, 11, 11, 0)", 
          backdropFilter: "blur(0px)",
          boxShadow: "0 0 0px rgba(0,0,0,0)"
        }}
        animate={{ 
          y: isVisible ? 0 : -100,
          backgroundColor: isScrolled ? "rgba(11, 11, 11, 0.85)" : "rgba(11, 11, 11, 0)",
          backdropFilter: isScrolled ? "blur(8px)" : "blur(0px)",
          boxShadow: isScrolled ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)" : "0 0 0px rgba(0,0,0,0)"
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 border-none"
      >
        <div className="mx-auto max-w-[1440px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple">
              <Globe className="h-5 w-5 text-white animate-pulse" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple blur-md opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans bg-clip-text">
              Wandercall
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Right side interactions */}
          <div className="flex items-center gap-4">
            {/* Search Toggle */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Become Host */}
            <a 
              href="#host" 
              className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-brand-cyan hover:text-white transition-colors"
            >
              Become Host
            </a>

            {/* Login / Profile */}
            <Link 
              href="/login" 
              className="p-2 rounded-full border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <User className="h-4 w-4" />
            </Link>

            {/* CTA */}
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo/90 hover:to-brand-purple/90 text-white shadow-lg shadow-brand-indigo/25 hover:shadow-brand-indigo/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Login
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 backdrop-blur-sm"
            />

            {/* Panel */}
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

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 text-base font-semibold text-zinc-300 hover:text-white transition-all"
                      >
                        <Icon className="h-5 w-5 text-brand-indigo" />
                        {link.name}
                      </motion.a>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
