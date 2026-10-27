"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="default" className="text-xs">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
            Organizer Authentication
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sign in to EventFlow
          </h1>
          <p className="text-xs text-slate-400">
            Access your events, attendee registrations, and live check-in scanner
          </p>
        </div>

        {/* Standard Email / Password Form */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm">Organizer Credentials</CardTitle>
            <CardDescription className="text-xs">
              Sign in with your Supabase account email and password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <Input
                type="email"
                label="Organizer Email"
                placeholder="organizer@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="glow"
                size="md"
                isLoading={isLoading}
                className="w-full text-xs"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
              Need an organizer account?{" "}
              <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Create Organizer Account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-xs">
          Loading organizer sign-in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
