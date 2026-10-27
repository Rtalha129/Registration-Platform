import Link from "next/link";
import { ArrowRight, Calendar, ArrowUpRight } from "lucide-react";
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
      {/* Editorial Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#14161c] text-[#a4a8b5] text-[11px] font-mono tracking-wider uppercase mb-8 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e07a5f]" />
          EventFlow Studio • Host & Welcome
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-tight text-[#f4f3ef] max-w-4xl mx-auto leading-[1.08]">
          Gatherings crafted with <span className="italic font-light text-[#e07a5f]">intention</span>.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#959aa6] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Bespoke registration forms, digital door passes, and an effortless check-in desk
          designed for organizers who care about the guest experience.
        </p>

        {/* Action Controls */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Open Organizer Desk
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#0c0d10]" />
            </Button>
          </Link>

          <Link href="#events">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Explore Gatherings
            </Button>
          </Link>
        </div>

        {/* Tactile Value Pillars */}
        <div className="mt-20 pt-10 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06]">
            <span className="font-mono text-[11px] text-[#e07a5f] block mb-2 font-medium">01 / FORM ENGINE</span>
            <h3 className="font-medium text-sm text-[#f4f3ef]">Dynamic JSONB Inquiries</h3>
            <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
              Design tailored questions—dietary requirements, workshop tracks, or custom notes—stored directly in PostgreSQL.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06]">
            <span className="font-mono text-[11px] text-[#2a9d8f] block mb-2 font-medium">02 / DOOR PASSES</span>
            <h3 className="font-medium text-sm text-[#f4f3ef]">Live Concierge Desk</h3>
            <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
              Every guest receives a verified ticket token. Scan or search in real time at the door with instant attendance stats.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06]">
            <span className="font-mono text-[11px] text-[#d4a373] block mb-2 font-medium">03 / OWNERSHIP</span>
            <h3 className="font-medium text-sm text-[#f4f3ef]">PostgreSQL Row-Level Privacy</h3>
            <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
              Strict database policies ensure each organizer owns their attendees, sales, and guest credentials exclusively.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Gatherings Showcase */}
      <section id="events" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-4 mb-9 pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#f4f3ef]">
              Upcoming Gatherings
            </h2>
            <p className="text-xs text-[#8c909a] mt-1">
              Browse public events and reserve your digital admission pass
            </p>
          </div>

          <Link href="/dashboard/events/new">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              Host a New Gathering
              <ArrowUpRight className="w-3.5 h-3.5 text-[#8c909a]" />
            </Button>
          </Link>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.length > 0 ? (
            events.map((event) => {
              const isFree = event.ticket_price === 0;
              const customFieldsCount = Array.isArray(event.custom_fields)
                ? event.custom_fields.length
                : 0;

              return (
                <div
                  key={event.id}
                  className="editorial-card rounded-2xl p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Badge variant={isFree ? "success" : "default"}>
                        {formatTicketPrice(event.ticket_price, event.currency)}
                      </Badge>
                      <span className="text-[11px] font-mono text-[#787c88]">
                        {formatDate(event.created_at)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#f4f3ef] leading-snug group-hover:text-[#e07a5f] transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-xs text-[#8c909a] mt-2.5 line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#787c88]">
                      <span>{customFieldsCount} attendee {customFieldsCount === 1 ? "field" : "fields"}</span>
                      <span className="font-mono text-[#a4a8b5]">Digital Ticket</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="secondary" className="w-full text-xs gap-1.5 justify-between">
                        <span>Reserve Admission</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#8c909a]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed border-white/[0.08] bg-[#12141a]/50">
              <Calendar className="w-8 h-8 text-[#555a67] mx-auto mb-3" />
              <h3 className="text-base font-serif font-medium text-[#f4f3ef]">No events posted yet</h3>
              <p className="text-xs text-[#8c909a] mt-1.5 max-w-sm mx-auto">
                Sign in to your Organizer Desk to publish your first gathering or run the initial database seed.
              </p>
              <div className="mt-6">
                <Link href="/dashboard/events/new">
                  <Button variant="primary" size="sm">
                    Create Gathering
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
