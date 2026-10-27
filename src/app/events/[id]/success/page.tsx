import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Home, Sparkles } from "lucide-react";
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
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        {/* Celebration Header */}
        <div className="space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Registration Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            You are officially registered for <strong>{event.title}</strong>. Your check-in pass has been issued below.
          </p>
        </div>

        {/* Digital Ticket Pass Badge */}
        <TicketBadge registration={registration as Registration} event={event} />

        {/* Navigation & Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/">
            <Button variant="secondary" size="md" className="gap-2 text-xs">
              <Home className="w-4 h-4" />
              Return to Events
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}`}>
            <Button variant="outline" size="md" className="gap-2 text-xs border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              View on Organizer Check-in Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
