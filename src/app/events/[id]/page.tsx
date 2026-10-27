import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, ShieldCheck, Tag, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { DynamicRegistrationForm } from "@/components/events/dynamic-registration-form";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { EventWithParsedFields, CustomField } from "@/types/models";

export const dynamic = "force-dynamic";

interface PublicEventPageProps {
  params: Promise<{ id: string }>;
}

async function getPublicEvent(id: string): Promise<EventWithParsedFields | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (error || !data) return null;

    return {
      ...data,
      custom_fields: Array.isArray(data.custom_fields)
        ? (data.custom_fields as unknown as CustomField[])
        : [],
    };
  } catch (err) {
    console.error("Error fetching public event:", err);
    return null;
  }
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { id } = await params;
  const event = await getPublicEvent(id);

  if (!event) {
    notFound();
  }

  const isFree = event.ticket_price === 0;

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Events
        </Link>

        {/* Event Header Banner */}
        <div className="p-8 rounded-3xl glass-panel relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={isFree ? "success" : "default"}>
              <Tag className="w-3 h-3 mr-1" />
              {formatTicketPrice(event.ticket_price, event.currency)}
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1 text-indigo-400" />
              Published {formatDate(event.created_at)}
            </Badge>
            <Badge variant="secondary">Instant QR Ticket</Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
            {event.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {event.description}
          </p>
        </div>

        {/* Registration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: What to Expect */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Admission & Badge Details
              </h3>
              <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>
                    Each attendee receives a unique <strong>check_in_token UUID</strong> pass.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>
                    Door organizers will scan your ticket badge for instant verification.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <span>
                    Custom attendee survey answers are securely encrypted in JSONB format.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Event Organizers manage registrations in real time via EventFlow.</span>
            </div>
          </div>

          {/* Right: Dynamic Registration Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl glass-panel">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Attendee Registration</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Complete the form below to secure your entry pass
                </p>
              </div>

              <DynamicRegistrationForm event={event} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
