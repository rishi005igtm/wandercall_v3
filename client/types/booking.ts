export type StepId = 1 | 2 | 3;

export interface Slot {
  id: string;
  time: string;
  remainingSeats: number;
  guideName: string;
  language: string;
  popularity: string;
  recommendedReason?: string;
  isBestWeather?: boolean;
}

export interface TravelerData {
  name: string;
  age: string;
  phone: string;
  emergencyContact: string;
}

export interface ExperienceData {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewsCount: number;
  location: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Extreme";
  price: number;
  originalPrice: number;
  image: string;
  bookedToday: number;
  matchScore: number;
  operatingDays?: string[];
}

export interface DayData {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  status: "available" | "few-left" | "fully-booked" | "unavailable" | "today";
  slotsLeft: number;
  weather: string;
  popularity: string;
}
