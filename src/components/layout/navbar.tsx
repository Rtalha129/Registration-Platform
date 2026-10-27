"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, CheckCircle2, LayoutDashboard, LogOut, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-indigo-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              EventFlow
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-slate-400 -mt-1">Organizer & Registration Platform</span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            Events
          </Link>
          <Link
            href="/dashboard"
            className="text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Organizer Dashboard
          </Link>
        </nav>

        {/* User Session / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium text-slate-200">{user.name || user.email}</span>
                <Badge variant="default" className="text-[10px] py-0 px-2 mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-indigo-400" />
                  Organizer
                </Badge>
              </div>

              <Link href="/dashboard">
                <Button size="sm" variant="secondary" className="gap-1.5">
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  Dashboard
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                isLoading={isLoggingOut}
                className="text-slate-400 hover:text-rose-400"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="primary" className="text-xs">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
