"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard Supabase Auth Login handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: _data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      router.refresh();
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        {/* Entrance Heading */}
        <div className="text-center space-y-3">
          <div className="inline-block">
            <span className="stamp-badge">
              Curator Portal · Door Access
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
            Welcome back to your studio desk.
          </h1>

          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Access your gatherings archive, review guest inquiry ledgers, and supervise live reception check-in.
          </p>
        </div>

        {/* Studio Login Slip */}
        <div className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase block">
              Authentication Credentials
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">
              Enter your email and password to open your active session.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#e07a5f]/10 border border-[#e07a5f]/30 text-[#e07a5f] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              type="email"
              label="Organizer Work Email"
              placeholder="curator@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Passkey / Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-xs font-medium py-3.5"
            >
              Open Studio Desk
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="pt-4 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            Hosting gatherings for the first time?{" "}
            <Link href="/signup" className="text-[#f4f3ef] underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors font-medium">
              Register an organizer desk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-zinc-400 font-mono text-xs">
          Opening curator portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

