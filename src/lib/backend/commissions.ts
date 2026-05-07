import { AuthError, type AuthPublicUser } from "./auth";

export type CommissionSizeCategory = "small" | "medium" | "large" | "custom";
export type CommissionRequestStatus =
  | "submitted"
  | "assigned"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type CommissionUser = {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "artist" | "admin";
};

export type CommissionRecord = {
  id: string;
  buyerId: string;
  assignedArtistId: string | null;
  title: string;
  description: string;
  preferredMaterials: string | null;
  budgetCents: number;
  currency: string;
  sizeCategory: CommissionSizeCategory;
  dimensions: string | null;
  status: CommissionRequestStatus;
  adminNotes: string | null;
  artistResponseNote: string | null;
  assignedAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  buyer?: CommissionUser;
  assignedArtist?: CommissionUser | null;
};

export type CommissionDatabase = {
  user: {
    findFirst(args: {
      where: { id?: string; role?: "artist"; status?: "active" };
      select?: { id: true; name: true; email: true; role: true };
    }): Promise<CommissionUser | null>;
    findMany(args: {
      where: { role: "artist"; status: "active" };
      select: { id: true; name: true; email: true; role: true };
      orderBy: { name: "asc" };
    }): Promise<CommissionUser[]>;
  };
  commissionRequest: {
    create(args: {
      data: {
        buyerId: string;
        title: string;
        description: string;
        preferredMaterials?: string;
        budgetCents: number;
        currency: string;
        sizeCategory: CommissionSizeCategory;
        dimensions?: string;
      };
      include: CommissionInclude;
    }): Promise<CommissionRecord>;
    findMany(args: {
      where: Record<string, unknown>;
      include: CommissionInclude;
      orderBy: { createdAt: "desc" };
    }): Promise<CommissionRecord[]>;
    findUnique(args: {
      where: { id: string };
      include: CommissionInclude;
    }): Promise<CommissionRecord | null>;
    update(args: {
      where: { id: string };
      data: Partial<CommissionRecord>;
      include: CommissionInclude;
    }): Promise<CommissionRecord>;
  };
};

type CommissionInclude = {
  buyer: { select: { id: true; name: true; email: true; role: true } };
  assignedArtist: { select: { id: true; name: true; email: true; role: true } };
};

export const commissionInclude: CommissionInclude = {
  buyer: { select: { id: true, name: true, email: true, role: true } },
  assignedArtist: { select: { id: true, name: true, email: true, role: true } },
};

export function normalizeCommissionRequest(record: CommissionRecord) {
  return {
    ...record,
    budgetAmount: record.budgetCents / 100,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    assignedAt: record.assignedAt?.toISOString() ?? null,
    respondedAt: record.respondedAt?.toISOString() ?? null,
  };
}

export async function createCommissionRequest(
  db: CommissionDatabase,
  buyer: AuthPublicUser,
  input: {
    title: string;
    description: string;
    preferredMaterials?: string;
    budgetAmount: number;
    sizeCategory: CommissionSizeCategory;
    dimensions?: string;
  }
): Promise<CommissionRecord> {
  if (buyer.role !== "buyer") {
    throw new AuthError("forbidden", "Only buyers can submit commission requests.", 403);
  }

  const data = validateCommissionInput(input);

  return db.commissionRequest.create({
    data: {
      buyerId: buyer.id,
      title: data.title,
      description: data.description,
      preferredMaterials: data.preferredMaterials,
      budgetCents: Math.round(data.budgetAmount * 100),
      currency: "RWF",
      sizeCategory: data.sizeCategory,
      dimensions: data.dimensions,
    },
    include: commissionInclude,
  });
}

export async function listCommissionRequests(
  db: CommissionDatabase,
  user: AuthPublicUser
): Promise<CommissionRecord[]> {
  const where =
    user.role === "admin"
      ? {}
      : user.role === "buyer"
      ? { buyerId: user.id }
      : { assignedArtistId: user.id };

  return db.commissionRequest.findMany({
    where,
    include: commissionInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function listAssignableArtists(db: CommissionDatabase): Promise<CommissionUser[]> {
  return db.user.findMany({
    where: { role: "artist", status: "active" },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function assignCommissionRequest(
  db: CommissionDatabase,
  admin: AuthPublicUser,
  input: { requestId: string; artistId: string; adminNotes?: string },
  now = new Date()
): Promise<CommissionRecord> {
  if (admin.role !== "admin") {
    throw new AuthError("forbidden", "Only admins can assign commission requests.", 403);
  }

  const request = await db.commissionRequest.findUnique({
    where: { id: input.requestId },
    include: commissionInclude,
  });
  if (!request) {
    throw new AuthError("not_found", "Commission request not found.", 404);
  }

  const artist = await db.user.findFirst({
    where: { id: input.artistId, role: "artist", status: "active" },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!artist) {
    throw new AuthError("invalid_artist", "Choose an active artist for this commission.", 400);
  }

  if (request.status === "accepted" || request.status === "completed" || request.status === "cancelled") {
    throw new AuthError("invalid_status", "This commission can no longer be reassigned.", 400);
  }

  return db.commissionRequest.update({
    where: { id: input.requestId },
    data: {
      assignedArtistId: artist.id,
      status: "assigned",
      adminNotes: normalizeOptionalText(input.adminNotes),
      artistResponseNote: null,
      assignedAt: now,
      respondedAt: null,
    },
    include: commissionInclude,
  });
}

export async function respondToCommissionRequest(
  db: CommissionDatabase,
  artist: AuthPublicUser,
  input: { requestId: string; decision: "accepted" | "rejected"; note?: string },
  now = new Date()
): Promise<CommissionRecord> {
  if (artist.role !== "artist") {
    throw new AuthError("forbidden", "Only assigned artists can respond to commissions.", 403);
  }

  const request = await db.commissionRequest.findUnique({
    where: { id: input.requestId },
    include: commissionInclude,
  });
  if (!request) {
    throw new AuthError("not_found", "Commission request not found.", 404);
  }

  if (request.assignedArtistId !== artist.id) {
    throw new AuthError("forbidden", "This commission is assigned to another artist.", 403);
  }

  if (request.status !== "assigned") {
    throw new AuthError("invalid_status", "Only assigned commissions can be accepted or rejected.", 400);
  }

  return db.commissionRequest.update({
    where: { id: input.requestId },
    data: {
      status: input.decision,
      artistResponseNote: normalizeOptionalText(input.note),
      respondedAt: now,
    },
    include: commissionInclude,
  });
}

function validateCommissionInput(input: {
  title: string;
  description: string;
  preferredMaterials?: string;
  budgetAmount: number;
  sizeCategory: CommissionSizeCategory;
  dimensions?: string;
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const preferredMaterials = normalizeOptionalText(input.preferredMaterials);
  const dimensions = normalizeOptionalText(input.dimensions);

  if (title.length < 3 || title.length > 120) {
    throw new AuthError("invalid_title", "Enter a project title between 3 and 120 characters.", 400);
  }

  if (description.length < 20 || description.length > 2000) {
    throw new AuthError("invalid_description", "Describe the commission in 20 to 2000 characters.", 400);
  }

  if (!Number.isFinite(input.budgetAmount) || input.budgetAmount <= 0 || input.budgetAmount > 100_000_000) {
    throw new AuthError("invalid_budget", "Enter a valid budget amount.", 400);
  }

  if (!["small", "medium", "large", "custom"].includes(input.sizeCategory)) {
    throw new AuthError("invalid_size", "Choose a valid size option.", 400);
  }

  if (input.sizeCategory === "custom" && !dimensions) {
    throw new AuthError("missing_dimensions", "Enter dimensions when using custom size.", 400);
  }

  return {
    title,
    description,
    preferredMaterials,
    budgetAmount: input.budgetAmount,
    sizeCategory: input.sizeCategory,
    dimensions,
  };
}

function normalizeOptionalText(value: string | undefined | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
