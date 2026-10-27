"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, Share2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareFormBannerProps {
  eventId: string;
  eventTitle: string;
}

export function ShareFormBanner({ eventId }: ShareFormBannerProps) {
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const formUrl = `${origin}/events/${eventId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="editorial-card p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#f4f3ef] flex items-center gap-2">
              Private Registration Form Link
              <span className="font-mono text-[10px] uppercase text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08] flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-[#e07a5f]" />
                Direct Link Only
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Like Google Forms, send this link to your invitees. Only people with this link can view the form, submit payments, and receive QR passes.
            </p>
          </div>
        </div>

        <Link href={`/events/${eventId}`} target="_blank">
          <Button size="sm" variant="ghost" className="text-xs gap-1.5 text-zinc-300 hover:text-white">
            <ExternalLink className="w-3.5 h-3.5" />
            Open Form Preview
          </Button>
        </Link>
      </div>

      {/* URL input and Copy Button */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 rounded-xl bg-[#0c0d10] border border-white/[0.08] px-3.5 py-2 text-xs font-mono text-[#f4f3ef] select-all overflow-hidden text-ellipsis whitespace-nowrap">
          {formUrl || `/events/${eventId}`}
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={handleCopy}
          className="text-xs gap-1.5 px-4 h-9 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#0c0d10]" />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#0c0d10]" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
