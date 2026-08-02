"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, ShieldCheck, Info, Check, X } from "lucide-react";
import { Slot } from "@/types/booking";

interface BookingSummaryProps {
  experienceTitle: string;
  experiencePrice: number;
  selectedDate: string;
  selectedSlot: Slot | null;
  adultsCount: number;
  childrenCount: number;
  isPrivateGroup: boolean;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: string;
  setAppliedCoupon: (code: string) => void;
  couponError: string;
  setCouponError: (error: string) => void;
  baseSubtotal: number;
  privateGroupFee: number;
  groupDiscount: number;
  couponDiscount: number;
  taxes: number;
  grandTotal: number;
}

export default function BookingSummary({
  experienceTitle,
  selectedDate,
  selectedSlot,
  adultsCount,
  childrenCount,
  isPrivateGroup,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  couponError,
  setCouponError,
  baseSubtotal,
  privateGroupFee,
  groupDiscount,
  couponDiscount,
  taxes,
  grandTotal,
}: BookingSummaryProps) {
  const totalTravelers = adultsCount + childrenCount;

  const coupons = useMemo(() => ({
    WANDER20: { type: "percent" as const, value: 20, desc: "20% OFF" },
    WELCOME10: { type: "percent" as const, value: 10, desc: "10% OFF" },
    ADVENTURE30: { type: "percent" as const, value: 30, desc: "30% OFF" },
    FREE500: { type: "flat" as const, value: 500, desc: "₹500 OFF" },
  }), []);

  // Auto-apply if exact match on typing
  React.useEffect(() => {
    const codeUpper = couponCode.toUpperCase().trim();
    if (codeUpper === "") {
      setAppliedCoupon("");
      setCouponError("");
      return;
    }
    if (coupons[codeUpper as keyof typeof coupons]) {
      setAppliedCoupon(codeUpper);
      setCouponError("");
    } else {
      if (appliedCoupon && appliedCoupon !== codeUpper) {
        setAppliedCoupon("");
      }
    }
  }, [couponCode, coupons, appliedCoupon, setAppliedCoupon, setCouponError]);

  const handleApplyCoupon = () => {
    const codeUpper = couponCode.toUpperCase().trim();
    if (codeUpper === "") {
      setCouponError("Please enter a coupon code");
      setAppliedCoupon("");
      return;
    }
    if (coupons[codeUpper as keyof typeof coupons]) {
      setAppliedCoupon(codeUpper);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon("");
    }
  };

  const handleSelectCoupon = (code: string) => {
    setCouponCode(code);
    setAppliedCoupon(code);
    setCouponError("");
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon("");
    setCouponError("");
  };

  const showRecommendation = totalTravelers === 3;

  return (
    <div className="glass-panel p-6 rounded-3xl border border-gray-200 bg-white flex flex-col gap-5 text-left sticky top-28 w-full shadow-2xl">
      {/* Experience title and details */}
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block leading-none">Booking Summary</span>
        <h4 className="text-base font-black text-gray-900 uppercase tracking-tight mt-2 line-clamp-1">{experienceTitle}</h4>
        
        {selectedDate && selectedSlot ? (
          <span className="text-[10px] font-mono text-brand-cyan font-bold block mt-1.5 uppercase">
            📅 {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} • 🕒 {selectedSlot.time}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-gray-500 font-bold block mt-1.5 uppercase">
            Please select date & slot time
          </span>
        )}
      </div>

      {/* Coupon Code Input */}
      <div className="flex flex-col gap-2.5 border-b border-gray-200 pb-4">
        <label className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 select-none">
          <Ticket className="h-4 w-4 text-brand-cyan shrink-0" /> Coupon Code
        </label>
        <div className="relative flex items-center">
          <input suppressHydrationWarning
            type="text"
            placeholder="Enter code (e.g. WANDER20)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className={`w-full h-9 bg-gray-100 border rounded-xl pl-3 pr-16 text-xs text-gray-900 outline-none transition-all uppercase tracking-wider ${
              appliedCoupon
                ? "border-emerald-500/50 focus:border-emerald-500 shadow-md shadow-emerald-500/5"
                : couponError
                ? "border-red-500/50 focus:border-red-500 shadow-md shadow-red-500/5"
                : "border-gray-300 focus:border-brand-cyan"
            }`}
          />
          {appliedCoupon ? (
            <button suppressHydrationWarning
              type="button"
              onClick={handleRemoveCoupon}
              className="absolute right-1.5 h-6 px-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 text-[9px] font-black uppercase transition-all tracking-wider cursor-pointer flex items-center gap-1"
            >
              <X className="h-2.5 w-2.5" /> Clear
            </button>
          ) : (
            <button suppressHydrationWarning
              type="button"
              onClick={handleApplyCoupon}
              className="absolute right-1.5 h-6 px-2.5 rounded-lg bg-brand-cyan hover:bg-brand-cyan/85 text-zinc-950 text-[9px] font-black uppercase transition-all tracking-wider cursor-pointer"
            >
              Apply
            </button>
          )}
        </div>

        {/* Status messages */}
        {appliedCoupon && (
          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>
              Code <span className="font-bold">{appliedCoupon}</span> applied! ({coupons[appliedCoupon as keyof typeof coupons]?.desc})
            </span>
          </span>
        )}
        {couponError && (
          <span className="text-[10px] text-red-400 font-medium flex items-center gap-1">
            <X className="h-3.5 w-3.5 shrink-0" />
            <span>{couponError}</span>
          </span>
        )}

        {/* Available coupons pills */}
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[8px] text-gray-500 font-bold uppercase select-none">Available:</span>
          {Object.keys(coupons).map((code) => (
            <button suppressHydrationWarning
              key={code}
              type="button"
              onClick={() => handleSelectCoupon(code)}
              className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                appliedCoupon === code
                  ? "bg-brand-cyan/20 border-brand-cyan text-brand-cyan"
                  : "bg-gray-100 border-gray-200 hover:border-white/20 text-gray-500 hover:text-gray-900"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="flex flex-col gap-3 text-xs font-mono font-bold text-gray-500">
        <div className="flex justify-between">
          <span>Adventures rate ({totalTravelers} Pax):</span>
          <span className="text-gray-900">₹{baseSubtotal.toLocaleString("en-IN")}</span>
        </div>

        {isPrivateGroup && (
          <div className="flex justify-between text-brand-purple">
            <span>Private Group fee:</span>
            <span>+ ₹{privateGroupFee.toLocaleString("en-IN")}</span>
          </div>
        )}

        {groupDiscount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Group Discount (10% OFF):</span>
            <span>- ₹{groupDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span className="flex items-center gap-1.5"><Ticket className="h-3.5 w-3.5" /> Coupon ({appliedCoupon}):</span>
            <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}

        <div className="flex justify-between text-[11px] text-gray-500">
          <span>Taxes & GST (18%):</span>
          <span>+ ₹{taxes.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-3 mt-1 text-gray-900 items-baseline">
          <span className="font-sans font-black text-sm uppercase tracking-wide">Grand Total:</span>
          <motion.span 
            key={grandTotal}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-brand-cyan text-xl font-black font-sans"
          >
            ₹{grandTotal.toLocaleString("en-IN")}
          </motion.span>
        </div>
      </div>

      {/* Smart Group Discount Recommendation Widget */}
      <AnimatePresence>
        {showRecommendation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-1 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-brand-cyan/10 border border-emerald-500/20 flex gap-3 items-start">
              <Info className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Add 1 more for 10% OFF!</h5>
                <p className="text-[10px] text-emerald-700 leading-relaxed font-sans font-medium">
                  Groups of 4+ automatically receive a 10% discount on the entire booking base rate.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-2 bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="block text-[10px] text-gray-900 font-bold uppercase tracking-wider mb-0.5">Free Cancellation up to 72 hrs</span>
          <span className="block text-[9px] text-gray-500 font-medium font-sans leading-relaxed">
            Get a full 100% refund in case you cancel before 3 days of booking departure.
          </span>
        </div>
      </div>
    </div>
  );
}
