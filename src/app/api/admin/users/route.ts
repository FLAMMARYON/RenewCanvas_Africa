/**
 * Admin Users API
 *
 * GET   /api/admin/users  - List real artists & buyers with live status + activity
 * PATCH /api/admin/users  - Suspend / activate a user (admin only)
 * POST  /api/admin/users  - Send an email to a single user via Resend (admin only)
 *
 * Admin-scoped. Mirrors the auth + error-handling pattern used by the other
 * admin routes (see /api/admin/messages, /api/orders).
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { sendEmail } from "@/lib/backend/messaging-providers";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  artistProfile: {
    phone: string | null;
    verificationStatus: string;
    payoutMethod: string | null;
    payoutAccountName: string | null;
    payoutAccountNumber: string | null;
  } | null;
  buyerProfile: { phone: string | null } | null;
  _count: { artworks: number; orders: number };
};

export async function GET(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["admin"]);

    const url = new URL(request.url);
    const role = url.searchParams.get("role"); // "artist" | "buyer"
    const status = url.searchParams.get("status"); // active | suspended | pending_verification
    const search = url.searchParams.get("search")?.trim();

    const where: Record<string, unknown> = { role: { in: ["artist", "buyer"] } };
    if (role === "artist" || role === "buyer") where.role = role;
    if (status === "active" || status === "suspended" || status === "pending_verification") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = (await db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        artistProfile: {
          select: {
            phone: true,
            verificationStatus: true,
            payoutMethod: true,
            payoutAccountName: true,
            payoutAccountNumber: true,
          },
        },
        buyerProfile: { select: { phone: true } },
        _count: { select: { artworks: true, orders: true } },
      },
    })) as unknown as UserRow[];

    const rows = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.artistProfile?.phone ?? user.buyerProfile?.phone ?? null,
      role: user.role,
      status: user.status,
      verified: user.role === "artist" && user.artistProfile?.verificationStatus === "approved",
      joinedAt: user.createdAt.toISOString(),
      artworksCount: user._count.artworks,
      ordersCount: user._count.orders,
      // Artist MoMo payout details so the admin can see each artist's updated
      // payout info from the users view (item 8).
      payoutMethod: user.artistProfile?.payoutMethod ?? null,
      payoutAccountName: user.artistProfile?.payoutAccountName ?? null,
      payoutNumber: user.artistProfile?.payoutAccountNumber ?? null,
    }));

    return NextResponse.json({ ok: true, users: rows });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);

    const body = (await readJsonBody(request)) as Partial<{ id: string; action: "suspend" | "activate" }>;
    const id = typeof body.id === "string" ? body.id : "";
    const action = body.action;
    if (!id || (action !== "suspend" && action !== "activate")) {
      return NextResponse.json({ ok: false, message: "A user id and a suspend/activate action are required." }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!target || (target.role !== "artist" && target.role !== "buyer")) {
      return NextResponse.json({ ok: false, message: "User was not found." }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: { status: action === "suspend" ? "suspended" : "active" },
      select: { id: true, status: true },
    });

    await db.auditLog.create({
      data: {
        actorId: admin.id,
        action: action === "suspend" ? "admin.user.suspend" : "admin.user.activate",
        entity: "User",
        entityId: id,
      },
    });

    return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
  } catch (error) {
    return authErrorResponse(error);
  }
}

/**
 * Send a one-off email to a single user through the existing Resend pipeline
 * (`sendEmail` → messaging-providers). Delivery is best-effort and NON-BLOCKING:
 * a provider failure is logged server-side and returned as `ok:false` with a
 * message — it never throws/500s, so the admin UI stays usable.
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);

    const body = (await readJsonBody(request)) as Partial<{ id: string; subject: string; message: string }>;
    const id = typeof body.id === "string" ? body.id : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!id || !subject || !message) {
      return NextResponse.json({ ok: false, message: "A recipient, subject, and message are required." }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id }, select: { id: true, email: true, role: true } });
    if (!target || (target.role !== "artist" && target.role !== "buyer")) {
      return NextResponse.json({ ok: false, message: "User was not found." }, { status: 404 });
    }

    // Best-effort send; isolate any provider failure so it never crashes the route.
    let delivered = false;
    let failureMessage: string | undefined;
    try {
      const result = await sendEmail({ to: target.email, subject, body: message });
      delivered = result.status === "sent";
      failureMessage = delivered ? undefined : result.errorMessage;
    } catch (sendError) {
      console.error("admin.user.email: delivery failed", { userId: id, error: sendError });
      failureMessage = sendError instanceof Error ? sendError.message : "Email delivery failed.";
    }

    // Record the attempt regardless of outcome (auditability).
    await db.auditLog.create({
      data: {
        actorId: admin.id,
        action: "admin.user.email",
        entity: "User",
        entityId: id,
        metadata: { subject, delivered },
      },
    });

    if (!delivered) {
      return NextResponse.json({ ok: false, delivered: false, message: failureMessage ?? "Email could not be sent." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    return authErrorResponse(error);
  }
}
