"use client";

import { useState, useMemo, useEffect } from "react";
import { StepId, Slot, ExperienceData } from "@/types/booking";

export function useBookingStore(experience: ExperienceData) {
  const [currentStep, setCurrentStep] = useState<StepId>(1);

  // Main Booking Selection States
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Traveler Selection States
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [isPrivateGroup, setIsPrivateGroup] = useState<boolean>(false);

  // Coupon Selection States
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");

  // Payment Status States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<"idle" | "handshake" | "gateway" | "success">("idle");
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<string>("upi");

  const totalTravelers = adultsCount + childrenCount;

  // Reset selected slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  // Validation Rules
  const canGoToStep2 = selectedDate !== "" && selectedSlot !== null;

  const canGoToStep3 = canGoToStep2;

  const isFormValid = canGoToStep3;

  // Pricing calculations
  const baseSubtotal = totalTravelers * experience.price;
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

  const taxableSubtotal = Math.max(0, baseSubtotal + privateGroupFee - groupDiscount - couponDiscount);
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

    privateGroupFee,
    groupDiscount,
    couponDiscount,
    taxes,
    grandTotal,
  };
}

export type BookingStore = ReturnType<typeof useBookingStore>;
