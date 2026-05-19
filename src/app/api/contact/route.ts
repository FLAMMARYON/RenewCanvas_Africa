/**
 * Contact Form API
 * Handles contact form submissions, artist applications, and partnership inquiries
 *
 * POST /api/contact - Submit a contact message
 */

import { NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { sendEmail } from "@/lib/backend/messaging-providers";
import type { Prisma } from "@prisma/client";

// Admin email to receive notifications
const ADMIN_EMAIL = "hello.renewcanvas.africa@gmail.com";

interface ContactFormInput {
  type: "contact_form" | "artist_application" | "partnership_inquiry" | "waste_supply_request";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

function validateContactInput(input: unknown): { valid: true; data: ContactFormInput } | { valid: false; error: string } {
  if (!input || typeof input !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const body = input as Record<string, unknown>;

  // Validate type
  const validTypes = ["contact_form", "artist_application", "partnership_inquiry", "waste_supply_request"];
  if (!body.type || !validTypes.includes(body.type as string)) {
    return { valid: false, error: "Invalid message type" };
  }

  // Validate required fields
  if (!body.name || typeof body.name !== "string" || body.name.trim().length < 2) {
    return { valid: false, error: "Name is required (minimum 2 characters)" };
  }

  if (!body.email || typeof body.email !== "string" || !isValidEmail(body.email)) {
    return { valid: false, error: "Valid email address is required" };
  }

  if (!body.message || typeof body.message !== "string" || body.message.trim().length < 10) {
    return { valid: false, error: "Message is required (minimum 10 characters)" };
  }

  return {
    valid: true,
    data: {
      type: body.type as ContactFormInput["type"],
      name: (body.name as string).trim(),
      email: (body.email as string).trim().toLowerCase(),
      phone: body.phone ? String(body.phone).trim() : undefined,
      subject: body.subject ? String(body.subject).trim() : undefined,
      message: (body.message as string).trim(),
      metadata: body.metadata as Record<string, unknown> | undefined,
    },
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function getTypeLabel(type: ContactFormInput["type"]): string {
  const labels: Record<string, string> = {
    contact_form: "General Inquiry",
    artist_application: "Artist Application",
    partnership_inquiry: "Partnership Inquiry",
    waste_supply_request: "Waste Supply Request",
  };
  return labels[type] || "Message";
}

export async function POST(request: Request) {
  try {
    const db = getDatabaseClient();
    const body = await request.json();

    // Validate input
    const validation = validateContactInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { data } = validation;

    // Save to database
    const message = await db.contactMessage.create({
      data: {
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || getTypeLabel(data.type),
        message: data.message,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        status: "unread",
      },
    });

    // Send notification email to admin
    try {
      const emailSubject = `[RenewCanvas] New ${getTypeLabel(data.type)}: ${data.subject || data.name}`;
      const emailBody = formatAdminNotificationEmail(data, message.id);

      await sendEmail({
        to: ADMIN_EMAIL,
        subject: emailSubject,
        body: emailBody,
      });
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error("Failed to send admin notification email:", emailError);
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

function formatAdminNotificationEmail(
  data: ContactFormInput,
  messageId: string
): string {
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
