"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, Lock, Tag } from "lucide-react";
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
          setError(`Please fill in required field: ${field.label}`);
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
        throw new Error(data.error || "Failed to complete registration");
      }

      // Route to confirmation / ticket page
      router.push(`/events/${event.id}/success?token=${data.registration.check_in_token}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Ticket Pricing Summary Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Registration Fee</span>
            <span className="text-base font-bold text-white">
              {formatTicketPrice(event.ticket_price, event.currency)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
            {isFree ? "Instant Access" : "Stripe Test Mode"}
          </span>
        </div>
      </div>

      {/* Attendee Standard Fields */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Attendee Information
        </h4>

        <Input
          label="Full Name"
          placeholder="e.g. Jane Doe"
          value={attendeeName}
          onChange={(e) => setAttendeeName(e.target.value)}
          required
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="jane@company.com"
          value={attendeeEmail}
          onChange={(e) => setAttendeeEmail(e.target.value)}
          helperText="Your check-in ticket and confirmation will be sent here"
          required
        />
      </div>

      {/* Dynamic Custom Fields from JSONB */}
      {event.custom_fields && event.custom_fields.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Event Specific Questions
          </h4>

          {event.custom_fields.map((field) => {
            const fieldId = field.id;

            if (field.type === "select") {
              return (
                <div key={fieldId} className="w-full space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    {field.label}
                    {field.required && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                  <select
                    value={formData[fieldId] || ""}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                    required={field.required}
                    className="flex h-10 w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">Select an option...</option>
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
                  <label className="block text-xs font-medium text-slate-300">
                    {field.label}
                    {field.required && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || "Your answer..."}
                    value={formData[fieldId] || ""}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                    required={field.required}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              );
            }

            if (field.type === "checkbox") {
              return (
                <div key={fieldId} className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={fieldId}
                    checked={!!formData[fieldId]}
                    onChange={(e) => handleCustomFieldChange(fieldId, e.target.checked)}
                    required={field.required}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor={fieldId} className="text-xs text-slate-300 cursor-pointer">
                    {field.label}
                    {field.required && <span className="text-rose-400 ml-1">*</span>}
                  </label>
                </div>
              );
            }

            // Default Text or Number input
            return (
              <Input
                key={fieldId}
                type={field.type === "number" ? "number" : "text"}
                label={field.label}
                placeholder={field.placeholder || "Enter your response"}
                value={formData[fieldId] || ""}
                onChange={(e) => handleCustomFieldChange(fieldId, e.target.value)}
                required={field.required}
              />
            );
          })}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <Button
          type="submit"
          variant="glow"
          size="lg"
          isLoading={isSubmitting}
          className="w-full text-sm font-semibold"
        >
          {isFree ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Free Registration
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay {formatTicketPrice(event.ticket_price, event.currency)} & Register
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-slate-400" />
          Secure 256-bit encrypted checkout & instant ticket generation
        </p>
      </div>
    </form>
  );
}
