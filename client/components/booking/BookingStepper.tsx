"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info } from "lucide-react";
import { StepId } from "@/types/booking";

interface BookingStepperProps {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
  canGoToStep2: boolean;
  canGoToStep3: boolean;
}

export default function BookingStepper({
  currentStep,
  onStepClick,
  canGoToStep2,
  canGoToStep3,
}: BookingStepperProps) {
  const [lockedTooltip, setLockedTooltip] = useState<{ stepId: number; msg: string } | null>(null);

  const steps = [
    { id: 1, label: "Date & Time", desc: "Select departure", check: canGoToStep2, lockedMsg: "" },
    { id: 2, label: "Explorers", desc: "Details & upgrades", check: canGoToStep3, lockedMsg: "Select a date & time slot to continue." },
    { id: 3, label: "Payment", desc: "Review & pay", check: false, lockedMsg: "Complete traveler details to continue." },
  ];

  const handleNodeClick = (stepId: number, isClickable: boolean, lockedMsg: string) => {
    if (isClickable) {
      setLockedTooltip(null);
      onStepClick(stepId as StepId);
    } else {
      setLockedTooltip({ stepId, msg: lockedMsg });
      setTimeout(() => {
        setLockedTooltip(null);
      }, 3000);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto mb-10 select-none px-4 mt-4 relative">
      <div className="relative flex items-center justify-between">
        {/* Background connecting line */}
        <div className="absolute left-0 right-0 h-[2px] bg-white/5 z-0" />
        
        {/* Active connecting line highlight */}
        <motion.div 
          className="absolute left-0 h-[2px] bg-gradient-to-r from-brand-cyan to-brand-purple z-0" 
          animate={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />

        {/* Step Nodes */}
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = step.check;
          const isClickable = step.id === 1 || (step.id === 2 && canGoToStep2) || (step.id === 3 && canGoToStep2 && canGoToStep3);
          const showTooltip = lockedTooltip?.stepId === step.id;

          return (
            <div key={step.id} className="relative flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleNodeClick(step.id, isClickable, step.lockedMsg)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none transition-transform active:scale-95 ${
                  !isClickable ? "opacity-50" : "opacity-100"
                }`}
              >
                {/* Node Icon/Circle */}
                <div 
                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all duration-300 font-mono text-xs font-black ${
                    isActive
                      ? "bg-brand-bg border-brand-purple text-brand-purple shadow-lg shadow-brand-purple/25 scale-110 ring-4 ring-brand-purple/10"
                      : isCompleted
                      ? "bg-brand-cyan border-brand-cyan text-zinc-950 shadow-md shadow-brand-cyan/20"
                      : "bg-zinc-950 border-white/10 text-zinc-500 group-hover:border-white/25"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Labels text */}
                <span 
                  className={`text-[9px] font-mono font-bold uppercase tracking-widest mt-2.5 transition-colors duration-300 ${
                    isActive ? "text-brand-purple font-black" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[7.5px] font-semibold font-mono text-zinc-600 mt-0.5 hidden sm:block">
                  {step.desc}
                </span>
              </button>

              {/* Lightweight Locked Tooltip Popup */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.9 }}
                    className="absolute top-12 z-50 bg-zinc-950 border border-brand-amber/30 text-brand-amber text-[9px] font-mono font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-1.5"
                  >
                    <Info className="h-3 w-3 shrink-0" />
                    <span>{lockedTooltip.msg}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
