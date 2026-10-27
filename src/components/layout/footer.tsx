import { Database, ShieldCheck, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="text-sm font-semibold text-slate-200">
              EventFlow • Next.js & Supabase Registration Platform
            </span>
            <p className="text-xs text-slate-400">
              Role-Based Access Control • Dynamic JSONB Form Engine • Instant QR Check-in
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Zap className="w-3 h-3 text-indigo-400" /> Next.js 16 (App Router)
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <Database className="w-3 h-3 text-emerald-400" /> PostgreSQL & RLS
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-3 h-3 text-purple-400" /> Organizer Sessions
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-400">
          Built with TypeScript, Tailwind CSS, and Supabase SSR. Database schema & typed models verified.
        </div>
      </div>
    </footer>
  );
}
