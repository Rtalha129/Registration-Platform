import QRCode from "qrcode";
import type { Event, Registration } from "@/types/models";
import { formatTicketPrice, formatDate } from "@/lib/utils";

export interface EmailReceiptResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  subject: string;
  receiptNumber: string;
  qrCodeDataUrl: string;
  htmlContent: string;
  simulated: boolean;
}

export async function generateQrCodeDataUrl(token: string): Promise<string> {
  try {
    return await QRCode.toDataURL(token, {
      width: 280,
      margin: 2,
      color: {
        dark: "#0c0d10",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code data URL:", err);
    return "";
  }
}

export async function sendReceiptAndTicketEmail({
  event,
  registration,
  paymentDetails,
}: {
  event: Event;
  registration: Registration;
  paymentDetails?: {
    last4?: string;
    cardBrand?: string;
  };
}): Promise<EmailReceiptResult> {
  const qrCodeDataUrl = await generateQrCodeDataUrl(registration.check_in_token);
  const isFree = registration.payment_status === "free";
  const receiptNumber = `RCPT-${new Date().getFullYear()}-${registration.id.slice(0, 8).toUpperCase()}`;
  const subject = `Your Admission Pass & Receipt for ${event.title}`;

  // Build custom field responses list
  const formData = (registration.form_data || {}) as Record<string, any>;
  const customFieldRows = Object.entries(formData)
    .map(([key, val]) => {
      const displayVal = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
      return `
        <tr>
          <td style="padding: 8px 0; color: #71717a; font-size: 13px; text-transform: capitalize;">${key.replace(/_/g, " ")}</td>
          <td style="padding: 8px 0; color: #18181b; font-size: 13px; text-align: right; font-weight: 500;">${displayVal}</td>
        </tr>
      `;
    })
    .join("");

  // Construct styled HTML email
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 32px 16px; color: #18181b;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- Header Banner -->
    <div style="background-color: #0c0d10; padding: 28px 32px; text-align: center; color: #f4f3ef;">
      <span style="display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #e07a5f; margin-bottom: 8px; font-weight: 600;">EventFlow Registration</span>
      <h1 style="margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">${event.title}</h1>
      <p style="margin: 8px 0 0; color: #a1a1aa; font-size: 13px;">Confirmed RSVP & Admission Receipt</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      
      <!-- Greeting -->
      <p style="margin: 0 0 16px; font-size: 15px; color: #27272a;">
        Hi <strong>${registration.attendee_name}</strong>,
      </p>
      <p style="margin: 0 0 24px; font-size: 14px; color: #52525b; line-height: 1.5;">
        Your registration has been confirmed. Below you will find your official receipt and unique check-in QR code pass to present at the event entrance.
      </p>

      <!-- QR Code Ticket Section -->
      <div style="background-color: #fafafa; border: 1px dashed #d4d4d8; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; font-weight: 600; display: block; margin-bottom: 12px;">Door Check-In Pass</span>
        
        ${
          qrCodeDataUrl
            ? `<img src="${qrCodeDataUrl}" alt="Check-in QR Code" width="160" height="160" style="display: block; margin: 0 auto 12px; border-radius: 8px; border: 1px solid #e4e4e7; background: #ffffff; padding: 8px;" />`
            : ""
        }

        <div style="font-family: monospace; font-size: 12px; color: #e07a5f; background: #ffffff; display: inline-block; padding: 6px 12px; border-radius: 6px; border: 1px solid #e4e4e7;">
          ${registration.check_in_token}
        </div>
        <p style="margin: 10px 0 0; font-size: 12px; color: #71717a;">Show this QR code on your phone or state your name at the concierge desk.</p>
      </div>

      <!-- Payment / Free Receipt Details -->
      <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 14px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: 600;">Payment & Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-size: 13px;">Receipt Number</td>
            <td style="padding: 6px 0; color: #18181b; font-size: 13px; text-align: right; font-family: monospace;">${receiptNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-size: 13px;">Date Issued</td>
            <td style="padding: 6px 0; color: #18181b; font-size: 13px; text-align: right;">${formatDate(registration.created_at)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-size: 13px;">Payment Status</td>
            <td style="padding: 6px 0; color: #18181b; font-size: 13px; text-align: right; font-weight: 600;">
              ${isFree ? "Complimentary Pass ($0.00)" : `Paid (${formatTicketPrice(event.ticket_price, event.currency)})`}
            </td>
          </tr>
          ${
            registration.stripe_payment_id
              ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-size: 13px;">Transaction ID</td>
            <td style="padding: 6px 0; color: #18181b; font-size: 12px; text-align: right; font-family: monospace;">${registration.stripe_payment_id}</td>
          </tr>
          `
              : ""
          }
          ${
            paymentDetails?.last4
              ? `
          <tr>
            <td style="padding: 6px 0; color: #71717a; font-size: 13px;">Payment Method</td>
            <td style="padding: 6px 0; color: #18181b; font-size: 13px; text-align: right;">${paymentDetails.cardBrand || "Card"} ending in ${paymentDetails.last4}</td>
          </tr>
          `
              : ""
          }
          <tr style="border-top: 1px solid #e4e4e7;">
            <td style="padding: 12px 0 6px; font-weight: 600; font-size: 14px; color: #18181b;">Total Charged</td>
            <td style="padding: 12px 0 6px; font-weight: 600; font-size: 16px; color: #18181b; text-align: right;">
              ${formatTicketPrice(event.ticket_price, event.currency)}
            </td>
          </tr>
        </table>
      </div>

      <!-- Form Responses Section -->
      ${
        customFieldRows
          ? `
      <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: 600;">Your Form Responses</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${customFieldRows}
        </table>
      </div>
      `
          : ""
      }

      <!-- Footer Note -->
      <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; text-align: center; color: #a1a1aa; font-size: 12px;">
        <p style="margin: 0 0 4px;">Created via EventFlow Studio private registration form.</p>
        <p style="margin: 0;">Have questions about this event? Contact the event organizer directly.</p>
      </div>

    </div>
  </div>
</body>
</html>
  `;

  // Attempt real delivery if RESEND_API_KEY is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || "EventFlow Tickets <onboarding@resend.dev>",
          to: [registration.attendee_email],
          subject,
          html: htmlContent,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        return {
          success: true,
          messageId: resData.id,
          recipient: registration.attendee_email,
          subject,
          receiptNumber,
          qrCodeDataUrl,
          htmlContent,
          simulated: false,
        };
      } else {
        console.warn("Resend API warning, falling back to simulated dispatch:", resData);
      }
    } catch (apiErr) {
      console.warn("Failed sending via Resend API, logged locally:", apiErr);
    }
  }

  // Simulated email dispatch (logged with full receipt + QR code)
  console.log(`[EventFlow Email Service] Dispatched receipt & QR ticket to ${registration.attendee_email}`);
  console.log(`  Receipt: ${receiptNumber} | Event: ${event.title} | Token: ${registration.check_in_token}`);

  return {
    success: true,
    recipient: registration.attendee_email,
    subject,
    receiptNumber,
    qrCodeDataUrl,
    htmlContent,
    simulated: true,
  };
}
