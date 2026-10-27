import Link from "next/link";
import { Plus, Calendar, Layers, ShieldCheck } from "lucide-react";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Authenticated Organizer Session
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {session.user?.name || "Organizer"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your registered events, custom registration forms, and door check-ins
          </p>
        </div>

        <Link href="/dashboard/events/new">
          <Button variant="glow" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Metrics Overview */}
      <StatsOverview stats={stats} />

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Your Events
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select an event to view registrations or launch the live door check-in scanner
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {events.length} {events.length === 1 ? "Event" : "Events"}
          </span>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No events published yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Get started by creating your first event with custom attendee questions and ticket pricing.
            </p>
            <div className="mt-5">
              <Link href="/dashboard/events/new">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Create First Event
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
