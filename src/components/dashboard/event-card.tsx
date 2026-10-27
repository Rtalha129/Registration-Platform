import Link from "next/link";
import { ExternalLink, ArrowRight, UserCheck } from "lucide-react";
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
    <div className="editorial-card rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Badge variant={isFree ? "success" : "default"}>
            {formatTicketPrice(event.ticket_price, event.currency)}
          </Badge>
          <span className="text-[11px] font-mono text-[#787c88]">
            {formatDate(event.created_at)}
          </span>
        </div>

        {/* Title & Description */}
        <h4 className="font-serif text-lg font-medium text-[#f4f3ef] group-hover:text-[#e07a5f] transition-colors line-clamp-1 leading-snug">
          {event.title}
        </h4>
        <p className="text-xs text-[#8c909a] mt-2 line-clamp-2 leading-relaxed">
          {event.description || "No description provided."}
        </p>

        {/* Meta Pills */}
        <div className="mt-4 flex items-center gap-2 text-[11px] text-[#787c88]">
          <span className="px-2 py-0.5 rounded bg-[#181a22] border border-white/[0.06] font-mono">
            {event.custom_fields?.length || 0} custom questions
          </span>
          <span className="px-2 py-0.5 rounded bg-[#181a22] border border-white/[0.06] font-mono">
            {event.currency}
          </span>
        </div>

        {/* Attendance Meter */}
        <div className="mt-5 p-3 rounded-xl bg-[#101217] border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-[#c4c7d0] mb-2 font-medium">
            <span className="flex items-center gap-1.5 text-xs text-[#8c909a]">
              <UserCheck className="w-3.5 h-3.5 text-[#e07a5f]" />
              Guest Check-in
            </span>
            <span className="font-mono text-[11px] text-[#f4f3ef]">
              {checkedIn} / {registered} ({checkInRate}%)
            </span>
          </div>
          <div className="w-full bg-[#1b1e28] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#e07a5f] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${checkInRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2.5">
        <Link href={`/events/${event.id}`} target="_blank" className="flex-1">
          <Button size="sm" variant="outline" className="w-full text-xs gap-1.5 justify-center">
            <ExternalLink className="w-3 h-3 text-[#7d8290]" />
            Public Page
          </Button>
        </Link>
        <Link href={`/dashboard/events/${event.id}`} className="flex-1">
          <Button size="sm" variant="secondary" className="w-full text-xs gap-1.5 justify-center">
            <span>Check-in Desk</span>
            <ArrowRight className="w-3 h-3 text-[#7d8290]" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
