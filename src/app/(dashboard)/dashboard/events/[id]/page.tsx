import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CheckInScanner } from "@/components/dashboard/check-in-scanner";
import type { EventWithParsedFields, CustomField } from "@/types/models";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getEventWithRegistrations(eventId: string) {
  try {
    const supabase = await createClient();
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) return null;

    const { data: registrations } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    const parsedEvent: EventWithParsedFields = {
      ...event,
      custom_fields: Array.isArray(event.custom_fields)
        ? (event.custom_fields as unknown as CustomField[])
        : [],
      registrations_count: registrations?.length || 0,
      checked_in_count: registrations?.filter((r) => r.is_checked_in).length || 0,
    };

    return { event: parsedEvent, registrations: registrations || [] };
  } catch (err) {
    console.error("Error fetching event registrations:", err);
    return null;
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  await getOrganizerSession();

  const data = await getEventWithRegistrations(id);
  if (!data) {
    notFound();
  }

  const { event, registrations } = data;

  return (
    <div className="space-y-6">
      {/* Navigation / Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events Overview
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/events/${event.id}`} target="_blank">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-indigo-500/30">
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Registration Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Check-in Scanner Desk Component */}
      <CheckInScanner event={event} initialRegistrations={registrations} />
    </div>
  );
}
