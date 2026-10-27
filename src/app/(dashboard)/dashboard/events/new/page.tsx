"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, DollarSign, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DynamicFieldsBuilder } from "@/components/dashboard/dynamic-fields-builder";
import type { CustomField } from "@/types/models";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPriceDollars, setTicketPriceDollars] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [emailTemplate, setEmailTemplate] = useState(
    "Dear {{attendee_name}},\n\nYour guest reservation for {{event_title}} is formally confirmed.\n\nYour unique door admission pass code is: {{check_in_token}}\nPlease have your digital ticket badge or this token ready at the reception desk upon arrival.\n\nWarm regards,\nThe Organizing Committee"
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: "company_org", label: "Studio / Affiliation", type: "text", required: true },
    {
      id: "dietary_needs",
      label: "Dietary Considerations",
      type: "select",
      options: ["None", "Vegetarian", "Vegan", "Gluten-Free"],
      required: false,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          ticket_price_dollars: Number(ticketPriceDollars),
          currency,
          email_template: emailTemplate,
          custom_fields: customFields,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = data.error || "Failed to publish event.";
        if (data.details?.fieldErrors) {
          const fieldMsgs = Object.entries(data.details.fieldErrors)
            .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
            .join("; ");
          if (fieldMsgs && !errorMsg.includes(fieldMsgs)) {
            errorMsg = `${errorMsg} (${fieldMsgs})`;
          }
        }
        throw new Error(errorMsg);
      }

      router.push(`/dashboard/events/${data.event.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while drafting the gathering.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Navigation Return */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#f4f3ef] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#e07a5f]" />
          Return to Studio Dashboard
        </Link>
      </div>

      {/* Title & Introduction */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase block">
          Program Drafter · Edition 2027
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
          Publish a New Gathering
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl font-normal leading-relaxed">
          Craft your gathering dossier, set attendance admissions, configure custom guest inquiries, and compose the formal dispatch letter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-[#e07a5f]/10 border border-[#e07a5f]/30 text-[#e07a5f] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Section 01: Gathering Dossier */}
        <div className="editorial-card p-6 space-y-5">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
              Section 01 · Gathering Dossier
            </span>
            <h3 className="font-serif text-lg text-[#f4f3ef] font-normal tracking-tight mt-0.5">
              Title & Program Notes
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Gathering Title"
              placeholder="e.g. Autumn Salon: Architecture, Typographic Craft & Spatial Sound"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Form Description / Event Notes <span className="text-zinc-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe your event, instructions, location, or notes for guests..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/[0.08] bg-[#14151a] px-3.5 py-2.5 text-sm text-[#f4f3ef] placeholder:text-zinc-600 focus:outline-none focus:border-[#e07a5f] transition-colors leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 02: Admission & Pricing */}
        <div className="editorial-card p-6 space-y-5">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
              Section 02 · Admission Terms
            </span>
            <h3 className="font-serif text-lg text-[#f4f3ef] font-normal tracking-tight mt-0.5 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#2a9d8f]" />
              Guest Admission Fare
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              min="0"
              step="0.01"
              label="Fare per Guest"
              placeholder="0.00 for Complimentary"
              value={ticketPriceDollars.toString()}
              onChange={(e) => setTicketPriceDollars(parseFloat(e.target.value) || 0)}
              helperText={
                ticketPriceDollars === 0
                  ? "Open complimentary entry · No payment collected"
                  : `Paid ticket pass · Recorded as ${Math.round(ticketPriceDollars * 100)} cents`
              }
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-white/[0.08] bg-[#14151a] px-3 py-2 text-sm text-[#f4f3ef] focus:outline-none focus:border-[#e07a5f] transition-colors"
              >
                <option value="USD">USD ($) · United States Dollar</option>
                <option value="EUR">EUR (€) · Euro</option>
                <option value="GBP">GBP (£) · British Pound</option>
                <option value="CAD">CAD ($) · Canadian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 03: Dynamic Guest Inquiries */}
        <DynamicFieldsBuilder fields={customFields} onChange={setCustomFields} />

        {/* Section 04: Confirmation Letter */}
        <div className="editorial-card p-6 space-y-5">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase">
              Section 04 · Dispatch Letter
            </span>
            <h3 className="font-serif text-lg text-[#f4f3ef] font-normal tracking-tight mt-0.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#e07a5f]" />
              Guest Confirmation Letter
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Dispatched automatically to the attendee once their RSVP is recorded.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={6}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              required
              className="w-full rounded-lg border border-white/[0.08] bg-[#14151a] p-3.5 text-xs text-[#f4f3ef] font-mono focus:outline-none focus:border-[#e07a5f] transition-colors leading-relaxed"
            />
            <div className="tactile-panel p-3 text-[11px] text-zinc-400 flex flex-wrap items-center gap-2 font-mono">
              <span className="text-zinc-500">Insertable tokens:</span>
              <code className="text-[#e07a5f] bg-white/[0.04] px-1.5 py-0.5 rounded">{"{{attendee_name}}"}</code>
              <code className="text-[#e07a5f] bg-white/[0.04] px-1.5 py-0.5 rounded">{"{{event_title}}"}</code>
              <code className="text-[#e07a5f] bg-white/[0.04] px-1.5 py-0.5 rounded">{"{{check_in_token}}"}</code>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
          <Link href="/dashboard">
            <Button type="button" variant="ghost" size="md">
              Discard Draft
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="gap-2 px-8"
          >
            Publish Gathering
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

