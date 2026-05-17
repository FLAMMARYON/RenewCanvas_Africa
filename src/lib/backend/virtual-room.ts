import { createOpaqueToken, type AuthPublicUser } from "./auth";

export type VirtualRoomRecord = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  shareToken: string | null;
  roomState: unknown;
  viewedArtworkIds: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type VirtualRoomDatabase = {
  virtualRoomState: {
    create(args: { data: Record<string, unknown> }): Promise<VirtualRoomRecord>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<VirtualRoomRecord>;
    findFirst(args: { where: Record<string, unknown> }): Promise<VirtualRoomRecord | null>;
    findMany(args: { where: Record<string, unknown>; orderBy: { updatedAt: "desc" } }): Promise<VirtualRoomRecord[]>;
  };
  artwork: {
    findMany(args: { where: Record<string, unknown>; include?: unknown; take?: number; orderBy?: unknown }): Promise<unknown[]>;
  };
};

export async function saveVirtualRoom(
  db: VirtualRoomDatabase,
  user: AuthPublicUser,
  input: { id?: string; name?: string; roomState?: unknown; viewedArtworkIds?: string[]; isPublic?: boolean }
) {
  const data = {
    userId: user.id,
    name: cleanText(input.name, 100) ?? "Saved room",
    isPublic: input.isPublic === true,
    shareToken: input.isPublic === true ? createOpaqueToken() : null,
    roomState: input.roomState ?? {},
    viewedArtworkIds: Array.isArray(input.viewedArtworkIds) ? input.viewedArtworkIds.slice(0, 100) : [],
  };
  const room = input.id
    ? await db.virtualRoomState.update({ where: { id: input.id }, data })
    : await db.virtualRoomState.create({ data });
  return normalizeRoom(room);
}

export async function listVirtualRooms(db: VirtualRoomDatabase, user: AuthPublicUser) {
  return (await db.virtualRoomState.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } })).map(normalizeRoom);
}

export async function getSharedVirtualRoom(db: VirtualRoomDatabase, shareToken: string) {
  const room = await db.virtualRoomState.findFirst({ where: { shareToken, isPublic: true } });
  return room ? normalizeRoom(room) : null;
}

export async function listVirtualRoomArtworks(db: VirtualRoomDatabase) {
  return db.artwork.findMany({
    where: { status: "listed" },
    include: { images: true, artist: { select: { id: true, name: true } }, materials: true },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });
}

function normalizeRoom(room: VirtualRoomRecord) {
  return {
    id: room.id,
    userId: room.userId,
    name: room.name,
    isPublic: room.isPublic,
    shareToken: room.shareToken,
    roomState: room.roomState,
    viewedArtworkIds: room.viewedArtworkIds,
    updatedAt: room.updatedAt.toISOString(),
  };
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}
