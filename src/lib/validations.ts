import { z } from "zod";

export const RoleEnum = z.enum(["PATIENT", "DOCTOR", "ADMIN"]);
export const UrgencyEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const SlotStatusEnum = z.enum(["AVAILABLE", "HELD", "CONFIRMED", "EXPIRED", "CANCELLED"]);
export const AppointmentStatusEnum = z.enum(["UPCOMING", "COMPLETED", "CANCELLED", "RESCHEDULED"]);

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: RoleEnum.default("PATIENT"),
  phone: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const DoctorCreateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  specialization: z.string().min(2, "Specialization is required"),
  slotDurationMinutes: z.number().int().min(15).max(120).default(30),
  avatarUrl: z.string().optional().nullable(),
  workingHours: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid HH:mm time format"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid HH:mm time format"),
    })
  ).optional(),
});

export const DoctorUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  specialization: z.string().min(2).optional(),
  slotDurationMinutes: z.number().int().min(15).max(120).optional(),
  isActive: z.boolean().optional(),
  avatarUrl: z.string().optional(),
});

export const DoctorLeaveSchema = z.object({
  leaveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  reason: z.string().optional(),
  confirm: z.boolean().optional().default(false),
});

export const HoldSlotSchema = z.object({
  doctorId: z.string().uuid("Invalid Doctor ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format"),
  holdToken: z.string().optional(),
});

export const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid("Invalid Doctor ID"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format YYYY-MM-DD"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format"),
  symptoms: z.string().min(5, "Please enter your symptoms (at least 5 characters)"),
  holdToken: z.string().optional(),
  aiPreVisitSummary: z.object({
    urgency: UrgencyEnum,
    chiefComplaint: z.string(),
    suggestedQuestions: z.array(z.string()).length(3),
  }).optional(),
});

export const PreVisitAISchema = z.object({
  urgency: UrgencyEnum,
  chiefComplaint: z.string(),
  suggestedQuestions: z.array(z.string()).length(3),
});

export const ClinicalNotesSchema = z.object({
  clinicalNotes: z.string().min(2, "Clinical notes are required"),
  doctorNotesPatient: z.string().optional(),
  prescriptionItems: z.array(
    z.object({
      medicineName: z.string().min(1, "Medicine name is required"),
      dosage: z.string().min(1, "Dosage is required"),
      frequency: z.string().min(1, "Frequency is required"),
      duration: z.string().min(1, "Duration is required"),
      instructions: z.string().optional(),
    })
  ).optional(),
});

export const PostVisitAISchema = z.object({
  summary: z.string(),
  medicationSchedule: z.string(),
  followUpSteps: z.array(z.string()),
  importantInstructions: z.string(),
});
