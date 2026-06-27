"use client";

import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { DayData } from "@/types/booking";
import AvailabilityLegend from "./AvailabilityLegend";

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  operatingDays?: string[];
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  operatingDays = ["Mon", "Wed", "Sat"],
}: CalendarProps) {
  const [currentMonthView, setCurrentMonthView] = useState(0); // 0 = June, 1 = July, 2 = August

  const monthData = [
    { name: "June 2026", year: 2026, offset: 1, daysCount: 30, monthStr: "06" },
    { name: "July 2026", year: 2026, offset: 3, daysCount: 31, monthStr: "07" },
    { name: "August 2026", year: 2026, offset: 6, daysCount: 31, monthStr: "08" },
  ];

  const todayDateNum = 27; // June 27, 2026 per context

  const availableDaysInCurrentMonth = useMemo(() => 3, []);
  const shouldOpenNextMonth = availableDaysInCurrentMonth <= 5;

  const isMonthSelectable = useMemo(() => {
    if (currentMonthView === 0) return true;
    if (currentMonthView === 1) return shouldOpenNextMonth;
    return false;
  }, [currentMonthView, shouldOpenNextMonth]);

  const days: (DayData | null)[] = useMemo(() => {
    const list: (DayData | null)[] = [];
    const activeMonth = monthData[currentMonthView];
    
    for (let i = 0; i < activeMonth.offset; i++) {
      list.push(null);
    }
    
    const weekdaysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let d = 1; d <= activeMonth.daysCount; d++) {
      const dateStr = `2026-${activeMonth.monthStr}-${d.toString().padStart(2, "0")}`;
      const dateObj = new Date(2026, parseInt(activeMonth.monthStr) - 1, d);
      const weekdayName = weekdaysMap[dateObj.getDay()];

      let isPast = false;
      if (currentMonthView === 0) {
        isPast = d < todayDateNum;
      }

      // Operational days rule check
      const isOperational = operatingDays.includes(weekdayName);

      let status: DayData["status"] = "available";
      let slotsLeft = 8;
      let weather = "Clear Skies, 24°C";
      let popularity = "Moderate demand";

      if (isPast || !isOperational) {
        status = "unavailable";
        slotsLeft = 0;
      } else if (currentMonthView === 0 && d === todayDateNum) {
        status = "today";
        slotsLeft = 4;
        weather = "Light Rain, 21°C";
        popularity = "High demand (Today)";
      } else if (d % 6 === 0) {
        status = "fully-booked";
        slotsLeft = 0;
      } else if (d % 4 === 0) {
        status = "few-left";
        slotsLeft = Math.floor((d % 3) + 1);
      } else {
        slotsLeft = Math.floor((d % 5) + 5);
      }

      list.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isPast,
        status,
        slotsLeft,
        weather,
        popularity,
      });
    }

    // Pad to 42 cells (6 rows) for grid uniformity
    while (list.length < 42) {
      list.push(null);
    }

    return list;
  }, [currentMonthView, todayDateNum, operatingDays]);

  const getStatusStyles = (day: DayData, isSelected: boolean) => {
    if (day.isPast || day.status === "unavailable") {
      return "text-zinc-700 bg-white/[0.01] border-white/[0.03] cursor-not-allowed";
    }

    if (isSelected) {
      return "text-zinc-950 font-black bg-gradient-to-r from-brand-cyan to-brand-purple border-transparent shadow-lg shadow-brand-cyan/20 cursor-pointer";
    }

    if (!isMonthSelectable) {
      return "text-zinc-500 bg-white/[0.02] border-white/5 cursor-not-allowed opacity-40";
    }

    let effectiveStatus = day.status;
    if (effectiveStatus === "today") {
      effectiveStatus = day.slotsLeft <= 3 ? "few-left" : "available";
    }

    switch (effectiveStatus) {
      case "fully-booked":
        return "text-red-500/80 bg-red-950/10 border-red-500/20 hover:border-red-500/40 cursor-not-allowed";
      case "few-left":
        return "text-amber-500 bg-amber-950/10 border-amber-500/20 hover:border-amber-500/45 cursor-pointer";
      case "available":
      default:
        return "text-emerald-400 bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/45 cursor-pointer";
    }
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/5 flex flex-col gap-5 text-left relative overflow-visible bg-zinc-900/10 backdrop-blur-md w-full lg:max-w-[440px] shadow-xl">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
        <div className="flex items-center gap-2 select-none shrink-0">
          <CalendarIcon className="h-4.5 w-4.5 text-brand-cyan shrink-0" />
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Select Date</h3>
        </div>
        
        {/* Month navigation */}
        <div className="flex items-center gap-2 self-end xs:self-auto select-none">
          <button
            type="button"
            disabled={currentMonthView === 0}
            onClick={() => setCurrentMonthView((prev) => prev - 1)}
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="text-[10px] font-black text-white uppercase tracking-wider bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5 font-mono select-none whitespace-nowrap min-w-[90px] text-center">
            {monthData[currentMonthView].name}
          </span>

          <button
            type="button"
            disabled={currentMonthView === 2}
            onClick={() => setCurrentMonthView((prev) => prev + 1)}
            className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider select-none">
          {weekdays.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="w-full h-11 bg-transparent" />;
            }
            
            const isSelected = selectedDate === day.dateStr;
            const isClickable = isMonthSelectable && !day.isPast && day.status !== "unavailable" && day.status !== "fully-booked";
            const isToday = currentMonthView === 0 && day.dayNum === todayDateNum;

            return (
              <div
                key={day.dateStr}
                onClick={() => isClickable && onSelectDate(day.dateStr)}
                className={`w-full h-11 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-200 select-none ${getStatusStyles(
                  day,
                  isSelected
                )}`}
              >
                <span className="text-xs sm:text-sm font-bold leading-none">{day.dayNum}</span>

                {isMonthSelectable && !day.isPast && day.status !== "unavailable" && (
                  <span className={`text-[7px] sm:text-[8px] mt-1 font-mono font-black tracking-tighter leading-none ${
                    isSelected ? "text-zinc-950" :
                    day.status === "fully-booked" ? "text-red-500" :
                    day.status === "few-left" ? "text-amber-500" :
                    day.status === "today" ? (day.slotsLeft <= 3 ? "text-amber-500" : "text-emerald-400") : "text-emerald-400"
                  }`}>
                    {day.status === "fully-booked" ? "Full" : `${day.slotsLeft} L`}
                  </span>
                )}

                {isToday && !isSelected && (
                  <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider Operating Days Banner */}
      <div className="bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl flex items-center gap-2 text-[10px] font-mono text-zinc-400 select-none">
        <Info className="h-3.5 w-3.5 text-brand-cyan shrink-0" />
        <span>Experience operates on: <strong className="text-white">{operatingDays.join(", ")}</strong></span>
      </div>

      <AvailabilityLegend />
    </div>
  );
}
