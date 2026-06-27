"use client";

import React from "react";
import { ArrowRight, ArrowLeft, Zap, RefreshCw } from "lucide-react";
import { StepId } from "@/types/booking";

interface NavigationFooterProps {
  currentStep: StepId;
  setCurrentStep: React.Dispatch<React.SetStateAction<StepId>>;
  canGoToStep2: boolean;
  canGoToStep3: boolean;
  isFormValid: boolean;
  isSubmitting: boolean;
  grandTotal: number;
  onProceedPayment: () => void;
}

export default function NavigationFooter({
  currentStep,
  setCurrentStep,
  canGoToStep2,
  canGoToStep3,
  isFormValid,
  isSubmitting,
  grandTotal,
  onProceedPayment,
}: NavigationFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 p-4 sm:relative sm:z-auto sm:bg-transparent sm:backdrop-blur-none sm:border-t sm:border-white/5 sm:p-0 sm:pt-6 sm:mt-4 flex flex-col gap-3 w-full shadow-2xl sm:shadow-none">
      <div className="flex gap-3 sm:gap-4 w-full max-w-[1440px] mx-auto px-0 sm:px-0">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev - 1) as StepId)}
            className="h-12 px-4 sm:px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 select-none shrink-0"
          >
            <ArrowLeft className="h-4 w-4 sm:hidden shrink-0 text-zinc-400" />
            <span className="sm:hidden">Back</span>
            
            <span className="hidden sm:inline flex items-center gap-2">
              {currentStep === 2 ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-brand-cyan inline mr-1.5" />
                  Change Date & Time
                </>
              ) : (
                "Go Back"
              )}
            </span>
          </button>
        )}

        {currentStep === 1 && (
          <button
            type="button"
            disabled={!canGoToStep2}
            onClick={() => setCurrentStep(2)}
            className="flex-grow h-12 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer select-none shadow-lg shadow-brand-indigo/15"
          >
            <span className="sm:hidden">Continue</span>
            <span className="hidden sm:inline">Continue to Explorers</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        )}

        {currentStep === 2 && (
          <button
            type="button"
            disabled={!canGoToStep3}
            onClick={() => setCurrentStep(3)}
            className="flex-grow h-12 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer select-none shadow-lg shadow-brand-indigo/15"
          >
            <span className="sm:hidden">Continue</span>
            <span className="hidden sm:inline">Continue to Payment</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        )}

        {currentStep === 3 && (
          <button
            type="button"
            disabled={!isFormValid || isSubmitting}
            onClick={onProceedPayment}
            className="flex-grow h-12 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple hover:brightness-110 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-indigo/15 disabled:opacity-40 disabled:cursor-not-allowed select-none"
          >
            <Zap className="h-4.5 w-4.5 fill-current text-brand-cyan animate-pulse shrink-0" />
            <span className="sm:hidden">
              {isSubmitting ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
            </span>
            <span className="hidden sm:inline">
              {isSubmitting ? "Initiating Secure Checkout..." : `Securely Book & Pay ₹${grandTotal.toLocaleString("en-IN")}`}
            </span>
          </button>
        )}
      </div>

      {currentStep === 3 && isFormValid && (
        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-semibold text-center select-none hidden sm:block">
          🔒 Encrypted sandbox connection powered securely by Cashfree PG.
        </span>
      )}
    </div>
  );
}
