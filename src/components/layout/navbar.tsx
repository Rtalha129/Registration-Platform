"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "../ui/button";

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.refresh();
      router.push("/");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#0c0d10]/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-[#181a22] border border-white/[0.12] flex items-center justify-center text-[#f4f3ef] font-serif text-base font-semibold group-hover:border-white/30 transition-colors shadow-sm">
            E
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg tracking-tight font-medium text-[#f4f3ef]">
              EventFlow
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#7d8290]">
              Studio
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-sans tracking-tight">
          <Link
            href="/"
            className="text-[#9ba0aa] hover:text-[#f4f3ef] transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#7d8290]" />
            Gatherings
          </Link>
          <Link
            href="/dashboard"
            className="text-[#9ba0aa] hover:text-[#f4f3ef] transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#7d8290]" />
            Organizer Desk
          </Link>
        </nav>

        {/* User Session / Auth Controls */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-[#e4e6ed] leading-none">
                  {user.name || user.email}
                </span>
                <span className="text-[10px] text-[#7d8290] font-mono mt-0.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  Organizer
                </span>
              </div>

              <Link href="/dashboard">
                <Button size="sm" variant="secondary" className="text-xs">
                  Desk
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                isLoading={isLoggingOut}
                className="text-[#7d8290] hover:text-[#f4f3ef] p-1.5 h-8 w-8 rounded-lg"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="primary" className="text-xs">
                  Host an Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
