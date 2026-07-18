"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Ticket } from "lucide-react";

const NOTIFICATIONS = [
  { id: 1, text: "Alex just booked Scuba Diving", icon: Ticket, color: "text-brand-indigo" },
  { id: 2, text: "Sarah earned Island Specialist", icon: CheckCircle2, color: "text-brand-amber" },
  { id: 3, text: "Mike joined a campfire", icon: Ticket, color: "text-brand-emerald" },
];

export default function FloatingNotifications() {
  const [activeNotif, setActiveNotif] = useState<number | null>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setActiveNotif(i);
      i = (i + 1) % NOTIFICATIONS.length;
      
      setTimeout(() => {
        setActiveNotif(null);
      }, 4000); // Hide after 4s
    }, 8000); // Show every 8s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-6 left-6 z-50 pointer-events-none hidden lg:block">
      <AnimatePresence>
        {activeNotif !== null && (
          <motion.div
            key={NOTIFICATIONS[activeNotif].id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-panel px-4 py-2.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-black/60"
          >
            {React.createElement(NOTIFICATIONS[activeNotif].icon, {
              className: `h-4 w-4 ${NOTIFICATIONS[activeNotif].color}`
            })}
            <span className="text-xs font-semibold text-white tracking-wide">
              {NOTIFICATIONS[activeNotif].text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
