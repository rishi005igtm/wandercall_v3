"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Share2,
  Trash2,
  AlertTriangle,
  Search,
  MoreVertical,
  Download,
  CloudSun,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Link,
  Users,
  Compass,
  Check
} from "lucide-react";

// Interfaces
interface Host {
  name: string;
  avatar: string;
  level: number;
}

interface Friend {
  name: string;
  avatar: string;
  compatibility: number;
}

interface Booking {
  id: string;
  experienceName: string;
  location: string;
  price: number;
  date: string;
  time: string;
  duration: string;
  durationHours: number;
  status: "Confirmed" | "Upcoming" | "Pending" | "Completed" | "Cancelled" | "Waitlist";
  ticketStatus: "Ready to Scan" | "Sync Pending" | "Verification Required" | "Archived" | "Refund Processed";
  host: Host;
  bookingId: string;
  attendeesCount: number;
  aiInsight: string;
  weatherForecast: string;
  compatibilityScore: number;
  calendarSynced: boolean;
  friends: Friend[];
  checklistCompleted: number;
  checklistTotal: number;
  image: string;
  qrCodeUrl: string;
}

// Initial Mock Bookings data (Rich operations panel)
const initialBookings: Booking[] = [
  {
    id: "book-1",
    experienceName: "Gokarna Cliff Trek & Beach Camping",
    location: "Gokarna, Karnataka",
    price: 3200,
    date: "25 June 2026",
    time: "7:30 AM",
    duration: "2 Days",
    durationHours: 48,
    status: "Upcoming",
    ticketStatus: "Ready to Scan",
    host: { name: "Arjun Mehta", avatar: "A", level: 18 },
    bookingId: "WNDR-GK-8402",
    attendeesCount: 2,
    aiInsight: "Remember to bring swimming gear and double-check rainproof layers.",
    weatherForecast: "Sunny, 28°C • Light Sea Breeze",
    compatibilityScore: 95,
    calendarSynced: true,
    friends: [
      { name: "Sara Khan", avatar: "S", compatibility: 88 },
      { name: "Arjun Mehta", avatar: "A", compatibility: 92 }
    ],
    checklistCompleted: 3,
    checklistTotal: 3,
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-2",
    experienceName: "Deep Sea Scuba Diving",
    location: "Netrani Island, Murdeshwar",
    price: 4500,
    date: "28 June 2026",
    time: "6:00 AM",
    duration: "1 Day",
    durationHours: 24,
    status: "Confirmed",
    ticketStatus: "Ready to Scan",
    host: { name: "Capt. Rohit", avatar: "R", level: 25 },
    bookingId: "WNDR-NT-9304",
    attendeesCount: 1,
    aiInsight: "Complete marine medical declaration forms 24 hours prior to launch.",
    weatherForecast: "Cloudy, 27°C • Waves 1.2m",
    compatibilityScore: 89,
    calendarSynced: true,
    friends: [],
    checklistCompleted: 2,
    checklistTotal: 3,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-3",
    experienceName: "Himalayan Base Camp Expedition",
    location: "Sankri, Uttarakhand",
    price: 12500,
    date: "15 July 2026",
    time: "5:30 AM",
    duration: "6 Days",
    durationHours: 144,
    status: "Pending",
    ticketStatus: "Verification Required",
    host: { name: "Tenzing Norgay Jr.", avatar: "T", level: 32 },
    bookingId: "WNDR-HM-1102",
    attendeesCount: 2,
    aiInsight: "Base camp temperature dropping to 4°C. Check high-altitude boots.",
    weatherForecast: "Light Snow, 5°C • Moderate Wind",
    compatibilityScore: 98,
    calendarSynced: false,
    friends: [
      { name: "Divya Kapoor", avatar: "D", compatibility: 78 }
    ],
    checklistCompleted: 1,
    checklistTotal: 4,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-4",
    experienceName: "Coorg Coffee Estate Trek",
    location: "Coorg, Karnataka",
    price: 1800,
    date: "20 June 2026",
    time: "8:00 AM",
    duration: "1 Day",
    durationHours: 8,
    status: "Completed",
    ticketStatus: "Archived",
    host: { name: "Sarah Jenkins", avatar: "S", level: 14 },
    bookingId: "WNDR-CR-4402",
    attendeesCount: 3,
    aiInsight: "Excellent hiking pace achieved. Feed logs synchronized to Memories.",
    weatherForecast: "Humid, 24°C • Rain Shadows",
    compatibilityScore: 76,
    calendarSynced: true,
    friends: [
      { name: "Sara Khan", avatar: "S", compatibility: 88 }
    ],
    checklistCompleted: 3,
    checklistTotal: 3,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-5",
    experienceName: "Old Bangalore Heritage Food Crawl",
    location: "Malleshwaram, Bangalore",
    price: 950,
    date: "23 June 2026",
    time: "6:30 PM",
    duration: "4 Hours",
    durationHours: 4,
    status: "Completed",
    ticketStatus: "Archived",
    host: { name: "Ananya Rao", avatar: "A", level: 20 },
    bookingId: "WNDR-BG-6295",
    attendeesCount: 4,
    aiInsight: "Remember to skip lunch before the crawl. Total 8 food items included.",
    weatherForecast: "Pleasant, 22°C • Clear Sky",
    compatibilityScore: 92,
    calendarSynced: true,
    friends: [
      { name: "Sara Khan", avatar: "S", compatibility: 88 },
      { name: "Divya Kapoor", avatar: "D", compatibility: 74 }
    ],
    checklistCompleted: 2,
    checklistTotal: 2,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-6",
    experienceName: "Bir Billing Tandem Paragliding",
    location: "Bir, Himachal Pradesh",
    price: 3500,
    date: "12 July 2026",
    time: "10:30 AM",
    duration: "2 Hours",
    durationHours: 2,
    status: "Confirmed",
    ticketStatus: "Sync Pending",
    host: { name: "Devendra Negi", avatar: "D", level: 22 },
    bookingId: "WNDR-BR-2201",
    attendeesCount: 1,
    aiInsight: "Favorable thermal drafts forecast. Pack windscreens and light jackets.",
    weatherForecast: "Sunny, 21°C • Wind NW 12km/h",
    compatibilityScore: 94,
    calendarSynced: false,
    friends: [],
    checklistCompleted: 1,
    checklistTotal: 2,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-7",
    experienceName: "Night Camping & Star Gazing",
    location: "Shedbal, Maharashtra",
    price: 1500,
    date: "04 July 2026",
    time: "8:00 PM",
    duration: "1 Day",
    durationHours: 14,
    status: "Waitlist",
    ticketStatus: "Verification Required",
    host: { name: "Milind Soman", avatar: "M", level: 12 },
    bookingId: "WNDR-SB-5503",
    attendeesCount: 2,
    aiInsight: "You are currently Position #2 on the waitlist. Confirmation likely in 24 hrs.",
    weatherForecast: "Clear sky, 18°C • Zero light pollution",
    compatibilityScore: 81,
    calendarSynced: true,
    friends: [
      { name: "Arjun Mehta", avatar: "A", compatibility: 92 }
    ],
    checklistCompleted: 1,
    checklistTotal: 3,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: "book-8",
    experienceName: "Riverside Forest Rafting",
    location: "Dandeli, Karnataka",
    price: 2400,
    date: "10 June 2026",
    time: "9:00 AM",
    duration: "1 Day",
    durationHours: 8,
    status: "Cancelled",
    ticketStatus: "Refund Processed",
    host: { name: "Vikram Sen", avatar: "V", level: 19 },
    bookingId: "WNDR-DN-7712",
    attendeesCount: 2,
    aiInsight: "Booking cancelled due to localized heavy discharge from dam gates.",
    weatherForecast: "Monsoon Showers, 25°C",
    compatibilityScore: 87,
    calendarSynced: false,
    friends: [],
    checklistCompleted: 0,
    checklistTotal: 3,
    image: "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=600&auto=format&fit=crop",
    qrCodeUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop"
  }
];

// Available Filter Status List
const filterTabs = [
  "All",
  "Upcoming",
  "Today",
  "This Week",
  "Completed",
  "Cancelled",
  "Pending",
  "Waitlist"
];

// Helper to determine if a date is within "this week" or "today"
const getRelativeDateType = (dateStr: string): { isToday: boolean; isThisWeek: boolean; daysRemaining: number } => {
  // Static parsed baseline for mock calendar (assume baseline is June 23, 2026)
  const currentBaseline = new Date("2026-06-23T00:00:00");

  // Format of mock dates is "25 June 2026"
  const parts = dateStr.split(" ");
  if (parts.length !== 3) {
    return { isToday: false, isThisWeek: false, daysRemaining: 99 };
  }
  const day = parseInt(parts[0], 10);
  const monthMap: Record<string, number> = {
    June: 5, July: 6, August: 7, September: 8
  };
  const month = monthMap[parts[1]] || 5;
  const year = parseInt(parts[2], 10);

  const targetDate = new Date(year, month, day);
  const timeDiff = targetDate.getTime() - currentBaseline.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return {
    isToday: daysDiff === 0,
    isThisWeek: daysDiff > 0 && daysDiff <= 7,
    daysRemaining: daysDiff
  };
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("All");

  // Filter dropdown
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Simulated Infinite Scroll
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const cardMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeCardMenuId) {
        const ref = cardMenuRefs.current[activeCardMenuId];
        if (ref && !ref.contains(event.target as Node)) {
          setActiveCardMenuId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeCardMenuId]);

  // Process filters and sorts
  const processedBookings = useMemo(() => {
    let list = [...bookings];

    // 1. Text Search (ID, Experience, Location, Host)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        b =>
          b.experienceName.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q) ||
          b.host.name.toLowerCase().includes(q) ||
          b.bookingId.toLowerCase().includes(q) ||
          b.date.toLowerCase().includes(q)
      );
    }

    // 2. Status Tabs Filters
    if (activeTab !== "All") {
      if (activeTab === "Upcoming") {
        list = list.filter(b => b.status === "Upcoming" || b.status === "Confirmed");
      } else if (activeTab === "Today") {
        list = list.filter(b => {
          const { isToday } = getRelativeDateType(b.date);
          return isToday && b.status !== "Cancelled";
        });
      } else if (activeTab === "This Week") {
        list = list.filter(b => {
          const { isThisWeek } = getRelativeDateType(b.date);
          return isThisWeek && b.status !== "Cancelled";
        });
      } else if (activeTab === "Completed") {
        list = list.filter(b => b.status === "Completed");
      } else if (activeTab === "Cancelled") {
        list = list.filter(b => b.status === "Cancelled");
      } else if (activeTab === "Pending") {
        list = list.filter(b => b.status === "Pending");
      } else if (activeTab === "Waitlist") {
        list = list.filter(b => b.status === "Waitlist");
      }
    }

    return list;
  }, [bookings, searchQuery, activeTab]);

  // Statistics calculation
  const stats = useMemo(() => {
    const upcoming = bookings.filter(b => b.status === "Upcoming" || b.status === "Confirmed").length;
    const completed = bookings.filter(b => b.status === "Completed").length;
    const pending = bookings.filter(b => b.status === "Pending").length;
    const total = bookings.filter(b => b.status !== "Cancelled").length;

    return {
      upcoming,
      completed,
      pending,
      total
    };
  }, [bookings]);

  // Simulated scroll loading trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < processedBookings.length) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount(prev => prev + 4);
            setIsLoadingMore(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [isLoadingMore, visibleCount, processedBookings.length]);

  // Handle operations menu commands
  const handleCalendarSync = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, calendarSynced: true } : b))
    );
    triggerToast("Synced with Google and Apple Calendar!");
    setActiveCardMenuId(null);
  };

  const handleDownloadTicket = (name: string) => {
    triggerToast(`Downloading PDF ticket: ${name}`);
    setActiveCardMenuId(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: "Cancelled", ticketStatus: "Refund Processed" }
          : b
      )
    );
    triggerToast("Booking successfully cancelled. Refund processed.");
    setActiveCardMenuId(null);
  };

  return (
    <div className="w-full px-3 md:px-12 py-4 md:py-8 max-w-[1400px] mx-auto flex flex-col gap-5 overflow-y-visible relative text-white">

      {/* 1. HEADER PANEL */}
      <header className="bg-white/[0.01] border border-white/5 p-4 md:p-5 rounded-2xl flex flex-col gap-4 text-left shadow-md w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="h-5 w-5 text-brand-cyan" />
              Bookings
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Manage your upcoming adventures and completed experiences.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[200px] md:w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(8);
                }}
                placeholder="Search name, host, ID..."
                className="w-full bg-zinc-950/60 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs outline-none text-zinc-300 placeholder-zinc-500 focus:border-white/10 transition-colors"
              />
            </div>

            {/* Export Tickets Button */}
            <button
              onClick={() => triggerToast("All active tickets exported as ZIP successfully!")}
              className="h-9 px-4 rounded-lg bg-zinc-900 border border-white/5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Tickets</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. BOOKING SUMMARY ROW (Max 80px desktop height, 4 compact cards) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full shrink-0">
        {/* Card 1 */}
        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl flex flex-col justify-center h-[70px] md:h-[80px] shadow-sm text-left">
          <span className="text-xl font-black font-mono text-brand-cyan">{stats.upcoming}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Upcoming Adventures</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl flex flex-col justify-center h-[70px] md:h-[80px] shadow-sm text-left">
          <span className="text-xl font-black font-mono text-brand-purple">{stats.completed}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Completed Journeys</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl flex flex-col justify-center h-[70px] md:h-[80px] shadow-sm text-left">
          <span className="text-xl font-black font-mono text-brand-amber">{stats.pending}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Pending Approval</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-2xl flex flex-col justify-center h-[70px] md:h-[80px] shadow-sm text-left">
          <span className="text-xl font-black font-mono text-white">{stats.total}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mt-0.5">Total Registered</span>
        </div>
      </section>

      {/* 3. STATUS FILTERS TABS ROW */}
      <div className="w-full border-b border-white/5 pb-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1" style={{ WebkitOverflowScrolling: "touch" }}>
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setVisibleCount(8);
                }}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap`}
                style={{
                  background: isActive ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.02)",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                  color: isActive ? "#06b6d4" : "#a1a1aa"
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. BOOKINGS GRID */}
      <section className="w-full relative min-h-[260px]">
        {processedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch justify-items-center">
            {processedBookings.slice(0, visibleCount).map((b) => {
              const isCardMenuOpen = activeCardMenuId === b.id;
              const isHovered = hoveredCardId === b.id;
              const relativeTime = getRelativeDateType(b.date);

              // Setup countdown tags
              let countdownText = "";
              if (b.status === "Completed") {
                countdownText = "COMPLETED";
              } else if (b.status === "Cancelled") {
                countdownText = "CANCELLED";
              } else if (relativeTime.daysRemaining === 0) {
                countdownText = "TODAY";
              } else if (relativeTime.daysRemaining === 1) {
                countdownText = "TOMORROW";
              } else if (relativeTime.daysRemaining > 0) {
                countdownText = `Starts in ${relativeTime.daysRemaining} Days`;
              } else {
                countdownText = `${Math.abs(relativeTime.daysRemaining)} Days Ago`;
              }

              // Status styles mapping
              const statusStyles = {
                Upcoming: { bg: "bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan" },
                Confirmed: { bg: "bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald" },
                Pending: { bg: "bg-brand-amber/10 border-brand-amber/20 text-brand-amber" },
                Completed: { bg: "bg-brand-purple/10 border-brand-purple/20 text-brand-purple" },
                Cancelled: { bg: "bg-rose-500/10 border-rose-500/20 text-rose-500" },
                Waitlist: { bg: "bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo" }
              }[b.status];

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredCardId(b.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  className={`bg-white/[0.01] border rounded-2xl overflow-hidden group hover:border-white/10 hover:-translate-y-1 transition-all duration-300 w-full flex flex-col justify-between relative shadow-sm hover:shadow ${b.status === "Upcoming" || b.status === "Confirmed"
                      ? "border-white/10 bg-white/[0.02]"
                      : "border-white/5"
                    }`}
                  style={{ height: '340px', position: 'relative', maxWidth: '480px', margin: '0 auto' }}
                >
                  {/* Card Cover Image (120px height, i.e. 35.3% of 340px) */}
                  <div style={{ height: '120px', position: 'relative', overflow: 'hidden' }} className="w-full shrink-0">
                    <img
                      src={b.image}
                      alt={b.experienceName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      className="group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Top gradient shadow for text/status visibility */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)',
                        zIndex: 15,
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Left overlay: Booking Status badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                      <span className={`text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${statusStyles.bg}`}>
                        {b.status}
                      </span>
                      <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/60 border border-white/5 text-zinc-400 backdrop-blur-md">
                        {b.ticketStatus}
                      </span>
                    </div>

                    {/* Download Ticket Button */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 30
                      }}
                    >
                      <button
                        onClick={() => handleDownloadTicket(b.experienceName)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '5px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#a1a1aa',
                          backdropFilter: 'blur(8px)',
                          cursor: 'pointer'
                        }}
                        className="hover:text-white hover:bg-zinc-900 transition-colors relative"
                        aria-label="Download Ticket"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quick Ticket Preview Hover Overlay (Desktop only) */}
                    <AnimatePresence>
                      {isHovered && b.status !== "Cancelled" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-zinc-950/90 z-20 flex items-center justify-center p-3 text-left backdrop-blur-sm transition-all hidden md:flex"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="h-16 w-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                              <QrCode className="h-full w-full text-zinc-950" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[7px] font-mono font-bold uppercase tracking-wider text-zinc-500">ID: {b.bookingId}</span>
                              <span className="text-[10px] font-black text-white truncate">{b.experienceName}</span>
                              <span className="text-[8px] font-semibold text-zinc-400 mt-0.5">Show QR code at base camp check-in.</span>
                              <span className="text-[8px] font-black text-brand-cyan uppercase tracking-widest mt-1">Ticket Active</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card Content Wrapper (Exactly 220px height, i.e. 64.7% of 340px) */}
                  <div
                    style={{ height: '220px' }}
                    className="p-3.5 flex flex-col justify-between overflow-hidden shrink-0 text-left"
                  >

                    {/* Top Content Row */}
                    <div className="flex flex-col gap-0.5">
                      {/* Name & Compatibility Score */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-black text-white leading-tight line-clamp-1 group-hover:text-brand-cyan transition-colors flex-1">
                          {b.experienceName}
                        </h3>
                        <span className="text-[8px] font-mono font-bold text-zinc-500 shrink-0">
                          {b.compatibilityScore}% Compatibility
                        </span>
                      </div>

                      {/* Location text */}
                      <div className="text-[9px] text-zinc-400 font-semibold truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-brand-cyan shrink-0" />
                        <span>{b.location}</span>
                      </div>

                      {/* Schedule Panel: Date, Countdown & Sync */}
                      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded-xl mt-2">
                        <div className="flex flex-col">
                          <span className="text-[7.5px] font-bold text-zinc-500 uppercase tracking-wider">Date & Time</span>
                          <span className="text-[9px] font-black text-zinc-200 mt-0.5">
                            {b.date} • {b.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${b.status === "Completed"
                              ? "bg-brand-purple/10 border-brand-purple/20 text-brand-purple"
                              : b.status === "Cancelled"
                                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                : "bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan"
                            }`}>
                            {countdownText}
                          </span>
                          {b.calendarSynced && (
                            <span className="p-1 rounded-md bg-zinc-900 border border-white/10 text-brand-emerald flex items-center justify-center shrink-0" title="Calendar Synced">
                              <CheckCircle2 className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Section: AI Insight or Weather Tip */}
                    <div className="flex items-start gap-1.5 border-t border-b border-white/5 py-2 my-1">
                      <div className="h-4.5 w-4.5 rounded bg-brand-purple/10 border border-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-2.5 w-2.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[8.5px] font-semibold text-zinc-300 leading-snug line-clamp-1">
                          {b.aiInsight}
                        </p>
                        <span className="text-[7.5px] font-medium text-zinc-500 flex items-center gap-1 mt-0.5">
                          <CloudSun className="h-2.5 w-2.5 text-brand-cyan shrink-0" />
                          Weather: {b.weatherForecast}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Attendees & Checklist state */}
                    <div className="flex items-center justify-between">
                      {/* Left: Friends Avatars List */}
                      <div className="flex items-center gap-2">
                        {b.friends.length > 0 ? (
                          <div className="flex items-center -space-x-1.5">
                            {b.friends.map((f, i) => (
                              <div
                                key={i}
                                className="h-5 w-5 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple p-0.5 border border-zinc-950 flex items-center justify-center text-[7px] font-black text-white shrink-0 shadow-sm"
                                title={`${f.name} - Compatibility: ${f.compatibility}%`}
                              >
                                {f.avatar}
                              </div>
                            ))}
                            <span className="text-[7.5px] font-mono text-zinc-500 ml-1.5 select-none shrink-0">
                              +{b.attendeesCount} Going
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[7.5px] font-bold text-zinc-500">
                            <User className="h-3.5 w-3.5 text-zinc-600" />
                            <span>Solo Adventure</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Readiness check checklist */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[7.5px] font-mono font-bold text-zinc-500">
                          Ready: {b.checklistCompleted}/{b.checklistTotal}
                        </span>
                        <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple"
                            style={{ width: `${(b.checklistCompleted / b.checklistTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* CTA Area (View details and direct view ticket) */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-auto shrink-0">
                      <button
                        onClick={() => triggerToast(`Preview Ticket QR for: ${b.experienceName} (ID: ${b.bookingId})`)}
                        disabled={b.status === "Cancelled"}
                        className={`h-9 rounded-xl text-white font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 flex-1 cursor-pointer ${b.status === "Cancelled"
                            ? "bg-zinc-800 border border-white/5 text-zinc-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 active:scale-98"
                          }`}
                      >
                        <QrCode className="h-3.5 w-3.5 shrink-0" />
                        <span>View Ticket</span>
                      </button>
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={b.status === "Cancelled" || b.status === "Completed"}
                        className={`h-9 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all flex-1 cursor-pointer flex items-center justify-center gap-1 ${
                          b.status === "Cancelled" || b.status === "Completed"
                            ? "bg-zinc-800/40 border border-white/5 text-zinc-600 cursor-not-allowed"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/30 active:scale-98"
                        }`}
                      >
                        <span>Cancel Booking</span>
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State Dashboard Card */
          <div className="flex flex-col items-center justify-center text-center p-6 border border-white/5 bg-white/[0.01] rounded-3xl max-w-sm mx-auto my-12 shadow-md shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 mb-3">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">No adventures found</h3>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mt-1 px-4">
              You haven't booked any experiences in this category yet. Start mapping your next journey!
            </p>
            <div className="flex items-center gap-2.5 mt-4 w-full justify-center">
              <button
                onClick={() => triggerToast("Navigating to Discover Feed...")}
                className="h-8 px-4 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-[9px] font-black uppercase tracking-wider text-white hover:brightness-110 transition-all cursor-pointer"
              >
                Discover Adventures
              </button>
              <button
                onClick={() => {
                  setActiveTab("All");
                  setSearchQuery("");
                  setVisibleCount(8);
                }}
                className="h-8 px-4 rounded-xl bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-[9px] font-bold uppercase tracking-wider text-white transition-all cursor-pointer"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. SIMULATED INFINITE SCROLL */}
      {processedBookings.length > visibleCount && (
        <div ref={loaderRef} className="py-6 w-full flex flex-col items-center justify-center shrink-0">
          {isLoadingMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* Skeleton Booking Card 1 */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden h-[340px] p-3.5 flex flex-col justify-between animate-pulse">
                <div className="h-[38%] bg-zinc-900/60 rounded-xl w-full" />
                <div className="h-[62%] flex flex-col justify-between pt-3">
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 bg-zinc-900 rounded-md w-3/4" />
                    <div className="h-3 bg-zinc-900 rounded-md w-1/2" />
                  </div>
                  <div className="h-8 bg-zinc-900/40 rounded-xl w-full" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-zinc-900 rounded-full w-12" />
                    <div className="h-3 bg-zinc-900 rounded-md w-16" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                    <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
              {/* Skeleton Booking Card 2 */}
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden h-[340px] p-3.5 flex flex-col justify-between animate-pulse">
                <div className="h-[38%] bg-zinc-900/60 rounded-xl w-full" />
                <div className="h-[62%] flex flex-col justify-between pt-3">
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 bg-zinc-900 rounded-md w-3/4" />
                    <div className="h-3 bg-zinc-900 rounded-md w-1/2" />
                  </div>
                  <div className="h-8 bg-zinc-900/40 rounded-xl w-full" />
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-zinc-900 rounded-full w-12" />
                    <div className="h-3 bg-zinc-900 rounded-md w-16" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                    <div className="h-8 bg-zinc-900 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Done scroll marker */}
      {processedBookings.length > 0 && processedBookings.length <= visibleCount && (
        <div className="py-6 text-center text-[10px] text-zinc-600 font-mono font-bold uppercase tracking-widest w-full select-none shrink-0">
          You've explored all booked experiences!
        </div>
      )}

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-zinc-900/95 border border-white/10 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <div className="h-6 w-6 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs font-semibold text-zinc-300">
              {toastMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
