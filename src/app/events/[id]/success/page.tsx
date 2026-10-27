import Link from "next/link";
import { notFound } from "next/navigation";
import { Home, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TicketBadge } from "@/components/events/ticket-badge";
import type { Registration } from "@/types/models";

export const dynamic = "force-dynamic";

interface RegistrationSuccessPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

async function getRegistrationData(eventId: string, token?: string) {
  try {
    const supabase = await createClient();
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) return null;

    let regQuery = supabase.from("registrations").select("*").eq("event_id", eventId);
    if (token) {
      regQuery = regQuery.eq("check_in_token", token);
    }

    const { data: registration, error: regErr } = await regQuery
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (regErr || !registration) return null;

    return { event, registration };
  } catch (err) {
    console.error("Error fetching ticket data:", err);
    return null;
  }
}

export default async function RegistrationSuccessPage({
  params,
  searchParams,
}: RegistrationSuccessPageProps) {
  const { id } = await params;
  const { token } = await searchParams;

  const data = await getRegistrationData(id, token);
  if (!data) {
    notFound();
  }

  const { event, registration } = data;

  return (
    <div className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        {/* Salon Confirmation Header */}
        <div className="space-y-3">
          <div className="inline-block">
            <span className="stamp-badge">
              Admission Pass Minted · Confirmed Guest
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#f4f3ef] font-normal tracking-tight">
            Your place is reserved.
          </h1>

          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            You are formally enrolled for <span className="text-[#f4f3ef] font-serif italic text-base">{event.title}</span>. Your physical admission slip has been rendered below.
          </p>
        </div>

        {/* Tactile Admission Ticket Badge */}
        <div className="pt-2">
          <TicketBadge registration={registration as Registration} event={event} />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-white/[0.08]">
          <Link href="/">
            <Button variant="ghost" size="md" className="gap-2 text-xs">
              <Home className="w-4 h-4 text-zinc-400" />
              Return to Gatherings Index
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}`}>
            <Button variant="outline" size="md" className="gap-2 text-xs">
              <Compass className="w-4 h-4 text-[#e07a5f]" />
              Open Organizer Concierge Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

