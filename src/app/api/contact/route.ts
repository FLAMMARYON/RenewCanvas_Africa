/**
 * Contact / inbound form API.
 *
 * Single entry point for every public inbound form (general contact, artist
 * application, partnership, waste supply, commission enquiry, donation,
 * booking/collection, cancellation request, newsletter signup). Each is
 * discriminated by `type` and stored in the ContactMessage table.
 *
 * Flow: rate-limit -> Zod validate + sanitise -> store in DB -> email support
 * inbox + opted-in admins -> audit log -> success/error response.
 *
 * POST /api/contact
 */

import { NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { notifySupportAndAdmins } from "@/lib/backend/email/notify";
import { recordSecurityEvent, type HardeningDatabase } from "@/lib/backend/hardening";
import { checkInMemoryRateLimit } from "@/lib/foundation/rate-limit";
import { getClientIp } from "@/lib/foundation/request";
import { contactFormSchema, flattenZodError, type ContactFormInput } from "@/lib/validation/schemas";
import type { Prisma } from "@prisma/client";

// Prevent contact-form spam / admin inbox flooding: 5 submissions / 10 min / IP.
const CONTACT_RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 };

const TYPE_LABELS: Record<ContactFormInput["type"], string> = {
  contact_form: "General Inquiry",
  artist_application: "Artist Application",
  partnership_inquiry: "Partnership Inquiry",
  waste_supply_request: "Waste Supply Request",
  commission_request: "Commission Request",
  donation_request: "Donation Request",
  booking_request: "Collection Booking",
  cancellation_request: "Cancellation Request",
  newsletter_signup: "Newsletter Signup",
};

function getTypeLabel(type: ContactFormInput["type"]): string {
  return TYPE_LABELS[type] ?? "Message";
}

// The DB `type` column is a fixed Prisma enum (4 values). Newer form types are
// mapped onto the closest existing value for storage; the precise form type is
// always preserved in metadata.formType so nothing is lost (avoids a migration).
type ContactMessageType =
  | "contact_form"
  | "artist_application"
  | "partnership_inquiry"
  | "waste_supply_request";

function toStoredType(type: ContactFormInput["type"]): ContactMessageType {
  switch (type) {
    case "contact_form":
    case "artist_application":
    case "partnership_inquiry":
    case "waste_supply_request":
      return type;
    case "booking_request":
      return "waste_supply_request";
    case "donation_request":
      return "partnership_inquiry";
    case "commission_request":
    case "cancellation_request":
    case "newsletter_signup":
    default:
      return "contact_form";
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request.headers);
    const rate = checkInMemoryRateLimit(`contact:${clientIp}`, CONTACT_RATE_LIMIT);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429, headers: { "retry-after": String(Math.ceil(CONTACT_RATE_LIMIT.windowMs / 1000)) } }
      );
    }

    const db = getDatabaseClient();
    const rawBody = await request.json().catch(() => null);

    // Zod validation + sanitisation (authoritative).
    const parsed = contactFormSchema.safeParse(rawBody);
    if (!parsed.success) {
      const errors = flattenZodError(parsed.error);
      return NextResponse.json(
        { error: Object.values(errors)[0] ?? "Invalid submission.", errors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Persist (this row is itself the durable audit record of the submission).
    const message = await db.contactMessage.create({
      data: {
        type: toStoredType(data.type),
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || getTypeLabel(data.type),
        message: data.message,
        // Preserve the precise form type alongside any caller-supplied metadata.
        metadata: { formType: data.type, ...(data.metadata ?? {}) } as Prisma.InputJsonValue,
        status: "unread",
      },
    });

    // Notify support inbox + opted-in admins (best-effort; never blocks the user).
    try {
      await notifySupportAndAdmins(db as never, {
        subject: `[RenewCanvas] New ${getTypeLabel(data.type)}: ${data.subject || data.name}`,
        body: formatAdminNotificationEmail(data, message.id),
      });
    } catch (emailError) {
      console.error("Failed to send form notification email:", emailError);
    }

    // Security audit trail (in addition to the ContactMessage row).
    try {
      await recordSecurityEvent(db as unknown as HardeningDatabase, {
        eventType: `form.${data.type}`,
        severity: "info",
        ipAddress: clientIp,
        userAgent: request.headers.get("user-agent") ?? undefined,
        metadata: { messageId: message.id, email: data.email },
      });
    } catch {
      /* audit best-effort */
    }

    return NextResponse.json({
      success: true,
      messageId: message.id,
      message: "Thank you for your message. We will get back to you soon!",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit message. Please try again." },
      { status: 500 }
    );
  }
}

function formatAdminNotificationEmail(data: ContactFormInput, messageId: string): string {
  const typeLabel = getTypeLabel(data.type);
  const metadataSection = data.metadata
    ? `\n\nAdditional Details:\n${JSON.stringify(data.metadata, null, 2)}`
    : "";

  return `
═══════════════════════════════════════════════════════════
                   RENEWCANVAS AFRICA
             New ${typeLabel} Received
═══════════════════════════════════════════════════════════

From: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ""}
${data.subject ? `Subject: ${data.subject}` : ""}

Message:
────────────────────────────────────────────────────────────
${data.message}
────────────────────────────────────────────────────────────
${metadataSection}

────────────────────────────────────────────────────────────
Message ID: ${messageId}
Received: ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}

View in Admin Dashboard:
https://www.renewcanvas.page/dashboard/admin/messages

═══════════════════════════════════════════════════════════
                   RenewCanvas Africa
        Transforming waste into art, one masterpiece at a time.
═══════════════════════════════════════════════════════════
`.trim();
}
