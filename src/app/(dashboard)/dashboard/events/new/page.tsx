"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DynamicFieldsBuilder } from "@/components/dashboard/dynamic-fields-builder";
import type { CustomField } from "@/types/models";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ticketPriceDollars, setTicketPriceDollars] = useState<number>(0);
  const [currency, setCurrency] = useState("USD");
  const [emailTemplate, setEmailTemplate] = useState(
    "Hi {{attendee_name}},\n\nYour registration for {{event_title}} is confirmed!\n\nYour unique check-in pass token is: {{check_in_token}}\nPresent this token or QR pass at the entrance.\n\nBest regards,\nEventFlow Organizer Team"
  );
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: "company_org", label: "Company / Affiliation", type: "text", required: true },
    {
      id: "tshirt_size",
      label: "T-Shirt Size",
      type: "select",
      options: ["S", "M", "L", "XL", "2XL"],
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
        throw new Error(data.error || "Failed to create event");
      }

      router.push(`/dashboard/events/${data.event.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong creating the event.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          Create New Event
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Set up event details, ticket price in cents, confirmation email template, and dynamic attendee questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Basic Event Information */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Event Details</CardTitle>
            <CardDescription className="text-xs">
              General title, summary, and public description for attendees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Event Title"
              placeholder="e.g. AI Systems & Cloud Summit 2027"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Description & Agenda <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe keynotes, schedule, perks, and target audience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Ticketing & Pricing */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Ticket Pricing
            </CardTitle>
            <CardDescription className="text-xs">
              Stored as integer cents in database schema. Set to 0 for free events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                min="0"
                step="0.01"
                label="Ticket Price (USD/EUR)"
                placeholder="0.00 for Free"
                value={ticketPriceDollars.toString()}
                onChange={(e) => setTicketPriceDollars(parseFloat(e.target.value) || 0)}
                helperText={
                  ticketPriceDollars === 0
                    ? "Event will be free of charge"
                    : `Saved as ${Math.round(ticketPriceDollars * 100)} cents in database`
                }
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic JSONB Fields Builder */}
        <DynamicFieldsBuilder fields={customFields} onChange={setCustomFields} />

        {/* Confirmation Email Template */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              Confirmation Email Template
            </CardTitle>
            <CardDescription className="text-xs">
              Template automatically populated with attendee variables upon registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <textarea
                rows={5}
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-sm text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <p className="text-[11px] text-slate-400">
                Available tags: <code className="text-indigo-300">{"{{attendee_name}}"}</code>,{" "}
                <code className="text-indigo-300">{"{{event_title}}"}</code>,{" "}
                <code className="text-indigo-300">{"{{check_in_token}}"}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link href="/dashboard">
            <Button type="button" variant="outline" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="glow"
            size="md"
            isLoading={isSubmitting}
            className="gap-2 px-8"
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish Event
          </Button>
        </div>
      </form>
    </div>
  );
}
