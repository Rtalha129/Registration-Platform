import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: "Signed out successfully" });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
