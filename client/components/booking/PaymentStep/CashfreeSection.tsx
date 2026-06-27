"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, Zap, Lock, CreditCard, Smartphone, Building, Shield } from "lucide-react";
import { Slot, TravelerData, ExperienceData } from "@/types/booking";

interface CashfreeSectionProps {
  selectedPaymentGateway: string;
  setSelectedPaymentGateway: (gateway: string) => void;
  paymentStep: "idle" | "handshake" | "gateway" | "success";
  setPaymentStep: (step: "idle" | "handshake" | "gateway" | "success") => void;
  experience: ExperienceData;
  selectedDate: string;
  selectedSlot: Slot | null;
  totalTravelers: number;
  travelersDetails: TravelerData[];
  grandTotal: number;
  onSimulateSuccess: () => void;
}

export default function CashfreeSection({
  paymentStep,
  setPaymentStep,
  experience,
  selectedDate,
  selectedSlot,
  totalTravelers,
  travelersDetails,
  grandTotal,
  onSimulateSuccess,
}: CashfreeSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInitiateCashfree = () => {
    setPaymentStep("handshake");
    setTimeout(() => {
      setPaymentStep("gateway");
    }, 1800);
  };

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/5 bg-zinc-900/10 flex flex-col gap-5 sm:gap-6 text-left shadow-xl w-full">
      {/* Header */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shrink-0">
            <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">Secure Cashfree Payment Gateway</h3>
            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 block mt-0.5">Encrypted 256-bit bank grade transaction</span>
          </div>
        </div>
        <span className="text-[8px] sm:text-[9px] font-mono font-black text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full uppercase tracking-wider shrink-0 self-start xs:self-auto">
          PCI-DSS v4.0 Certified
        </span>
      </div>

      {/* Trust & Supported Channels Card */}
      <div className="bg-white/[0.02] border border-white/5 p-3.5 sm:p-5 rounded-2xl flex flex-col gap-4 sm:gap-5">
        <div>
          <span className="text-[9px] font-mono font-bold text-brand-cyan uppercase tracking-widest block">Instant Booking Confirmation</span>
          <h4 className="text-xs sm:text-base font-black text-white uppercase mt-0.5">Pay Safely & Directly via Cashfree SDK</h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed font-sans mt-1">
            Clicking pay opens Cashfree&apos;s secure checkout overlay supporting all major Indian payment channels with zero convenience fees and instant refund protection.
          </p>
        </div>

        {/* Channel Icons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-white/5">
          <div className="bg-zinc-950/50 border border-white/5 p-2.5 sm:p-3 rounded-xl flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-brand-cyan font-mono text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <Smartphone className="h-3.5 w-3.5 shrink-0" /> Instant UPI
            </div>
            <span className="text-[8px] text-zinc-400 font-mono sm:hidden">GPay, PhonePe+</span>
            <span className="text-[9px] text-zinc-400 font-mono hidden sm:block">GPay, PhonePe, Paytm, BHIM</span>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 p-2.5 sm:p-3 rounded-xl flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-brand-purple font-mono text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <CreditCard className="h-3.5 w-3.5 shrink-0" /> All Cards
            </div>
            <span className="text-[8px] text-zinc-400 font-mono sm:hidden">Visa, RuPay+</span>
            <span className="text-[9px] text-zinc-400 font-mono hidden sm:block">Visa, Mastercard, RuPay, Amex</span>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 p-2.5 sm:p-3 rounded-xl flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <Building className="h-3.5 w-3.5 shrink-0" /> Net Banking
            </div>
            <span className="text-[8px] text-zinc-400 font-mono sm:hidden">50+ Banks</span>
            <span className="text-[9px] text-zinc-400 font-mono hidden sm:block">50+ Major Indian Banks</span>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 p-2.5 sm:p-3 rounded-xl flex flex-col gap-0.5 sm:gap-1">
            <div className="flex items-center gap-1.5 text-yellow-400 font-mono text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
              <Shield className="h-3.5 w-3.5 shrink-0" /> 0% Surcharge
            </div>
            <span className="text-[8px] text-zinc-400 font-mono sm:hidden">Zero Fees</span>
            <span className="text-[9px] text-zinc-400 font-mono hidden sm:block">No hidden gateway fees</span>
          </div>
        </div>
      </div>

      {/* Modern High-Impact Cashfree Pay CTA Button inside Card */}
      <button
        type="button"
        onClick={handleInitiateCashfree}
        className="w-full h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-cyan hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer shadow-xl shadow-brand-indigo/25 select-none relative overflow-hidden group px-3"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Zap className="h-4.5 w-4.5 sm:h-5 sm:w-5 fill-current text-brand-cyan animate-pulse shrink-0" />
        <span className="sm:hidden">Pay ₹{grandTotal.toLocaleString("en-IN")} via Cashfree</span>
        <span className="hidden sm:inline">Pay ₹{grandTotal.toLocaleString("en-IN")} via Cashfree Secure Gateway</span>
        <Lock className="h-4 w-4 shrink-0 opacity-80" />
      </button>

      {/* FULLSCREEN MOCK CASHFREE PAYMENT PORTAL SANDBOX MODAL via PORTAL */}
      {mounted && paymentStep !== "idle" && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-center select-none overflow-hidden relative"
            >
              {/* Handshake Loading state */}
              {paymentStep === "handshake" && (
                <div className="flex flex-col items-center gap-5 py-8">
                  <div className="h-14 w-14 rounded-full border-4 border-brand-cyan/20 border-t-brand-cyan animate-spin shrink-0" />
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">Launching Cashfree SDK Tunnel</h3>
                    <p className="text-[10px] text-zinc-400 font-mono mt-1">Establishing 256-bit SSL connection...</p>
                  </div>
                </div>
              )}

              {/* Gateway Selection simulated page */}
              {paymentStep === "gateway" && (
                <div className="flex flex-col gap-5 text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-mono font-black text-white uppercase tracking-wider">Cashfree PG Secure SDK</span>
                    </div>
                    <span className="text-[8px] font-mono font-black text-zinc-500 bg-white/5 px-2 py-0.5 rounded">TEST SANDBOX</span>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-[10px] font-mono text-zinc-400 flex flex-col gap-2">
                    <div className="flex justify-between font-bold text-white uppercase">
                      <span>Order Ref:</span>
                      <span className="text-brand-cyan">CF-WND-8894</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience:</span>
                      <span className="text-white truncate max-w-[200px] text-right font-sans uppercase font-bold">{experience.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Departure Date:</span>
                      <span className="text-white">{selectedDate} • {selectedSlot?.time}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-1 font-bold text-white text-xs">
                      <span>Total Amount:</span>
                      <span className="text-brand-cyan text-sm">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Select Sandbox Action</span>
                    <button
                      type="button"
                      onClick={onSimulateSuccess}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-115 text-zinc-950 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Check className="h-4.5 w-4.5 stroke-[3]" /> Simulate Payment Success
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStep("idle")}
                      className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                    >
                      Cancel Transaction
                    </button>
                  </div>
                </div>
              )}

              {/* Success confirmation invoice */}
              {paymentStep === "success" && (
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 border-4 border-emerald-500/20">
                    <Check className="h-8 w-8 stroke-[3.5] animate-bounce" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Booking Confirmed! 🎉</h3>
                    <p className="text-[10px] text-emerald-400 font-semibold font-mono mt-1 uppercase tracking-wider">
                      Transaction ID: CF-REF-WND202606
                    </p>
                  </div>

                  <div className="w-full bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-[10px] font-mono text-zinc-400 text-left flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span>Adventure:</span>
                      <span className="text-white truncate max-w-[180px] text-right font-sans uppercase font-black">{experience.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date & Time:</span>
                      <span className="text-white">{selectedDate} • {selectedSlot?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Explorers:</span>
                      <span className="text-white">{totalTravelers} Travelers</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Contact:</span>
                      <span className="text-white">{travelersDetails[0]?.phone}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-1 text-white font-bold text-xs">
                      <span>Amount Paid:</span>
                      <span className="text-brand-cyan">₹{grandTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <p className="text-[9px] text-zinc-400 font-semibold font-mono animate-pulse">
                    Redirecting to your active bookings checklist in 3 seconds...
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
