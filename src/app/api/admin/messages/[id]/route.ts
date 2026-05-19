import { requireRole } from "@/lib/backend/auth";
import { getDatabaseClient } from "@/lib/backend/db";
import { readSessionCookie } from "@/lib/backend/auth-route";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/admin/messages/[id] - Update message status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabaseClient();
    const session = await requireRole(db, readSessionCookie(req), ["admin"]);

    const { id } = await params;
    const body = await req.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ["unread", "read", "replied", "archived"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    // Update the message
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) {
      const existing = await db.contactMessage.findUnique({ where: { id }, select: { metadata: true } });
      updateData.metadata = {
        ...(existing?.metadata as Record<string, unknown> | null),
        adminNotes: notes,
        lastUpdatedBy: session.id,
      };
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: updated });
  } catch (error) {
    console.error("Failed to update message:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// GET /api/admin/messages/[id] - Get single message details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(req), ["admin"]);

    const { id } = await params;

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to fetch message:", error);
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/messages/[id] - Delete a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(req), ["admin"]);

    const { id } = await params;

    await db.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
