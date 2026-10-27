import { NextRequest, NextResponse } from "next/server";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getOrganizerSession();

    if (!session.isAuthenticated || !session.user || !session.isOrganizer) {
      return NextResponse.json(
        { error: "Unauthorized. Event Organizers only." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { token, registrationId, action = "toggle" } = body;

    const identifier = token || registrationId;

    if (!identifier) {
      return NextResponse.json(
        { error: "Missing check_in_token or registrationId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query registration first with event ownership
    let query = supabase.from("registrations").select("*, events!inner(user_id)");
    if (token) {
      query = query.eq("check_in_token", token);
    } else {
      query = query.eq("id", registrationId);
    }

    const { data: reg, error: fetchErr } = await query.single();
    if (fetchErr || !reg) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    // Verify organizer owns the event
    const eventOwnerId = (reg as any).events?.user_id;
    if (eventOwnerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You do not own this event." },
        { status: 403 }
      );
    }

    const newCheckedIn = action === "toggle" ? !reg.is_checked_in : true;
    const checkedInAt = newCheckedIn ? new Date().toISOString() : null;

    const { data: updated, error: updateErr } = await supabase
      .from("registrations")
      .update({
        is_checked_in: newCheckedIn,
        checked_in_at: checkedInAt,
      })
      .eq("id", reg.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      registration: updated,
      message: newCheckedIn ? "Attendee checked in successfully!" : "Check-in reversed.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
