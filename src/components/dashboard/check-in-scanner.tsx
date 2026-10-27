"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Search,
  Check,
  RotateCcw,
  User,
  CreditCard,
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
          message: `Checked in ${data.registration.attendee_name}!`,
        });
        setTokenInput("");
      } else {
        setRecentNotification({
          type: "error",
          message: data.error || "Token not recognized for this event.",
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
      {/* Live Check-in Stats Banner */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5" />
            Live Check-in Desk
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">{event.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time scanner & attendee management for door staff and organizers
          </p>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/80 px-5 py-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Checked In</span>
            <span className="text-xl font-bold text-emerald-400">
              {checkedInCount} / {totalCount}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-xs text-slate-400 block">Attendance</span>
            <span className="text-xl font-bold text-white">{attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick Token / Ticket Scanner Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-lg shadow-indigo-500/5">
        <form onSubmit={handleTokenCheckIn} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              placeholder="Paste check-in token UUID or scan barcode/QR..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-950 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isProcessing}
            disabled={!tokenInput.trim()}
            className="w-full sm:w-auto h-11 text-xs gap-1.5 px-6"
          >
            <CheckCircle2 className="w-4 h-4" />
            Instant Check-In
          </Button>
        </form>

        {recentNotification && (
          <div
            className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              recentNotification.type === "success"
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/15 border border-rose-500/30 text-rose-300"
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by attendee name, email, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Check-in status filter */}
          <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All ({registrations.length})
            </button>
            <button
              onClick={() => setStatusFilter("checked_in")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "checked_in"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Checked In ({checkedInCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Pending ({totalCount - checkedInCount})
            </button>
          </div>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as any)}
            className="h-10 rounded-xl bg-slate-900 border border-slate-800 px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-3">
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((reg) => (
            <div
              key={reg.id}
              className={`p-4 rounded-2xl border transition-all ${
                reg.is_checked_in
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Attendee Info */}
                <div className="flex items-start gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm border ${
                      reg.is_checked_in
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
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
                      <h4 className="font-semibold text-white text-sm">{reg.attendee_name}</h4>
                      <Badge
                        variant={
                          reg.payment_status === "paid"
                            ? "success"
                            : reg.payment_status === "free"
                            ? "secondary"
                            : "warning"
                        }
                      >
                        <CreditCard className="w-3 h-3 mr-0.5" />
                        {reg.payment_status.toUpperCase()}
                      </Badge>
                      {reg.is_checked_in ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-0.5" />
                          Not Checked In
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{reg.attendee_email}</span>

                    {/* Check-in timestamp if present */}
                    {reg.checked_in_at && (
                      <span className="block text-[11px] text-emerald-400 mt-0.5">
                        Checked in at: {formatDate(reg.checked_in_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Check-in Token & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto justify-end">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Token UUID
                    </span>
                    <code className="text-xs text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      {reg.check_in_token.slice(0, 18)}...
                    </code>
                  </div>

                  <Button
                    size="sm"
                    variant={reg.is_checked_in ? "outline" : "primary"}
                    onClick={() => handleToggle(reg.id)}
                    className={
                      reg.is_checked_in
                        ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs gap-1.5"
                        : "text-xs gap-1.5"
                    }
                  >
                    {reg.is_checked_in ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Undo Check-in
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Check In
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Dynamic JSONB Form Data Preview */}
              {reg.form_data && Object.keys(reg.form_data).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap gap-2 text-xs">
                  {Object.entries(reg.form_data).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300"
                    >
                      <strong className="text-slate-400 font-normal mr-1">{key}:</strong>
                      {String(val)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <User className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No attendees match your filter</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or payment status filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
