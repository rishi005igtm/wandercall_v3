"use client";

import React, { useState } from "react";
import { Globe, Send, Mail } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  const footerLinks = [
    {
      title: "Wandercall",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Blog Stories", href: "#" },
        { name: "Press Kit", href: "#" }
      ]
    },
    {
      title: "Ecosystem",
      links: [
        { name: "Explore Map", href: "#" },
        { name: "Daily Quests", href: "#" },
        { name: "Campfires Voice", href: "#" },
        { name: "Adventure DNA", href: "#" }
      ]
    },
    {
      title: "Host Program",
      links: [
        { name: "Create Experience", href: "#" },
        { name: "Host Dashboard", href: "#" },
        { name: "Safety Guidelines", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Terms of Use", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Payment Security", href: "#" },
        { name: "Refund Policies", href: "#" }
      ]
    }
  ];

  return (
    <footer className="w-full bg-black/80 border-t border-white/5 py-16 px-6 md:px-12 text-left relative z-20">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
        {/* Logo and newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <a href="#" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple flex items-center justify-center">
              <Globe className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Wandercall
            </span>
          </a>

          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
            The world's first adventure network mapping real-world experiences. Build authentic memory records, verify your DNA, and meet like-minded explorers.
          </p>

          {/* Newsletter subscription form */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-300">Newsletter</p>
            {subscribed ? (
              <p className="text-xs font-semibold text-brand-emerald">Thank you for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-cyan"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Directory links */}
        {footerLinks.map((col) => (
          <div key={col.title} className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">
              {col.title}
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-500 font-semibold">
              {col.links.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Under line credits */}
      <div className="max-w-[1440px] mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-zinc-500 text-xs font-semibold">
        <span>© 2026 Wandercall Technologies Private Limited. All rights reserved.</span>
        <div className="flex gap-6">
          <a href="#twitter" className="hover:text-white transition-colors" aria-label="Twitter">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#instagram" className="hover:text-white transition-colors" aria-label="Instagram">
            <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#github" className="hover:text-white transition-colors" aria-label="Github">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
