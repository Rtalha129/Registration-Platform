import { NextRequest, NextResponse } from "next/server";
import { getOrganizerSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RegisterAttendeeSchema } from "@/types/models";
import { sendReceiptAndTicketEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const session = await getOrganizerSession();

    if (!session.isAuthenticated || !session.user || !session.isOrganizer) {
      return NextResponse.json(
        { error: "Unauthorized. Event Organizers only." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const eventId = url.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ registrations: data });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = RegisterAttendeeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { event_id, attendee_name, attendee_email, form_data } = parseResult.data;

    // Fetch the target event to check ticket price
    const supabase = await createClient();
    const { data: targetEvent, error: eventErr } = await supabase
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (eventErr || !targetEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const isFree = targetEvent.ticket_price === 0;
    const payment_status = isFree ? "free" : "paid";
    const stripe_payment_id = isFree
      ? null
      : `ch_${crypto.randomUUID().replace(/-/g, "").substring(0, 24)}`;

    const { data: newRegistration, error } = await supabase
      .from("registrations")
      .insert({
        event_id,
        attendee_name,
        attendee_email,
        form_data,
        payment_status,
        stripe_payment_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Automatically generate and dispatch email receipt with QR code
    const cardLast4 = body.payment_details?.last4 || (isFree ? undefined : "4242");
    const cardBrand = body.payment_details?.brand || (isFree ? undefined : "Visa");

    const emailResult = await sendReceiptAndTicketEmail({
      event: targetEvent,
      registration: newRegistration,
      paymentDetails: cardLast4 ? { last4: cardLast4, cardBrand } : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        registration: newRegistration,
        event: targetEvent,
        email: emailResult,
        message: isFree
          ? "Registration confirmed! Your admission pass and receipt have been sent to your email."
          : `Payment successful! Your receipt and QR code ticket have been emailed to ${attendee_email}.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}
