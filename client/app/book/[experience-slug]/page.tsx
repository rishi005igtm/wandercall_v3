"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useBookingStore } from "@/hooks/useBookingStore";
import { ExperienceData } from "@/types/booking";

// Modular Components
import BookingStepper from "@/components/booking/BookingStepper";
import BookingSummary from "@/components/booking/BookingSummary";
import NavigationFooter from "@/components/booking/NavigationFooter";

// Step 1: Date & Time Module
import Calendar from "@/components/booking/DateTimeStep/Calendar";
import TimeSlotModal from "@/components/booking/DateTimeStep/TimeSlotModal";
import DateDetailsPanel from "@/components/booking/DateTimeStep/DateDetailsPanel";

// Step 2: Explorer Module
import ExplorerCounter from "@/components/booking/ExplorerStep/ExplorerCounter";
import TravelerForm from "@/components/booking/ExplorerStep/TravelerForm";
import AddonSelector from "@/components/booking/ExplorerStep/AddonSelector";

// Step 3: Payment Module
import CashfreeSection from "@/components/booking/PaymentStep/CashfreeSection";
import CancellationCard from "@/components/booking/PaymentStep/CancellationCard";

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
    <div className="flex flex-col min-h-screen bg-brand-bg text-white overflow-x-hidden font-sans">
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-36 sm:pb-28">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/experiences/${experienceSlug}`}
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-500 hover:text-white uppercase transition-colors select-none"
          >
            <ArrowLeft className="h-4 w-4" /> Back to experience details
          </Link>
        </div>

        {/* State-Aware Stepper Header */}
        <BookingStepper
          currentStep={store.currentStep}
          onStepClick={(step) => store.setCurrentStep(step)}
          canGoToStep2={store.canGoToStep2}
          canGoToStep3={store.canGoToStep3}
        />

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
                  <TravelerForm
                    travelersDetails={store.travelersDetails}
                    setTravelersDetails={store.setTravelersDetails}
                  />
                  <AddonSelector
                    selectedAddons={store.selectedAddons}
                    onToggleAddon={store.handleToggleAddon}
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
                    travelersDetails={store.travelersDetails}
                    grandTotal={store.grandTotal}
                    onSimulateSuccess={handleSimulatePaymentSuccess}
                  />
                  <CancellationCard />
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
                selectedAddons={store.selectedAddons}
                couponCode={store.couponCode}
                setCouponCode={store.setCouponCode}
                appliedCoupon={store.appliedCoupon}
                setAppliedCoupon={store.setAppliedCoupon}
                couponError={store.couponError}
                setCouponError={store.setCouponError}
                baseSubtotal={store.baseSubtotal}
                addonsTotal={store.addonsTotal}
                privateGroupFee={store.privateGroupFee}
                groupDiscount={store.groupDiscount}
                couponDiscount={store.couponDiscount}
                taxes={store.taxes}
                grandTotal={store.grandTotal}
              />
            </div>

            {/* Step Navigation Footer Controls */}
            <NavigationFooter
              currentStep={store.currentStep}
              setCurrentStep={store.setCurrentStep}
              canGoToStep2={store.canGoToStep2}
              canGoToStep3={store.canGoToStep3}
              isFormValid={store.isFormValid}
              isSubmitting={store.isSubmitting}
              grandTotal={store.grandTotal}
              onProceedPayment={handleProceedPayment}
            />
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
              selectedAddons={store.selectedAddons}
              couponCode={store.couponCode}
              setCouponCode={store.setCouponCode}
              appliedCoupon={store.appliedCoupon}
              setAppliedCoupon={store.setAppliedCoupon}
              couponError={store.couponError}
              setCouponError={store.setCouponError}
              baseSubtotal={store.baseSubtotal}
              addonsTotal={store.addonsTotal}
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
