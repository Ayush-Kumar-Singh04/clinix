import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getDayOfWeek(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number = 30
): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];
  let [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDurationMinutes <= endMinutes) {
    const sH = Math.floor(currentMinutes / 60).toString().padStart(2, "0");
    const sM = (currentMinutes % 60).toString().padStart(2, "0");
    const nextMinutes = currentMinutes + slotDurationMinutes;
    const eH = Math.floor(nextMinutes / 60).toString().padStart(2, "0");
    const eM = (nextMinutes % 60).toString().padStart(2, "0");

    slots.push({
      startTime: `${sH}:${sM}`,
      endTime: `${eH}:${eM}`,
    });

    currentMinutes += slotDurationMinutes;
  }

  return slots;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: any
) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status }
  );
}

export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}

export function getDoctorProficiencies(specialization: string): string[] {
  const map: Record<string, string[]> = {
    Cardiology: [
      "Interventional Cardiology",
      "Hypertension Management",
      "Echocardiography",
      "Coronary Artery Disease",
      "Arrhythmia Triage",
      "Heart Failure Therapeutics",
    ],
    "General Medicine": [
      "Preventative Health",
      "Chronic Disease Management",
      "Metabolic & Diabetes Care",
      "Infectious Disease Triage",
      "Geriatric Outpatient Care",
      "Lifestyle Medicine",
    ],
    Dermatology: [
      "Clinical Dermatology",
      "Acne & Scarring Treatments",
      "Skin Cancer Screenings",
      "Eczema & Psoriasis",
      "Laser & Aesthetic Dermatology",
      "Trichology & Hair Health",
    ],
    Orthopedics: [
      "Joint Replacement Therapy",
      "Sports Injury Rehabilitation",
      "Arthroscopic Procedures",
      "Spine & Back Health",
      "Fracture Management",
      "Musculoskeletal Ultrasound",
    ],
    Neurology: [
      "Migraine & Headache Disorders",
      "Epilepsy & Seizure Management",
      "Stroke Rehabilitation",
      "Neurodegenerative Disorders",
      "Peripheral Neuropathy",
    ],
    Pediatrics: [
      "Neonatal & Newborn Care",
      "Pediatric Growth & Nutrition",
      "Childhood Immunizations",
      "Pediatric Asthma & Allergies",
      "Developmental Milestones",
    ],
    Psychiatry: [
      "Anxiety & Mood Disorders",
      "Depression Therapeutics",
      "Cognitive Behavioral Strategies",
      "ADHD & Neuropsychiatry",
      "Stress & Psychotherapy",
    ],
  };

  return map[specialization] || [
    "Clinical Consultation",
    "Evidence-Based Therapeutics",
    "Preventative Care",
    "Diagnostic Review",
  ];
}

export function getDoctorRatingDetails(doctorId: string, name: string = "") {
  let hash = 0;
  const str = doctorId + name;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const ratingVariations = ["4.8", "4.9", "5.0", "4.7", "4.9", "4.8", "5.0"];
  const rating = ratingVariations[absHash % ratingVariations.length];
  const reviewsCount = 45 + (absHash % 236);
  const experienceYears = 6 + (absHash % 17);
  const recommendationRate = 96 + (absHash % 5);

  return {
    rating,
    reviewsCount,
    experienceYears,
    recommendationRate,
  };
}
