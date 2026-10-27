"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Ticket, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTicketPrice } from "@/lib/utils";
import type { EventWithParsedFields } from "@/types/models";

interface DynamicRegistrationFormProps {
  event: EventWithParsedFields;
}

export function DynamicRegistrationForm({ event }: DynamicRegistrationFormProps) {
  const router = useRouter();
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFree = event.ticket_price === 0;

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required custom fields
    if (event.custom_fields && Array.isArray(event.custom_fields)) {
      for (const field of event.custom_fields) {
        if (field.required && !formData[field.id]) {
          setError(`Please provide an answer for: ${field.label}`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          attendee_name: attendeeName,
          attendee_email: attendeeEmail,
          form_data: formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete reservation");
      }

      // Route to confirmation / ticket pass page
      router.push(`/events/${event.id}/success?token=${data.registration.check_in_token}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while processing your RSVP.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-[#e07a5f]/10 border border-[#e07a5f]/30 text-[#e07a5f] text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Admission Fare Indicator */}
      <div className="tactile-panel p-4 flex items-center justify-between border-dashed">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
              Admission Fare
            </span>
            <span className="font-serif text-lg text-[#f4f3ef] font-normal">
              {isFree ? "Complimentary Pass" : formatTicketPrice(event.ticket_price, event.currency)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="stamp-badge">
            {isFree ? "Open Admission" : "Instant Reservation"}
          </span>
        </div>
      </div>

      {/* Guest Essentials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
            Part 01 · Guest Details
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">* Mandatory</span>
        </div>

        <Input
          label="Your Full Name"
          placeholder="e.g. Maya Lin"
          value={attendeeName}
          onChange={(e) => setAttendeeName(e.target.value)}
          required
        />

        <Input
          type="email"
          label="Email Address for Admission Pass"
          placeholder="maya@studio.com"
          value={attendeeEmail}
          onChange={(e) => setAttendeeEmail(e.target.value)}
          helperText="Your digital check-in slip will be dispatched to this address."
          required
        />
      </div>

      {/* Dynamic Event Inquiries */}
      {event.custom_fields && event.custom_fields.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
              Part 02 · Gathering Inquiries
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {event.custom_fields.length} {event.custom_fields.length === 1 ? "question" : "questions"}
            </span>
          </div>

          {event.custom_fields.map((field, idx) => {
            const fieldId = field.id;

            if (field.type === "select") {
              return (
                <div key={fieldId} className="w-full space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    <span className="font-mono text-[10px] text-[#e07a5f] mr-1">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    {field.label}
                    {field.required && <span className="text-[#e07a5f] ml-1">*</span>}
                  </label>
                  <select
                    value={formData[fieldId] || ""}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                    required={field.required}
                    className="flex h-10 w-full rounded-lg border border-white/[0.08] bg-[#14151a] px-3 py-2 text-sm text-[#f4f3ef] focus:outline-none focus:border-[#e07a5f] transition-colors"
                  >
                    <option value="">Please select a choice...</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={fieldId} className="w-full space-y-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    <span className="font-mono text-[10px] text-[#e07a5f] mr-1">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    {field.label}
                    {field.required && <span className="text-[#e07a5f] ml-1">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || "Write your note here..."}
                    value={formData[fieldId] || ""}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                    required={field.required}
                    className="w-full rounded-lg border border-white/[0.08] bg-[#14151a] px-3 py-2 text-sm text-[#f4f3ef] placeholder:text-zinc-600 focus:outline-none focus:border-[#e07a5f] transition-colors"
                  />
                </div>
              );
            }

            if (field.type === "checkbox") {
              return (
                <div key={fieldId} className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id={fieldId}
                    checked={!!formData[fieldId]}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.checked)}
                    required={field.required}
                    className="h-4 w-4 mt-0.5 rounded border-zinc-700 bg-zinc-900 text-[#e07a5f] focus:ring-0 focus:ring-offset-0"
                  />
                  <label htmlFor={fieldId} className="text-xs text-zinc-300 cursor-pointer select-none">
                    {field.label}
                    {field.required && <span className="text-[#e07a5f] ml-1">*</span>}
                  </label>
                </div>
              );
            }

            // Default Text or Number input
            return (
              <Input
                key={fieldId}
                type={field.type === "number" ? "number" : "text"}
                label={`${String(idx + 1).padStart(2, "0")}. ${field.label}`}
                placeholder={field.placeholder || "Enter your response"}
                value={formData[fieldId] || ""}
                onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                required={field.required}
              />
            );
          })}
        </div>
      )}

      {/* Confirmation Call to Action */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full text-sm font-medium py-3.5"
        >
          {isFree ? (
            <>
              Confirm Reservation & Generate Pass
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Confirm Pass · {formatTicketPrice(event.ticket_price, event.currency)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-zinc-400 flex items-center justify-center gap-1.5 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          Direct admission pass issuance · Immediate confirmation slip
        </p>
      </div>
    </form>
  );
}

