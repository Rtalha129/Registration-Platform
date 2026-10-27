import Link from "next/link";
import { ExternalLink, QrCode, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { EventWithParsedFields } from "@/types/models";

interface EventCardProps {
  event: EventWithParsedFields;
}

export function EventCard({ event }: EventCardProps) {
  const registered = event.registrations_count || 0;
  const checkedIn = event.checked_in_count || 0;
  const checkInRate = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;
  const isFree = event.ticket_price === 0;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between relative group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={isFree ? "success" : "default"}>
            {formatTicketPrice(event.ticket_price, event.currency)}
          </Badge>
          <span className="text-xs text-slate-400">Created {formatDate(event.created_at)}</span>
        </div>

        {/* Title & Description */}
        <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
          {event.title}
        </h4>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {event.description || "No description provided."}
        </p>

        {/* Custom fields count indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            {event.custom_fields?.length || 0} custom questions
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60">
            {event.currency}
          </span>
        </div>

        {/* Check-in Attendance Progress Bar */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Attendance
            </span>
            <span>
              {checkedIn} / {registered} checked in ({checkInRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${checkInRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <Link href={`/events/${event.id}`} target="_blank" className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Public Form
          </Button>
        </Link>
        <Link href={`/dashboard/events/${event.id}`} className="flex-1">
          <Button size="sm" variant="primary" className="w-full text-xs gap-1.5">
            <QrCode className="w-3.5 h-3.5" />
            Check-in Desk
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
