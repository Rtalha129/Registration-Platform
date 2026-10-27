import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Share2,
  Receipt,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Lock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/[0.08] bg-[#14161c] text-[#a4a8b5] text-[11px] font-mono tracking-wider uppercase mb-8 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#e07a5f]" />
          EventFlow Studio · Private Event Form Engine
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif tracking-tight text-[#f4f3ef] max-w-4xl mx-auto leading-[1.08]">
          Create event forms that collect <span className="italic font-light text-[#e07a5f]">payments</span>, receipts & QR passes.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-[#959aa6] max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Like Google Forms built specifically for events. Craft bespoke inquiry questions, share your private form link directly with guests, collect ticket fees, and auto-dispatch digital passes with QR check-in codes.
        </p>

        {/* Action Controls */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard/events/new">
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Create an Event Form
              <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#0c0d10]" />
            </Button>
          </Link>

          <Link href="/login">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Organizer Sign In
            </Button>
          </Link>
        </div>

        {/* 4-Step Form Engine Workflow */}
        <div className="mt-20 pt-10 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-left">
          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#e07a5f]/10 border border-[#e07a5f]/20 flex items-center justify-center text-[#e07a5f] mb-3">
                <ClipboardList className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] text-[#e07a5f] block mb-1 font-medium uppercase tracking-wider">
                Step 01
              </span>
              <h3 className="font-medium text-sm text-[#f4f3ef]">Build Custom Forms</h3>
              <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
                Add attendee questions (dietary needs, company, selections, notes) just like Google Forms.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 flex items-center justify-center text-[#2a9d8f] mb-3">
                <Share2 className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] text-[#2a9d8f] block mb-1 font-medium uppercase tracking-wider">
                Step 02
              </span>
              <h3 className="font-medium text-sm text-[#f4f3ef]">Share Private Link</h3>
              <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
                No public browsing. Share your dedicated direct form link via email, message, or website.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#d4a373]/10 border border-[#d4a373]/20 flex items-center justify-center text-[#d4a373] mb-3">
                <Receipt className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] text-[#d4a373] block mb-1 font-medium uppercase tracking-wider">
                Step 03
              </span>
              <h3 className="font-medium text-sm text-[#f4f3ef]">Payments & Receipts</h3>
              <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
                Accept card payments or free RSVPs. Each attendee gets an instant email receipt.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12141a] border border-white/[0.06] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#70a9a1]/10 border border-[#70a9a1]/20 flex items-center justify-center text-[#70a9a1] mb-3">
                <QrCode className="w-4 h-4" />
              </div>
              <span className="font-mono text-[10px] text-[#70a9a1] block mb-1 font-medium uppercase tracking-wider">
                Step 04
              </span>
              <h3 className="font-medium text-sm text-[#f4f3ef]">QR Door Check-In</h3>
              <p className="text-xs text-[#8c909a] mt-1.5 leading-relaxed">
                Every ticket pass includes a scannable QR code for instant door validation at your concierge desk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Section: Google Forms vs EventFlow */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="editorial-card p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="stamp-badge">
              Engineered for Private Gatherings
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
              Everything Google Forms is missing for events.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Google Forms only collects responses into a spreadsheet. EventFlow handles the complete lifecycle: registration questions, payment checkout, email receipts, and door check-in.
            </p>
          </div>

          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Left: Traditional Google Forms */}
            <div className="p-6 rounded-2xl bg-[#0c0d10] border border-white/[0.06] space-y-4">
              <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest block">
                Standard Survey Tools
              </span>
              <h3 className="text-base font-medium text-[#f4f3ef]">Traditional Google Forms</h3>
              <ul className="space-y-3 text-xs text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">✕</span> No ticket payment collection or card processing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">✕</span> No automatic payment receipt emails
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">✕</span> No QR code passes or admission tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 font-mono">✕</span> Clunky manual attendee check-in at the door
                </li>
              </ul>
            </div>

            {/* Right: EventFlow Studio */}
            <div className="p-6 rounded-2xl bg-[#14161f] border border-[#e07a5f]/30 space-y-4 shadow-lg">
              <span className="font-mono text-[11px] text-[#e07a5f] uppercase tracking-widest block">
                EventFlow Form Engine
              </span>
              <h3 className="text-base font-medium text-[#f4f3ef] flex items-center gap-2">
                Event Registration Forms
                <ShieldCheck className="w-4 h-4 text-[#2a9d8f]" />
              </h3>
              <ul className="space-y-3 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                  <span>Custom question builder (dietary, company, sizes, checkboxes)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                  <span>Built-in card payment checkout & free tier options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                  <span>Automatic email dispatch with itemized receipt & QR code</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                  <span>Live door concierge scanner for instant 1-tap admission</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Privacy Notice Panel */}
          <div className="tactile-panel p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#e07a5f]/10 text-[#e07a5f] border border-[#e07a5f]/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-medium text-[#f4f3ef]">Private Form Links Only</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your event will never appear in a public directory. Only attendees who have your direct link can access and fill out the form.
                </p>
              </div>
            </div>

            <Link href="/dashboard" className="shrink-0">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#e07a5f]" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
