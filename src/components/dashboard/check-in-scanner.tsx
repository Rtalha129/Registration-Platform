"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Search,
  Check,
  RotateCcw,
  User,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Registration, EventWithParsedFields } from "@/types/models";

interface CheckInScannerProps {
  event: EventWithParsedFields;
  initialRegistrations: Registration[];
}

export function CheckInScanner({ event, initialRegistrations }: CheckInScannerProps) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "checked_in" | "pending">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "free" | "pending">("all");
  const [tokenInput, setTokenInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentNotification, setRecentNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const checkedInCount = registrations.filter((r) => r.is_checked_in).length;
  const totalCount = registrations.length;
  const attendanceRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  // Handle Token Direct Quick Check-in
  const handleTokenCheckIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsProcessing(true);
    setRecentNotification(null);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenInput.trim(),
          eventId: event.id,
          action: "check_in",
        }),
      });

      const data = await res.json();

      if (res.ok && data.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === data.registration.id ? data.registration : r))
        );
        setRecentNotification({
          type: "success",
          message: `Welcomed ${data.registration.attendee_name}! Admission confirmed.`,
        });
        setTokenInput("");
      } else {
        setRecentNotification({
          type: "error",
          message: data.error || "Token pass not recognized for this event.",
        });
      }
    } catch (err: any) {
      setRecentNotification({ type: "error", message: err.message || "Network error" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle individual registration check-in status
  const handleToggle = async (registrationId: string) => {
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId,
          eventId: event.id,
          action: "toggle",
        }),
      });

      const data = await res.json();
      if (res.ok && data.registration) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === data.registration.id ? data.registration : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.attendee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendee_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.check_in_token.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "checked_in" && reg.is_checked_in) ||
      (statusFilter === "pending" && !reg.is_checked_in);

    const matchesPayment = paymentFilter === "all" || reg.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-7 rounded-2xl tactile-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#e07a5f] block mb-1">
            Door Concierge • Guest List
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#f4f3ef]">{event.title}</h2>
          <p className="text-xs text-[#8c909a] mt-1 font-sans">
            Verify attendee admission tokens and greet incoming guests
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#181a22] px-6 py-3.5 rounded-xl border border-white/[0.08]">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#787c88] block">Arrived</span>
            <span className="text-xl font-serif font-medium text-[#f4f3ef]">
              {checkedInCount} <span className="text-xs font-sans text-[#787c88]">/ {totalCount}</span>
            </span>
          </div>
          <div className="h-7 w-px bg-white/[0.08]" />
          <div>
            <span className="text-[10px] font-mono uppercase text-[#787c88] block">Attendance</span>
            <span className="text-xl font-serif font-medium text-[#e07a5f]">{attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick Token / Ticket Scanner Bar */}
      <div className="p-5 rounded-2xl bg-[#13151b] border border-white/[0.08] shadow-sm">
        <form onSubmit={handleTokenCheckIn} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787c88]" />
            <input
              type="text"
              placeholder="Paste admission token UUID or scan QR barcode..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full h-10.5 pl-10 pr-4 rounded-xl bg-[#0e1015] border border-white/[0.09] text-xs text-[#f4f3ef] placeholder:text-[#5d6270] focus:outline-none focus:ring-1 focus:ring-white/20 font-mono tracking-tight"
            />
          </div>
          <Button
            type="submit"
            variant="warm"
            size="md"
            isLoading={isProcessing}
            disabled={!tokenInput.trim()}
            className="w-full sm:w-auto h-10.5 px-6 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Check In Guest
          </Button>
        </form>

        {recentNotification && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              recentNotification.type === "success"
                ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                : "bg-rose-950/40 border border-rose-800/40 text-rose-300"
            }`}
          >
            {recentNotification.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {recentNotification.message}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6c707d]" />
          <Input
            placeholder="Search by guest name, email, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9.5 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Check-in status filter */}
          <div className="flex items-center rounded-xl bg-[#14161d] border border-white/[0.08] p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-[#20232e] text-[#f4f3ef] shadow-sm"
                  : "text-[#787c88] hover:text-[#f4f3ef]"
              }`}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "checked_in"
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                  : "text-[#787c88] hover:text-[#f4f3ef]"
              }`}
            >
              Arrived ({checkedInCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                  : "text-[#787c88] hover:text-[#f4f3ef]"
              }`}
            >
              Awaiting ({totalCount - checkedInCount})
            </button>
          </div>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="h-9.5 rounded-xl bg-[#14161d] border border-white/[0.08] px-3 text-xs text-[#a4a8b5] focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <option value="all">All Tiers</option>
            <option value="paid">Paid</option>
            <option value="free">Complimentary</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Guest List Entries */}
      <div className="space-y-2.5">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className={`p-4 rounded-xl border transition-all ${
                reg.is_checked_in
                  ? "bg-[#111618] border-emerald-900/40"
                  : "bg-[#13151b] border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Guest Info */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center font-mono text-xs border ${
                      reg.is_checked_in
                        ? "bg-emerald-950/50 text-emerald-300 border-emerald-800/50"
                        : "bg-[#1b1e28] text-[#9ba0aa] border-white/[0.08]"
                    }`}
                  >
                    {reg.attendee_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-medium text-[#f4f3ef] text-sm">
                        {reg.attendee_name}
                      </h4>
                      <Badge
                        variant={
                          reg.payment_status === "paid"
                            ? "default"
                            : reg.payment_status === "free"
                            ? "secondary"
                            : "warning"
                        }
                      >
                        {reg.payment_status === "free" ? "COMPLIMENTARY" : reg.payment_status.toUpperCase()}
                      </Badge>
                      {reg.is_checked_in ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Expected
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-[#787c88]">{reg.attendee_email}</span>

                    {/* Check-in timestamp */}
                    {reg.checked_in_at && (
                      <span className="block text-[11px] font-mono text-emerald-400/90 mt-0.5">
                        Admitted at: {formatDate(reg.checked_in_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Token ID & Check-in Toggle */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-[#636773] uppercase font-mono block">
                      Ticket Pass
                    </span>
                    <code className="text-xs text-[#a4a8b5] bg-[#0c0d10] px-2 py-0.5 rounded border border-white/[0.06] font-mono">
                      {reg.check_in_token.slice(0, 14)}...
                    </code>
                  </div>

                  <Button
                    size="sm"
                    variant={reg.is_checked_in ? "outline" : "primary"}
                    onClick={() => handleToggle(reg.id)}
                    className={
                      reg.is_checked_in
                        ? "border-emerald-800/50 text-emerald-300 hover:bg-emerald-950/20 text-xs gap-1.5"
                        : "text-xs gap-1.5"
                    }
                  >
                    {reg.is_checked_in ? (
                      <>
                        <RotateCcw className="w-3 h-3 text-emerald-400" />
                        Revert
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-[#0c0d10]" />
                        Admit Guest
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dynamic JSONB Questionnaire Chips */}
              {reg.form_data && Object.keys(reg.form_data).length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.05] flex flex-wrap gap-1.5 text-xs">
                  {Object.entries(reg.form_data).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded-md bg-[#0c0d10] border border-white/[0.06] text-[#b4b7c2] text-[11px] font-sans"
                    >
                      <span className="text-[#6c707d] mr-1.5 capitalize">{key.replace(/_/g, " ")}:</span>
                      {String(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-white/[0.08] bg-[#12141a]/40">
            <User className="w-7 h-7 text-[#555a67] mx-auto mb-2" />
            <h4 className="text-sm font-serif font-medium text-[#f4f3ef]">No matching guests found</h4>
            <p className="text-xs text-[#787c88] mt-1">
              Check your search query or filter settings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
