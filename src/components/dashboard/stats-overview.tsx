import { DollarSign, Calendar, Users, CheckCircle } from "lucide-react";
import { formatTicketPrice } from "@/lib/utils";
import type { OrganizerStats } from "@/types/models";

interface StatsOverviewProps {
  stats: OrganizerStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Gross Revenue",
      value: formatTicketPrice(stats.totalRevenueCents),
      subtitle: "From paid registrations",
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Events",
      value: stats.totalEvents.toString(),
      subtitle: "Published & collecting registrations",
      icon: Calendar,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Total Attendees",
      value: stats.totalRegistrations.toString(),
      subtitle: "Across all organized events",
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "Check-in Rate",
      value: `${stats.checkInRatePercentage}%`,
      subtitle: "Real-time door check-ins",
      icon: CheckCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden transition-all hover:border-slate-700/80 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-white">
                {card.value}
              </span>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
