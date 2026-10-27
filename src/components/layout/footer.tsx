export function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.07] bg-[#0c0d10] py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start space-y-1">
            <span className="font-serif text-sm text-[#f4f3ef] font-medium">
              EventFlow Studio
            </span>
            <p className="text-xs text-[#7d8290]">
              Crafted for gathering people in person and online.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#7d8290]">
            <span>Next.js App Router</span>
            <span className="text-white/10">•</span>
            <span>PostgreSQL & RLS</span>
            <span className="text-white/10">•</span>
            <span>TypeScript</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#636773]">
          <p>© {new Date().getFullYear()} EventFlow. All rights reserved.</p>
          <p>Organizers retain full ownership of event data and guest lists.</p>
        </div>
      </div>
    </footer>
  );
}
