/**
 * Admin Email Reminders API
 * Sends email reminders to admin about unread messages and pending orders
 *
 * POST /api/admin/reminders - Trigger reminder emails (cron-ready)
 *
 * This endpoint can be called by:
 * - Vercel Cron Jobs (recommended)
 * - External cron services
 * - Manual trigger from admin dashboard
 *
 * Requires CRON_SECRET environment variable for security
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { sendEmail } from "@/lib/backend/messaging-providers";

// Admin email to receive reminders
const ADMIN_EMAIL = "hello.renewcanvas.africa@gmail.com";

// Reminder thresholds
const UNREAD_MESSAGE_HOURS = 24; // Remind about messages older than 24 hours
const PENDING_ORDER_DAYS = 3; // Remind about orders pending for 3+ days

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow if either:
    // 1. Valid cron secret provided
    // 2. In development mode without cron secret set
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!hasValidSecret && !isDevelopment) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getDatabaseClient();
    const results: {
      unreadMessages: number;
      pendingOrders: number;
      emailsSent: string[];
      errors: string[];
    } = {
      unreadMessages: 0,
      pendingOrders: 0,
      emailsSent: [],
      errors: [],
    };

    // 1. Check for unread messages older than threshold
    const unreadCutoff = new Date();
    unreadCutoff.setHours(unreadCutoff.getHours() - UNREAD_MESSAGE_HOURS);

    const unreadMessages = await db.contactMessage.findMany({
      where: {
        status: "unread",
        createdAt: { lt: unreadCutoff },
      },
      orderBy: { createdAt: "asc" },
    });

    results.unreadMessages = unreadMessages.length;

    // 2. Check for pending orders (paid but not delivered)
    // Orders with status "paid" that have been in that state for too long
    const pendingCutoff = new Date();
    pendingCutoff.setDate(pendingCutoff.getDate() - PENDING_ORDER_DAYS);

    const pendingOrders = await db.order.findMany({
      where: {
        status: "paid",
        updatedAt: { lt: pendingCutoff },
      },
      include: {
        items: {
          select: {
            title: true,
            artistName: true,
          },
          take: 1,
        },
        buyer: { select: { name: true } },
      },
      orderBy: { updatedAt: "asc" },
    });

    results.pendingOrders = pendingOrders.length;

    // 3. Send reminder email if there are items needing attention
    if (unreadMessages.length > 0 || pendingOrders.length > 0) {
      const emailBody = formatReminderEmail(unreadMessages, pendingOrders);

      try {
        const emailResult = await sendEmail({
          to: ADMIN_EMAIL,
          subject: `[RenewCanvas] Daily Admin Reminder: ${unreadMessages.length} messages, ${pendingOrders.length} pending orders`,
          body: emailBody,
        });

        if (emailResult.status === "sent") {
          results.emailsSent.push("admin_daily_reminder");
        } else {
          results.errors.push(`Failed to send admin reminder: ${emailResult.errorMessage}`);
        }
      } catch (emailError) {
        results.errors.push(`Email error: ${String(emailError)}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("Error processing admin reminders:", error);
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Admin Reminders",
    description: "POST to this endpoint to trigger admin email reminders",
    thresholds: {
      unreadMessageHours: UNREAD_MESSAGE_HOURS,
      pendingOrderDays: PENDING_ORDER_DAYS,
    },
  });
}

function formatReminderEmail(
  unreadMessages: Array<{ id: string; name: string; email: string; subject: string | null; createdAt: Date }>,
  pendingOrders: Array<{ id: string; updatedAt: Date; items: Array<{ title: string; artistName: string }>; buyer: { name: string } }>
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://renewcanvas.africa";
  const now = new Date();

  let body = `
═══════════════════════════════════════════════════════════
                   RENEWCANVAS AFRICA
              Daily Admin Reminder
═══════════════════════════════════════════════════════════

Generated: ${now.toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}

`;

  // Unread Messages Section
  if (unreadMessages.length > 0) {
    body += `
────────────────────────────────────────────────────────────
📬 UNREAD MESSAGES (${unreadMessages.length} older than ${UNREAD_MESSAGE_HOURS} hours)
────────────────────────────────────────────────────────────
`;

    unreadMessages.slice(0, 10).forEach((msg, index) => {
      const age = Math.round((now.getTime() - new Date(msg.createdAt).getTime()) / (1000 * 60 * 60));
      body += `
${index + 1}. From: ${msg.name} <${msg.email}>
   Subject: ${msg.subject || "No subject"}
   Age: ${age} hours
   ID: ${msg.id}
`;
    });

    if (unreadMessages.length > 10) {
      body += `\n   ... and ${unreadMessages.length - 10} more unread messages\n`;
    }

    body += `
View all messages: ${siteUrl}/dashboard/admin/messages
`;
  }

  // Pending Orders Section
  if (pendingOrders.length > 0) {
    body += `
────────────────────────────────────────────────────────────
📦 PENDING ORDERS (${pendingOrders.length} paid but not delivered for ${PENDING_ORDER_DAYS}+ days)
────────────────────────────────────────────────────────────
`;

    pendingOrders.slice(0, 10).forEach((order, index) => {
      const days = Math.round((now.getTime() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      const firstItem = order.items[0];
      body += `
${index + 1}. Order: ${order.id}
   Artwork: ${firstItem?.title || "Unknown"}
   Artist: ${firstItem?.artistName || "Unknown"}
   Buyer: ${order.buyer.name}
   Days since payment: ${days}
`;
    });

    if (pendingOrders.length > 10) {
      body += `\n   ... and ${pendingOrders.length - 10} more pending orders\n`;
    }

    body += `
View all orders: ${siteUrl}/dashboard/admin/orders
`;
  }

  body += `
═══════════════════════════════════════════════════════════
                   ACTION REQUIRED
═══════════════════════════════════════════════════════════

Please review and respond to the items above at your earliest
convenience to maintain excellent customer service.

Admin Dashboard: ${siteUrl}/dashboard/admin

═══════════════════════════════════════════════════════════
                   RenewCanvas Africa
        Transforming waste into art, one masterpiece at a time.
═══════════════════════════════════════════════════════════
`;

  return body.trim();
}
