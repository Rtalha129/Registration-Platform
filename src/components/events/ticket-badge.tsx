"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Calendar, CheckCircle } from "lucide-react";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { Event, Registration } from "@/types/models";

interface TicketBadgeProps {
  registration: Registration;
  event: Event;
  qrDataUrl?: string;
}

export function TicketBadge({ registration, event, qrDataUrl: initialQr }: TicketBadgeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(initialQr || "");

  useEffect(() => {
    if (!qrCodeUrl && registration?.check_in_token) {
      QRCode.toDataURL(registration.check_in_token, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0c0d10",
          light: "#ffffff",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [registration?.check_in_token, qrCodeUrl]);

  return (
    <div className="max-w-md mx-auto w-full rounded-2xl overflow-hidden border border-white/[0.12] bg-[#14161d] shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative">
      {/* Top Section - Event Details */}
      <div className="p-6 pb-5 bg-[#171a23] border-b border-white/[0.06] relative">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#787c88]">
            Official Guest Pass
          </span>
          <span className="stamp-badge text-[#e07a5f] border-[#e07a5f]/80">
            {registration.payment_status === "free" ? "ADMIT ONE" : "PAID ADMISSION"}
          </span>
        </div>

        <h3 className="font-serif text-xl font-medium text-[#f4f3ef] leading-snug">
          {event.title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs text-[#8c909a] font-sans">
          <Calendar className="w-3.5 h-3.5 text-[#e07a5f]" />
          <span>Issued {formatDate(registration.created_at)}</span>
        </div>
      </div>

      {/* Perforation Separator with Notch Cutouts */}
      <div className="relative h-6 bg-[#14161d] flex items-center justify-between px-3">
        <div className="w-5 h-5 rounded-full bg-[#0c0d10] -ml-5.5 border border-white/[0.1]" />
        <div className="w-full border-b border-dashed border-white/[0.15] mx-2" />
        <div className="w-5 h-5 rounded-full bg-[#0c0d10] -mr-5.5 border border-white/[0.1]" />
      </div>

      {/* Bottom Stub */}
      <div className="p-6 pt-3 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <span className="text-[10px] font-mono text-[#636773] uppercase tracking-wider block">
              Guest Name
            </span>
            <span className="text-sm font-medium text-[#f4f3ef] block mt-0.5">
              {registration.attendee_name}
            </span>
            <span className="text-[11px] text-[#787c88] truncate block">
              {registration.attendee_email}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#636773] uppercase tracking-wider block">
              Admission Fare
            </span>
            <span className="text-sm font-serif font-medium text-[#f4f3ef] block mt-0.5">
              {formatTicketPrice(event.ticket_price, event.currency)}
            </span>
            <span className="text-[11px] text-[#787c88] block">
              {registration.stripe_payment_id ? "Paid & Verified" : "Complimentary RSVP"}
            </span>
          </div>
        </div>

        {/* Real QR Code Box */}
        <div className="p-5 rounded-xl bg-[#0c0d10] border border-white/[0.07] flex flex-col items-center text-center">
          <div className="p-3 rounded-lg bg-white mb-3 shadow-sm">
            {qrCodeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrCodeUrl}
                alt="Admission QR Pass"
                width={128}
                height={128}
                className="w-32 h-32 object-contain"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center text-xs text-zinc-500 font-mono">
                Generating pass...
              </div>
            )}
          </div>

          {/* Barcode Graphic */}
          <div className="w-full flex items-center justify-center gap-1 h-5 mb-2.5 opacity-60">
            {[4, 2, 6, 2, 3, 5, 2, 4, 3, 6, 2, 5, 3, 2, 6, 4, 2, 5].map((w, i) => (
              <span key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
            ))}
          </div>

          <span className="text-[10px] uppercase font-mono tracking-widest text-[#636773]">
            Admission Token Passcode
          </span>
          <code className="text-[11px] font-mono text-[#e07a5f] mt-1 select-all break-all bg-[#14161d] px-2.5 py-1 rounded border border-white/[0.06]">
            {registration.check_in_token}
          </code>
        </div>

        {/* Verification Status */}
        <div className="flex items-center justify-between text-xs text-[#787c88] pt-1">
          <span className="flex items-center gap-1.5 text-emerald-400 font-sans text-[11px]">
            <CheckCircle className="w-3.5 h-3.5" />
            Receipt & Pass Emailed
          </span>
          <span className="font-mono text-[10px] text-[#636773]">
            REF #{registration.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
