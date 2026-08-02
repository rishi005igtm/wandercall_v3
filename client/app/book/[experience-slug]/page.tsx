"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useBookingStore } from "@/hooks/useBookingStore";
import { ExperienceData } from "@/types/booking";

// Modular Components
import BookingSummary from "@/components/booking/BookingSummary";

// Step 1: Date & Time Module
import Calendar from "@/components/booking/DateTimeStep/Calendar";
import TimeSlotModal from "@/components/booking/DateTimeStep/TimeSlotModal";
import DateDetailsPanel from "@/components/booking/DateTimeStep/DateDetailsPanel";

import ExplorerCounter from "@/components/booking/ExplorerStep/ExplorerCounter";

// Step 3: Payment Module
import CashfreeSection from "@/components/booking/PaymentStep/CashfreeSection";


// Compact Database catalog
const EXPERIENCES_CATALOG: Record<string, ExperienceData> = {
  "scuba-diving-coral-exploration": {
    id: "exp-1",
    title: "Scuba Diving & Coral Exploration",
    category: "Water Sports",
    rating: 4.9,
    reviewsCount: 142,
    location: "Netrani Island, Karnataka",
    duration: "6 Hours",
    difficulty: "Medium",
    price: 4999,
    originalPrice: 6500,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600&auto=format&fit=crop",
    bookedToday: 18,
    matchScore: 97,
    operatingDays: ["Mon", "Wed", "Sat"],
  },
  "paragliding-over-bir-billing-valleys": {
    id: "exp-2",
    title: "Paragliding over Bir Billing Valleys",
    category: "Adventure",
    rating: 4.8,
    reviewsCount: 98,
    location: "Bir, Himachal Pradesh",
    duration: "45 Minutes",
    difficulty: "Hard",
    price: 3500,
    originalPrice: 4200,
    image: "https://images.unsplash.com/photo-1596727147705-61a532a655bd?q=80&w=600&auto=format&fit=crop",
    bookedToday: 34,
    matchScore: 96,
    operatingDays: ["Tue", "Thu", "Sun"],
  },
  "overnight-bioluminescent-kayaking": {
    id: "exp-3",
    title: "Overnight Bioluminescent Kayaking",
    category: "Water Sports",
    rating: 4.95,
    reviewsCount: 74,
    location: "Gokarna, Karnataka",
    duration: "1 Night",
    difficulty: "Medium",
    price: 2800,
    originalPrice: 3500,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop",
    bookedToday: 22,
    matchScore: 94,
    operatingDays: ["Fri", "Sat", "Sun"],
  },
  "heritage-fort-rappelling-bouldering": {
    id: "exp-4",
    title: "Heritage Fort Rappelling & Bouldering",
    category: "Adventure",
    rating: 4.7,
    reviewsCount: 52,
    location: "Hampi, Karnataka",
    duration: "5 Hours",
    difficulty: "Extreme",
    price: 1800,
    originalPrice: 2400,
    image: "https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=600&auto=format&fit=crop",
    bookedToday: 8,
    matchScore: 89,
    operatingDays: ["Mon", "Wed", "Fri"],
  },
};

const FALLBACK_EXP = EXPERIENCES_CATALOG["scuba-diving-coral-exploration"];

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params["experience-slug"];
  const experienceSlug = typeof rawSlug === "string" ? rawSlug : "";

  const experience = useMemo(() => {
    if (EXPERIENCES_CATALOG[experienceSlug]) {
      return EXPERIENCES_CATALOG[experienceSlug];
    }
    const keys = Object.keys(EXPERIENCES_CATALOG);
    const partialMatch = keys.find((k) => k.includes(experienceSlug) || experienceSlug.includes(k));
    return partialMatch ? EXPERIENCES_CATALOG[partialMatch] : FALLBACK_EXP;
  }, [experienceSlug]);

  // Centralized Hook Store
  const store = useBookingStore(experience);

  // Time Slot Modal Trigger state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const handleDateSelect = (date: string) => {
    store.setSelectedDate(date);
    setIsSlotModalOpen(true);
  };

  const handleProceedPayment = () => {
    if (!store.isFormValid) return;
    store.setIsSubmitting(true);
    store.setPaymentStep("handshake");

    setTimeout(() => {
      store.setPaymentStep("gateway");
    }, 2000);
  };

  const handleSimulatePaymentSuccess = () => {
    store.setPaymentStep("success");
    setTimeout(() => {
      router.push("/profile/bookings");
    }, 4500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-mesh-premium overflow-x-hidden font-sans relative">
      
      {/* Sticky Header Bar replacing Stepper and Footer */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white backdrop-blur-xl border-b border-gray-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0">
        <div className="flex-1 flex justify-start">
          {store.currentStep === 1 ? (
            <Link
              href={`/experiences/${experienceSlug}`}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 hover:text-gray-900 uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Link>
          ) : (
            <button
              onClick={() => store.setCurrentStep((store.currentStep - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 hover:text-gray-900 uppercase transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>
        
        <div className="hidden sm:flex flex-1 justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span className={store.currentStep === 1 ? "text-gray-900" : ""}>Date</span>
          <span className="mx-2 opacity-50">-</span>
          <span className={store.currentStep === 2 ? "text-gray-900" : ""}>Explorers</span>
          <span className="mx-2 opacity-50">-</span>
          <span className={store.currentStep === 3 ? "text-gray-900" : ""}>Payment</span>
        </div>
        
        <div className="flex-1 flex justify-end">
          {store.currentStep === 1 && (
            <button
              disabled={!store.canGoToStep2}
              onClick={() => store.setCurrentStep(2)}
              className="h-9 px-5 rounded-full bg-brand-cyan text-zinc-950 font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}
          {store.currentStep === 2 && (
            <button
              disabled={!store.canGoToStep3}
              onClick={() => store.setCurrentStep(3)}
              className="h-9 px-5 rounded-full bg-brand-cyan text-zinc-950 font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}
          {store.currentStep === 3 && (
            <button
              disabled={!store.isFormValid || store.isSubmitting}
              onClick={handleProceedPayment}
              className="h-9 px-5 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-indigo/20"
            >
              {store.isSubmitting ? "Processing..." : `Pay ₹${store.grandTotal.toLocaleString("en-IN")}`}
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-24 pb-12">
        {/* Dynamic Step View & Sticky Summary Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Active Step Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: DATE & TIME */}
              {store.currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-stretch"
                >
                  <Calendar
                    selectedDate={store.selectedDate}
                    onSelectDate={handleDateSelect}
                    operatingDays={experience.operatingDays}
                  />
                  <DateDetailsPanel
                    selectedDate={store.selectedDate}
                    selectedSlot={store.selectedSlot}
                    experienceDuration={experience.duration}
                    onOpenSlotModal={() => setIsSlotModalOpen(true)}
                  />
                </motion.div>
              )}

              {/* STEP 2: EXPLORERS */}
              {store.currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 w-full"
                >
                  <ExplorerCounter
                    adultsCount={store.adultsCount}
                    setAdultsCount={store.setAdultsCount}
                    childrenCount={store.childrenCount}
                    setChildrenCount={store.setChildrenCount}
                    isPrivateGroup={store.isPrivateGroup}
                    setIsPrivateGroup={store.setIsPrivateGroup}
                    maxSlots={store.selectedSlot?.remainingSeats || 10}
                  />
                </motion.div>
              )}

              {/* STEP 3: PAYMENT */}
              {store.currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 w-full"
                >
                  <CashfreeSection
                    selectedPaymentGateway={store.selectedPaymentGateway}
                    setSelectedPaymentGateway={store.setSelectedPaymentGateway}
                    paymentStep={store.paymentStep}
                    setPaymentStep={store.setPaymentStep}
                    experience={experience}
                    selectedDate={store.selectedDate}
                    selectedSlot={store.selectedSlot}
                    totalTravelers={store.totalTravelers}

                    grandTotal={store.grandTotal}
                    onSimulateSuccess={handleSimulatePaymentSuccess}
                  />

                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile-only Price Summary */}
            <div className="block lg:hidden w-full mt-2">
              <BookingSummary
                experienceTitle={experience.title}
                experiencePrice={experience.price}
                selectedDate={store.selectedDate}
                selectedSlot={store.selectedSlot}
                adultsCount={store.adultsCount}
                childrenCount={store.childrenCount}
                isPrivateGroup={store.isPrivateGroup}
                couponCode={store.couponCode}
                setCouponCode={store.setCouponCode}
                appliedCoupon={store.appliedCoupon}
                setAppliedCoupon={store.setAppliedCoupon}
                couponError={store.couponError}
                setCouponError={store.setCouponError}
                baseSubtotal={store.baseSubtotal}
                privateGroupFee={store.privateGroupFee}
                groupDiscount={store.groupDiscount}
                couponDiscount={store.couponDiscount}
                taxes={store.taxes}
                grandTotal={store.grandTotal}
              />
            </div>

          </div>

          {/* Right Column Sticky Booking Summary */}
          <div className="hidden lg:block w-full">
            <BookingSummary
              experienceTitle={experience.title}
              experiencePrice={experience.price}
              selectedDate={store.selectedDate}
              selectedSlot={store.selectedSlot}
              adultsCount={store.adultsCount}
              childrenCount={store.childrenCount}
              isPrivateGroup={store.isPrivateGroup}
              couponCode={store.couponCode}
              setCouponCode={store.setCouponCode}
              appliedCoupon={store.appliedCoupon}
              setAppliedCoupon={store.setAppliedCoupon}
              couponError={store.couponError}
              setCouponError={store.setCouponError}
              baseSubtotal={store.baseSubtotal}
              privateGroupFee={store.privateGroupFee}
              groupDiscount={store.groupDiscount}
              couponDiscount={store.couponDiscount}
              taxes={store.taxes}
              grandTotal={store.grandTotal}
            />
          </div>

        </div>
      </main>

      {/* Departure Time Slot Modal / BottomSheet */}
      <TimeSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        selectedDate={store.selectedDate}
        selectedSlot={store.selectedSlot}
        onSelectSlot={store.setSelectedSlot}
      />
    </div>
  );
}
