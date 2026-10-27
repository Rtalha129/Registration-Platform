import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Ticket, Compass, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation Return */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#f4f3ef] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e07a5f]" />
            Return to Index of Gatherings
          </Link>
        </div>

        {/* Monograph Header */}
        <div className="editorial-card p-8 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3">
              <span className="stamp-badge">
                {isFree ? "Open Admission" : "Ticketed Gathering"}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                № {event.id.slice(0, 8)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#e07a5f]" />
                {formatDate(event.created_at)}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-[#f4f3ef] font-medium">
                {formatTicketPrice(event.ticket_price, event.currency)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-3xl sm:text-5xl text-[#f4f3ef] font-normal tracking-tight leading-[1.15]">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl whitespace-pre-line font-normal">
              {event.description}
            </p>
          </div>
        </div>

        {/* Registration & Protocol Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Guest Etiquette & Information */}
          <div className="lg:col-span-5 space-y-4">
            <div className="editorial-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
                <Compass className="w-4 h-4 text-[#e07a5f]" />
                <h3 className="font-serif text-base text-[#f4f3ef] font-normal">
                  Guest Protocols & Admission
                </h3>
              </div>

              <ul className="text-xs text-zinc-400 space-y-3.5 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct Pass Issuance:</strong> Once registered, you will immediately receive a digital admission slip with your personal verification token.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                  <span>
                    <strong>Reception Desk Check-In:</strong> Present your token voucher or your full name to our door staff upon arrival.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0 mt-0.5" />
                  <span>
                    <strong>Private Curator Handling:</strong> Inquiries submitted with your RSVP are reviewed exclusively by the host organizer.
                  </span>
                </li>
              </ul>
            </div>

            <div className="tactile-panel p-4 flex items-center gap-3">
              <Ticket className="w-4 h-4 text-[#e07a5f] shrink-0" />
              <p className="text-[11px] text-zinc-400 font-mono leading-tight">
                Self-hosted & curated on EventFlow Studio. Independent guest management.
              </p>
            </div>
          </div>

          {/* Right: Registration Ledger Form */}
          <div className="lg:col-span-7">
            <div className="editorial-card p-6 sm:p-8 space-y-6">
              <div className="border-b border-white/[0.06] pb-4">
                <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase block">
                  Guest Ledger
                </span>
                <h2 className="font-serif text-2xl text-[#f4f3ef] font-normal mt-0.5">
                  Reserve Your Place
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Complete the entry slip below to receive your admission pass.
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

