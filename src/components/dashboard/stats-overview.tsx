import { formatTicketPrice } from "@/lib/utils";
import type { OrganizerStats } from "@/types/models";

interface StatsOverviewProps {
  stats: OrganizerStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      label: "Gross Ticket Sales",
      value: formatTicketPrice(stats.totalRevenueCents),
      note: "Confirmed paid registrations",
      accent: "text-[#f4f3ef]",
    },
    {
      label: "Active Gatherings",
      value: stats.totalEvents.toString(),
      note: "Published on your roster",
      accent: "text-[#f4f3ef]",
    },
    {
      label: "Registered Guests",
      value: stats.totalRegistrations.toString(),
      note: "Total attendees on file",
      accent: "text-[#f4f3ef]",
    },
    {
      label: "Door Attendance Rate",
      value: `${stats.checkInRatePercentage}%`,
      note: "Guests checked in at the door",
      accent: "text-[#e07a5f]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-[#13151b] border border-white/[0.07] shadow-sm relative overflow-hidden"
        >
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#7d8290] block">
            {card.label}
          </span>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-serif font-medium tracking-tight ${card.accent}`}>
              {card.value}
            </span>
          </div>
          <p className="text-[11px] text-[#6d7280] mt-1 font-sans">{card.note}</p>
        </div>
      ))}
    </div>
  );
}
