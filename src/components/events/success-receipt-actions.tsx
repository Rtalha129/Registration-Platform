"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, Mail, CheckCircle, X, ShieldCheck, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTicketPrice, formatDate } from "@/lib/utils";
import type { Event, Registration } from "@/types/models";

interface SuccessReceiptActionsProps {
  registration: Registration;
  event: Event;
}

export function SuccessReceiptActions({ registration, event }: SuccessReceiptActionsProps) {
  const [showEmailReceipt, setShowEmailReceipt] = useState(false);
  const isFree = registration.payment_status === "free";
  const receiptNumber = `RCPT-${new Date().getFullYear()}-${registration.id.slice(0, 8).toUpperCase()}`;
  const formData = (registration.form_data || {}) as Record<string, any>;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Email Dispatched Banner */}
      <div className="tactile-panel p-4 rounded-xl border-[#e07a5f]/30 bg-[#161822] flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#2a9d8f]/10 text-[#2a9d8f] border border-[#2a9d8f]/20 shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-[#2a9d8f] uppercase tracking-wider block font-medium">
              Receipt & Pass Emailed
            </span>
            <p className="text-xs text-zinc-300 mt-0.5">
              A copy of your receipt and QR code ticket was sent to{" "}
              <strong className="text-[#f4f3ef]">{registration.attendee_email}</strong>.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEmailReceipt(true)}
          className="text-xs gap-1.5 shrink-0 border-white/20 hover:border-[#e07a5f]"
        >
          <Receipt className="w-3.5 h-3.5 text-[#e07a5f]" />
          View Receipt
        </Button>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/[0.08]">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrint}
          className="gap-2 text-xs w-full sm:w-auto"
        >
          <Printer className="w-4 h-4 text-zinc-400" />
          Print Receipt & Pass
        </Button>

        <Link href={`/dashboard/events/${event.id}`} className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="gap-2 text-xs w-full sm:w-auto">
            <ShieldCheck className="w-4 h-4 text-[#e07a5f]" />
            Organizer Desk Scanner
          </Button>
        </Link>

        <Link href="/dashboard/events/new" className="w-full sm:w-auto">
          <Button variant="ghost" size="md" className="gap-2 text-xs text-zinc-400 hover:text-white w-full sm:w-auto">
            <Plus className="w-3.5 h-3.5" />
            Create Your Own Form
          </Button>
        </Link>
      </div>

      {/* Modal: View Dispatched Email Receipt */}
      {showEmailReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="editorial-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 text-left relative animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#e07a5f]" />
                <h3 className="font-serif text-lg text-[#f4f3ef] font-normal">
                  Official Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailReceipt(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4.5 rounded-xl bg-[#0c0d10] border border-white/[0.08] space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500">Receipt №</span>
                <span className="text-[#f4f3ef] font-semibold">{receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Event</span>
                <span className="text-[#f4f3ef]">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date Issued</span>
                <span className="text-zinc-300">{formatDate(registration.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Billed To</span>
                <span className="text-zinc-300">{registration.attendee_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email</span>
                <span className="text-zinc-300">{registration.attendee_email}</span>
              </div>
              {registration.stripe_payment_id && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction Ref</span>
                  <span className="text-zinc-400 select-all">{registration.stripe_payment_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Status</span>
                <span className="text-emerald-400 font-semibold uppercase">
                  {isFree ? "Free RSVP ($0.00)" : "Paid & Verified"}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/[0.08] text-sm font-sans font-medium text-[#f4f3ef]">
                <span>Total Amount</span>
                <span className="font-serif text-base">{formatTicketPrice(event.ticket_price, event.currency)}</span>
              </div>
            </div>

            {/* Form Responses Submitted */}
            {Object.keys(formData).length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Responses Captured in Form
                </span>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                  {Object.entries(formData).map(([key, val]) => (
                    <div key={key} className="flex justify-between gap-4">
                      <span className="text-zinc-400 capitalize">{key.replace(/_/g, " ")}:</span>
                      <span className="text-zinc-200 font-medium text-right">
                        {typeof val === "boolean" ? (val ? "Yes" : "No") : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <span className="text-[11px] font-mono text-[#2a9d8f] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Sent to {registration.attendee_email}
              </span>
              <Button size="sm" variant="outline" onClick={handlePrint} className="text-xs gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
