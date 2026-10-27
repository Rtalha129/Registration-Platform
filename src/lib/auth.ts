import { createClient } from "./supabase/server";
import type { User } from "@/types/models";

export interface AuthSession {
  user: User | null;
  isOrganizer: boolean;
  isAuthenticated: boolean;
}

/**
 * Server-side helper to get the currently authenticated organizer session.
 * Queries Supabase Auth SSR and verifies the organizer role from public.users.
 */
export async function getOrganizerSession(): Promise<AuthSession> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return {
        user: null,
        isOrganizer: false,
        isAuthenticated: false,
      };
    }

    // Query public.users table to verify role
    let { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    if (!profile) {
      const fallbackRole = (authUser.user_metadata?.role || "organizer") as User["role"];
      const newProfile = {
        id: authUser.id,
        email: authUser.email || "",
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Organizer",
        role: fallbackRole,
      };

      const { data: insertedProfile } = await supabase
        .from("users")
        .upsert(newProfile)
        .select()
        .maybeSingle();

      if (insertedProfile) {
        profile = insertedProfile;
      }
    }

    const role = (profile?.role || authUser.user_metadata?.role || "organizer") as User["role"];

    const user: User = profile || {
      id: authUser.id,
      email: authUser.email || "",
      name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || null,
      role,
      created_at: authUser.created_at,
    };

    const isOrganizer = user.role === "organizer" || user.role === "admin";

    return {
      user,
      isOrganizer,
      isAuthenticated: true,
    };
  } catch (err) {
    console.error("Auth session check error:", err);
    return {
      user: null,
      isOrganizer: false,
      isAuthenticated: false,
    };
  }
}
