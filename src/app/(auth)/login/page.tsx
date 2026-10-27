"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"organizer" | "attendee">("organizer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In handler
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

  // Sign Up handler
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

      router.refresh();
      router.push(redirectPath);
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
              {mode === "login" ? "Curator Portal · Door Access" : "New Host Application · Studio Workspace"}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#f4f3ef] font-normal tracking-tight">
            {mode === "login" ? "Welcome back to your studio desk." : "Join the guild of independent hosts."}
          </h1>

          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {mode === "login"
              ? "Access your gatherings archive, review guest inquiry ledgers, and supervise live reception check-in."
              : "Publish intimate salons, design conferences, and symposiums with bespoke guest inquiries and door check-in."}
          </p>
        </div>

        {/* Studio Slip Card */}
        <div className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-white/[0.06] pb-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-[#e07a5f] uppercase block">
                {mode === "login" ? "Authentication Credentials" : "Curator Registration Dossier"}
              </span>
              <p className="text-xs text-zinc-400 mt-0.5">
                {mode === "login"
                  ? "Enter your email and password to open your active session."
                  : "Set up your credentials to launch your organizer workspace."}
              </p>
            </div>
          </div>

          {mode === "login" ? (
            /* Sign In Form */
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

              {/* Option directly under the text boxes */}
              <div className="pt-1 pb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Don&apos;t have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-[#f4f3ef] font-medium underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors"
                >
                  Create one today
                </button>
              </div>

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
          ) : (
            /* Sign Up / Create Account Form */
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
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === "organizer"
                        ? "border-[#e07a5f] bg-[#e07a5f]/10 text-[#f4f3ef]"
                        : "border-white/[0.08] bg-[#14151a] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-medium text-xs text-[#f4f3ef] block">Host & Curator</span>
                    <span className="text-[11px] text-zinc-400 leading-tight block mt-0.5">
                      Publish gatherings & door check-in
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("attendee")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === "attendee"
                        ? "border-[#e07a5f] bg-[#e07a5f]/10 text-[#f4f3ef]"
                        : "border-white/[0.08] bg-[#14151a] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-medium text-xs text-[#f4f3ef] block">Guest Attendee</span>
                    <span className="text-[11px] text-zinc-400 leading-tight block mt-0.5">
                      RSVP to events & view passes
                    </span>
                  </button>
                </div>
              </div>

              {/* Option directly under the text boxes */}
              <div className="pt-1 pb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-[#f4f3ef] font-medium underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors"
                >
                  Sign in instead
                </button>
              </div>

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
            </form>
          )}

          <div className="pt-4 border-t border-white/[0.06] text-center text-xs text-zinc-400">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className="text-[#f4f3ef] underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors font-medium ml-1"
                >
                  Create one today
                </button>
              </>
            ) : (
              <>
                Already registered with an active desk?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className="text-[#f4f3ef] underline decoration-[#e07a5f] hover:text-[#e07a5f] transition-colors font-medium ml-1"
                >
                  Open Sign In
                </button>
              </>
            )}
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

