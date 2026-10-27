import Link from "next/link";
import { Plus, BookOpen, Layers } from "lucide-react";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { EventCard } from "@/components/dashboard/event-card";
import type { EventWithParsedFields, OrganizerStats, Registration, CustomField } from "@/types/models";

export const dynamic = "force-dynamic";

async function getOrganizerDashboardData(userId: string) {
  try {
    const supabase = await createClient();
    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*, registrations(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching dashboard data:", error);
      return { events: [], stats: { totalEvents: 0, totalRegistrations: 0, totalRevenueCents: 0, checkInRatePercentage: 0 } };
    }

    let totalRevenueCents = 0;
    let totalRegistrations = 0;
    let totalCheckedIn = 0;

    const eventsWithStats: EventWithParsedFields[] = (eventsData || []).map((e: any) => {
      const regs: Registration[] = e.registrations || [];
      const checkedIn = regs.filter((r) => r.is_checked_in).length;

      regs.forEach((r) => {
        if (r.payment_status === "paid") {
          totalRevenueCents += e.ticket_price;
        }
      });

      totalRegistrations += regs.length;
      totalCheckedIn += checkedIn;

      return {
        ...e,
        custom_fields: Array.isArray(e.custom_fields)
          ? (e.custom_fields as unknown as CustomField[])
          : [],
        registrations_count: regs.length,
        checked_in_count: checkedIn,
      };
    });

    const stats: OrganizerStats = {
      totalEvents: eventsWithStats.length,
      totalRegistrations,
      totalRevenueCents,
      checkInRatePercentage:
        totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0,
    };

    return { events: eventsWithStats, stats };
  } catch (err) {
    console.error("Dashboard data fetch error:", err);
    return { events: [], stats: { totalEvents: 0, totalRegistrations: 0, totalRevenueCents: 0, checkInRatePercentage: 0 } };
  }
}

export default async function DashboardPage() {
  const session = await getOrganizerSession();
  const { events, stats } = await getOrganizerDashboardData(session.user!.id);

  return (
    <div className="space-y-10">
      {/* Studio Desk Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="stamp-badge">
              Active Studio Desk
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              Host: {session.user?.name || "Independent Organizer"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
            Curator’s Working Ledger
          </h1>

          <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
            Monitor RSVP attendance tallies, supervise custom guest inquiry ledgers, and open live reception desk scanners for door admissions.
          </p>
        </div>

        <Link href="/dashboard/events/new">
          <Button variant="primary" size="md" className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            Publish New Gathering
          </Button>
        </Link>
      </div>

      {/* Metrics Overview */}
      <StatsOverview stats={stats} />

      {/* Events Roster Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#e07a5f]" />
            <h2 className="font-serif text-xl text-[#f4f3ef] font-normal tracking-tight">
              Published Gatherings Roster
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {events.length} {events.length === 1 ? "Program" : "Programs"} in Archive
          </span>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01]">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#f4f3ef] font-normal">Your program ledger is empty</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
              Begin by authoring your first salon, symposium, or exhibition. Define custom guest inquiries and issue unique door admission tokens.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/events/new">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Draft First Gathering
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

