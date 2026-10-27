import { NextRequest, NextResponse } from "next/server";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateEventSchema } from "@/types/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getOrganizerSession();
    const url = new URL(request.url);
    const filterByUser = url.searchParams.get("myEvents") === "true";

    const supabase = await createClient();
    let query = supabase.from("events").select(`
      *,
      registrations (id, is_checked_in)
    `);

    if (filterByUser && session.user) {
      query = query.eq("user_id", session.user.id);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formattedEvents = (data || []).map((e: any) => ({
      ...e,
      registrations_count: e.registrations?.length || 0,
      checked_in_count: e.registrations?.filter((r: any) => r.is_checked_in)?.length || 0,
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getOrganizerSession();

    if (!session.isAuthenticated || !session.user || !session.isOrganizer) {
      return NextResponse.json(
        { error: "Unauthorized. Only Event Organizers can create events." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parseResult = CreateEventSchema.safeParse(body);

    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const issues = Object.entries(fieldErrors)
        .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
        .join("; ");
      console.warn("[api/events] Validation failed:", issues, fieldErrors);
      return NextResponse.json(
        {
          error: issues ? `Validation failed: ${issues}` : "Validation failed",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { title, description, ticket_price_dollars, currency, email_template, custom_fields } =
      parseResult.data;

    const ticket_price = Math.round(ticket_price_dollars * 100); // Convert to cents

    const supabase = await createClient();

    // Ensure user row exists in public.users to satisfy foreign key constraint
    const { error: userUpsertError } = await supabase.from("users").upsert({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    });

    if (userUpsertError) {
      console.warn("[api/events] User upsert warning:", userUpsertError.message);
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: session.user.id,
        title,
        description,
        ticket_price,
        currency,
        email_template,
        custom_fields: custom_fields as any,
      })
      .select()
      .single();

    if (error) {
      console.error("[api/events] Event insert error:", error.message, error.details, error.hint);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, event: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
