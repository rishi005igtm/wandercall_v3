"use client";

import { useState, useMemo, useEffect } from "react";
import { StepId, Slot, TravelerData, ExperienceData } from "@/types/booking";

export function useBookingStore(experience: ExperienceData) {
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Main Booking Selection States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Traveler Selection States
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [isPrivateGroup, setIsPrivateGroup] = useState<boolean>(false);
  const [travelersDetails, setTravelersDetails] = useState<TravelerData[]>([
    { name: "", age: "", phone: "", emergencyContact: "" }
  ]);

  // Addon Selection States
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Coupon Selection States
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");

  // Payment Status States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "handshake" | "gateway" | "success">("idle");
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>("upi");

  // Keep travelers details array synced in length with adultsCount + childrenCount
  const totalTravelers = adultsCount + childrenCount;

  useEffect(() => {
    setTravelersDetails((prev) => {
      if (prev.length === totalTravelers) return prev;
      if (prev.length < totalTravelers) {
        const added = Array.from({ length: totalTravelers - prev.length }, () => ({
          name: "", age: "", phone: "", emergencyContact: ""
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, totalTravelers);
    });
  }, [totalTravelers]);

  // Reset selected slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  // Validation Rules
  const canGoToStep2 = selectedDate !== "" && selectedSlot !== null;

  const canGoToStep3 = useMemo(() => {
    if (!canGoToStep2) return false;
    if (travelersDetails.length === 0) return false;
    const lead = travelersDetails[0];
    return !!(lead && lead.name.trim() && lead.age.trim() && lead.phone.trim() && lead.emergencyContact.trim());
  }, [canGoToStep2, travelersDetails]);

  const isFormValid = canGoToStep3;

  // Addons toggle handler
  const handleToggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Pricing calculations
  const baseSubtotal = totalTravelers * experience.price;
  
  const addonRates: Record<string, number> = {
    drone: 1500,
    photos: 800,
    meals: 400,
    transport: 1200,
    insurance: 300,
    certificate: 200,
    gopro: 1000,
    locker: 150,
  };

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, id) => sum + (addonRates[id] || 0), 0);
  }, [selectedAddons]);

  const privateGroupFee = isPrivateGroup ? 1500 : 0;
  const groupDiscount = totalTravelers >= 4 ? Math.round(baseSubtotal * 0.1) : 0;

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === "WANDER20") return Math.round(baseSubtotal * 0.2);
    if (appliedCoupon === "WELCOME10") return Math.round(baseSubtotal * 0.1);
    if (appliedCoupon === "ADVENTURE30") return Math.round(baseSubtotal * 0.3);
    if (appliedCoupon === "FREE500") return Math.min(baseSubtotal, 500);
    return 0;
  }, [appliedCoupon, baseSubtotal]);

  const taxableSubtotal = Math.max(0, baseSubtotal + addonsTotal + privateGroupFee - groupDiscount - couponDiscount);
  const taxes = Math.round(taxableSubtotal * 0.18);
  const grandTotal = taxableSubtotal + taxes;

  return {
    currentStep,
    setCurrentStep,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    adultsCount,
    setAdultsCount,
    childrenCount,
    setChildrenCount,
    totalTravelers,
    isPrivateGroup,
    setIsPrivateGroup,
    travelersDetails,
    setTravelersDetails,
    selectedAddons,
    handleToggleAddon,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    couponError,
    setCouponError,
    isSubmitting,
    setIsSubmitting,
    paymentStep,
    setPaymentStep,
    selectedPaymentGateway,
    setSelectedPaymentGateway,
    canGoToStep2,
    canGoToStep3,
    isFormValid,
    baseSubtotal,
    addonsTotal,
    privateGroupFee,
    groupDiscount,
    couponDiscount,
    taxes,
    grandTotal,
  };
}

export type BookingStore = ReturnType<typeof useBookingStore>;
