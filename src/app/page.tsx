import Link from "next/link";
import { ArrowRight, Calendar, QrCode, Shield, Sparkles, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { Event } from "@/types/models";

export const dynamic = "force-dynamic";

async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6);
    if (error) {
      console.error("Error fetching featured events:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Error fetching featured events:", err);
    return [];
  }
}

export default async function HomePage() {
  const events = await getFeaturedEvents();

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next.js App Router + Supabase RLS Schema</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Next-Gen Registration & Event Management for{" "}
          <span className="text-gradient">Modern Organizers</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Launch events with dynamic JSONB attendee forms, integrated ticket pricing in cents,
          instant UUID check-in passes, and secure role-based organizer sessions.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2">
              <Zap className="w-4 h-4" />
              Launch Organizer Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="#events">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Browse Public Events
            </Button>
          </Link>
        </div>

        {/* Architecture Badges Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Auth & RLS</span>
            </div>
            <p className="text-xs text-slate-400">PostgreSQL row-level security for Event Organizers</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Database className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">JSONB Forms</span>
            </div>
            <p className="text-xs text-slate-400">Custom dynamic attendee survey questions</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center gap-2 text-violet-400 mb-1">
              <QrCode className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">Live Check-in</span>
            </div>
            <p className="text-xs text-slate-400">UUID tokens & timestamped door check-in scanner</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase">SSR Client</span>
            </div>
            <p className="text-xs text-slate-400">Server Components & Next.js 16 App Router</p>
          </div>
        </div>
      </section>

      {/* Public Events Showcase Section */}
      <section id="events" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="default" className="mb-2">
              Live Showcase
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Upcoming Events</h2>
            <p className="text-sm text-slate-400 mt-1">
              Test attendee registration with dynamic custom fields and instant token generation
            </p>
          </div>

          <Link href="/dashboard/events/new">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Create An Event
            </Button>
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => {
              const isFree = event.ticket_price === 0;
              const customFieldsCount = Array.isArray(event.custom_fields)
                ? event.custom_fields.length
                : 0;

              return (
                <div
                  key={event.id}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant={isFree ? "success" : "default"}>
                        {formatTicketPrice(event.ticket_price, event.currency)}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {formatDate(event.created_at)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-2 hover:text-indigo-300 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{customFieldsCount} custom fields</span>
                      <span className="text-indigo-400 font-medium">Instant Token Pass</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="primary" className="w-full text-xs gap-1.5">
                        Register Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">No active events found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Sign in to your Organizer Dashboard to create and publish your first event, or run the seed SQL in your Supabase SQL editor.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/events/new">
                  <Button variant="glow" size="sm">
                    Create Your First Event
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
