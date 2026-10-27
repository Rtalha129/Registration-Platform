import { z } from "zod";
import type { Database, PaymentStatus, UserRole } from "./database.types";

export type { PaymentStatus, UserRole };

// Base Table Types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type RegistrationInsert = Database["public"]["Tables"]["registrations"]["Insert"];
export type RegistrationUpdate = Database["public"]["Tables"]["registrations"]["Update"];

// Custom Field Definition in Events
export type CustomFieldType = "text" | "number" | "select" | "checkbox" | "textarea";

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for 'select'
  description?: string;
}

// Typed Event with parsed custom_fields
export interface EventWithParsedFields extends Omit<Event, "custom_fields"> {
  custom_fields: CustomField[];
  registrations_count?: number;
  checked_in_count?: number;
}

// Registration with parent event
export interface RegistrationWithEvent extends Registration {
  event?: Event;
}

// Event Dashboard Statistics
export interface OrganizerStats {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenueCents: number;
  checkInRatePercentage: number;
}

// Zod Schema for Dynamic Custom Fields
export const CustomFieldSchema = z.object({
  id: z.string().optional().transform((v) => v || `field_${Date.now().toString(36)}`),
  label: z.string().default("Question"),
  type: z.enum(["text", "number", "select", "checkbox", "textarea"]).default("text"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});

// Zod Schema for Event Creation / Updating
export const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().nullish().transform((v) => v || ""),
  ticket_price_dollars: z
    .union([z.number(), z.string()])
    .transform((v) => Number(v) || 0)
    .refine((v) => v >= 0, "Price cannot be negative")
    .default(0),
  currency: z.string().default("USD"),
  email_template: z.string().nullish().transform((v) => v || ""),
  custom_fields: z.array(CustomFieldSchema).default([]),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

// Zod Schema for Attendee Registration Form Submission
export const RegisterAttendeeSchema = z.object({
  event_id: z.string().min(1, "Invalid event ID"),
  attendee_name: z.string().min(2, "Name must be at least 2 characters"),
  attendee_email: z.string().email("Please provide a valid email address"),
  form_data: z.record(z.string(), z.any()).default({}),
});

export type RegisterAttendeeInput = z.infer<typeof RegisterAttendeeSchema>;

// Check-in Verification Payload
export const CheckInSchema = z.object({
  check_in_token: z.string().min(1, "Invalid check-in token format"),
  event_id: z.string().min(1, "Invalid event ID"),
});

export type CheckInInput = z.infer<typeof CheckInSchema>;
