"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      setError(err.message || "Signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="default" className="text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            Organizer Registration
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create an Event Organizer Account
          </h1>
          <p className="text-xs text-slate-400">
            Configure role-based access for managing ticket sales, custom forms, and check-ins
          </p>
        </div>

        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm">Account Details</CardTitle>
            <CardDescription className="text-xs">
              Fill in your credentials to initialize your organizer workspace
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="Jane Organizer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                type="email"
                label="Work Email"
                placeholder="jane@events.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("organizer")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      role === "organizer"
                        ? "border-indigo-500 bg-indigo-500/10 text-white font-medium"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="font-semibold block text-indigo-300">Event Organizer</span>
                    <span className="text-[10px] text-slate-400">Create & manage events</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("attendee")}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      role === "attendee"
                        ? "border-indigo-500 bg-indigo-500/10 text-white font-medium"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="font-semibold block text-slate-300">Attendee</span>
                    <span className="text-[10px] text-slate-400">View ticket passes</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="glow"
                size="md"
                isLoading={isLoading}
                className="w-full text-xs"
              >
                Complete Registration
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Already have an organizer account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
