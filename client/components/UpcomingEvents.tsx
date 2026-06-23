"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Ticket, ArrowRight } from "lucide-react";

interface EventItem {
  id: string;
  title: string;
  hostName: string;
  location: string;
  dateTime: string;
  initialSecondsLeft: number; // For countdown timer
  seatsAvailable: number;
  maxSeats: number;
  price: string;
}

export default function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "e1",
      title: "Full Moon Sea Kayaking & Shore BBQ",
      hostName: "Captain Vikram Sen",
      location: "Gokarna Coastline",
      dateTime: "June 25, 08:00 PM",
      initialSecondsLeft: 12450, // approx 3h 27m
      seatsAvailable: 3,
      maxSeats: 15,
      price: "₹2,800"
    },
    {
      id: "e2",
      title: "Basics of Artisan Woodworking",
      hostName: "Aditi Roy",
      location: "Design Studio, Bangalore",
      dateTime: "June 26, 11:00 AM",
      initialSecondsLeft: 64800, // approx 18 hours
      seatsAvailable: 5,
      maxSeats: 10,
      price: "₹1,800"
    },
    {
      id: "e3",
      title: "Midnight Heritage Fort Rappelling & Summit Camp",
      hostName: "Gaurav Negi",
      location: "Hampi Ruins, Karnataka",
      dateTime: "June 27, 09:30 PM",
      initialSecondsLeft: 151200, // approx 42 hours
      seatsAvailable: 2,
      maxSeats: 12,
      price: "₹3,400"
    }
  ]);

  // Real-time ticking timers in client state
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    // Initialize
    const initialTimers: Record<string, number> = {};
    events.forEach((evt) => {
      initialTimers[evt.id] = evt.initialSecondsLeft;
    });
    setTimers(initialTimers);

    // Tick
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] = next[key] - 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0 || isNaN(totalSeconds)) return "Registration Closed";
    
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${pad(hrs)}h : ${pad(mins)}m : ${pad(secs)}s`;
  };

  return (
    <section className="relative py-24 px-6 md:px-12 bg-brand-bg max-w-[1440px] mx-auto w-full" id="events">
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 mb-4">
            <Clock className="h-4 w-4 text-brand-cyan" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Time-Sensitive Off-beat Meets
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Upcoming Events
          </h2>
        </div>
        <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed text-left">
          Book seats in scheduled cohorts. Active live timers indicate booking limits and seating constraints.
        </p>
      </div>

      {/* Timeline Layout */}
      <div className="relative max-w-4xl mx-auto pl-8 sm:pl-12 border-l border-white/10 text-left space-y-12">
        {events.map((evt, index) => {
          const secondsLeft = timers[evt.id] || evt.initialSecondsLeft;
          const isClosed = secondsLeft <= 0;
          const warningLevel = evt.seatsAvailable <= 3;

          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline Bullet Nodes */}
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 h-6 w-6 rounded-full bg-brand-bg border border-white/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-brand-cyan shadow-sm shadow-brand-cyan animate-pulse" />
              </div>

              {/* Event card details */}
              <div className="p-4 sm:p-6 rounded-3xl glass-panel border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 hover:border-brand-purple/20 transition-all shadow-lg">
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-brand-cyan font-bold bg-brand-cyan/10 px-2.5 py-0.5 rounded-full">
                      <Calendar className="h-3.5 w-3.5" />
                      {evt.dateTime}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isClosed 
                        ? "bg-zinc-800 text-zinc-500" 
                        : warningLevel 
                          ? "bg-rose-500/10 text-rose-500 animate-pulse border border-rose-500/20" 
                          : "bg-white/5 text-zinc-400"
                    }`}>
                      {isClosed ? "Sold Out" : `${evt.seatsAvailable} seats left`}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {evt.title}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs font-semibold text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      {evt.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      Guide: {evt.hostName}
                    </span>
                  </div>
                </div>

                {/* Right Column: Countdown Clocks and CTAs */}
                <div className="flex flex-col sm:flex-row md:flex-col justify-between sm:items-center md:items-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5 gap-4">
                  <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
                    <div>
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-zinc-500 mb-1">Time Remaining</p>
                      <p className="text-xs sm:text-sm font-black text-white font-mono tracking-tight bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                        {formatCountdown(secondsLeft)}
                      </p>
                    </div>
                    
                    <div className="sm:hidden text-right">
                      <p className="text-[9px] uppercase font-bold text-zinc-500 mb-1">Price</p>
                      <p className="text-sm font-black text-white">{evt.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] uppercase font-bold text-zinc-500">Starts At</p>
                      <p className="text-sm font-black text-white">{evt.price}</p>
                    </div>
                    <button
                      disabled={isClosed}
                      className={`h-9 sm:h-11 px-4 sm:px-5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 w-full sm:w-auto flex-1 sm:flex-none ${
                        isClosed
                          ? "bg-zinc-800/40 text-zinc-600 cursor-not-allowed border border-white/5"
                          : "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 text-white shadow-md active:scale-95"
                      }`}
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
