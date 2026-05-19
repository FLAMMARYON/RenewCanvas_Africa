/**
 * Admin Messages API
 * Manage contact form submissions and other messages
 *
 * GET /api/admin/messages - List all messages (admin only)
 * PATCH /api/admin/messages - Update message status (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getDatabaseClient } from "@/lib/backend/db";
import { requireRole } from "@/lib/backend/auth";
import { readSessionCookie } from "@/lib/backend/auth-route";

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();

    // Require admin authentication
    await requireRole(db, readSessionCookie(request), ["admin"]);

    const url = new URL(request.url);

    // Parse query parameters
    const type = url.searchParams.get("type");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const search = url.searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await db.contactMessage.count({ where });

    // Get messages
    const messages = await db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get unread count
    const unreadCount = await db.contactMessage.count({
      where: { status: "unread" },
    });

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();

    // Require admin authentication
    await requireRole(db, readSessionCookie(request), ["admin"]);

    const body = await request.json();

    const { id, status, replyNote } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["unread", "read", "replied", "archived"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "replied") {
        updateData.repliedAt = new Date();
      }
    }

    if (replyNote !== undefined) {
      updateData.replyNote = replyNote;
    }

    // Update message
    const updated = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: updated,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
