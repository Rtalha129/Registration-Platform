"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"organizer" | "attendee">("organizer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: _data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your details and try again.");
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
              New Host Application · Studio Workspace
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
            Join the guild of independent hosts.
          </h1>

          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Publish intimate salons, design conferences, and symposiums with bespoke guest inquiries and door check-in.
          </p>
        </div>

        {/* Studio Application Slip */}
        <div className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.06] pb-3">
            <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase block">
              Curator Dossier
            </span>
            <p className="text-xs text-zinc-400 mt-0.5">
              Set up your organizer credentials to launch your studio.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#e07a5f]/10 border border-[#e07a5f]/30 text-[#e07a5f] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Your Full Name"
              placeholder="e.g. Maya Lin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Work / Studio Email"
              placeholder="maya@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Secret Passkey"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {/* Role Selection */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-medium text-zinc-300">
                Primary Intended Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("organizer")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    role === "organizer"
                      ? "border-[#e07a5f] bg-[#e07a5f]/10 text-[#f4f3ef]"
                      : "border-white/[0.08] bg-[#14151a] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span className="font-medium text-xs text-[#f4f3ef]">Host & Curator</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    Author gatherings, configure custom questions & scan admission passes.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("attendee")}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    role === "attendee"
                      ? "border-[#e07a5f] bg-[#e07a5f]/10 text-[#f4f3ef]"
                      : "border-white/[0.08] bg-[#14151a] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#2a9d8f]" />
                    <span className="font-medium text-xs text-[#f4f3ef]">Guest Attendee</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    RSVP to events and review personal tickets.
                  </span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full text-xs font-medium py-3.5"
              >
                Initialize Organizer Workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            Already registered with an active desk?{" "}
            <Link href="/login" className="text-[#f4f3ef] underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors font-medium">
              Open Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

