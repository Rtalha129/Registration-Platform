import { Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { Event, Registration } from "@/types/models";

interface TicketBadgeProps {
  registration: Registration;
  event: Event;
}

export function TicketBadge({ registration, event }: TicketBadgeProps) {
  return (
    <div className="max-w-md mx-auto w-full rounded-3xl overflow-hidden border border-indigo-500/30 bg-slate-900/90 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-[11px]">
            Official Admission Pass
          </Badge>
          <span className="text-xs font-mono font-medium text-indigo-100">
            {registration.payment_status.toUpperCase()}
          </span>
        </div>
        <h3 className="text-xl font-bold leading-snug">{event.title}</h3>
        <p className="text-xs text-indigo-100/90 mt-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(registration.created_at)}
        </p>
      </div>

      {/* Perforation Separator */}
      <div className="relative h-6 bg-slate-900 flex items-center justify-between px-3">
        <div className="w-4 h-4 rounded-full bg-[#090d16] -ml-5 border border-indigo-500/20" />
        <div className="w-full border-b-2 border-dashed border-slate-700 mx-2" />
        <div className="w-4 h-4 rounded-full bg-[#090d16] -mr-5 border border-indigo-500/20" />
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Attendee</span>
            <span className="text-sm font-semibold text-white block mt-0.5">
              {registration.attendee_name}
            </span>
            <span className="text-xs text-slate-400 truncate block">
              {registration.attendee_email}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price Paid</span>
            <span className="text-sm font-semibold text-emerald-400 block mt-0.5">
              {formatTicketPrice(event.ticket_price, event.currency)}
            </span>
            <span className="text-xs text-slate-400 block">
              {registration.stripe_payment_id ? "Stripe Confirmed" : "Complimentary"}
            </span>
          </div>
        </div>

        {/* QR Code & Token Box */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center text-center">
          <div className="p-3 rounded-xl bg-white mb-3 shadow-inner">
            {/* SVG QR Code Graphic */}
            <svg
              className="w-32 h-32 text-slate-950"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 0h10v20H40zM50 10h20v10H50zM40 30h10v10H40zM20 40h20v10H20zM60 40h30v10H60zM0 50h20v10H0zM30 60h20v10H30zM70 60h20v10H70zM40 70h20v20H40zM80 80h20v20H80z" />
            </svg>
          </div>

          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
            Check-In Token UUID
          </span>
          <code className="text-xs font-mono text-indigo-300 mt-1 select-all break-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
            {registration.check_in_token}
          </code>
          <p className="text-[11px] text-slate-400 mt-2">
            Present this QR code or token ID at event entrance for instant scan
          </p>
        </div>

        {/* Status notice */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" />
            Confirmed & Active
          </span>
          <span>EventFlow Secure ID</span>
        </div>
      </div>
    </div>
  );
}
