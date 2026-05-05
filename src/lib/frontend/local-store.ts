export type StoredOrder = {
  id: string;
  artworkId: string;
  artworkTitle: string;
  amount: number;
  customer: Record<string, string>;
  paymentMethod: string;
  status: "pending_payment" | "paid" | "cancelled";
  createdAt: string;
};

export type PasswordResetRequest = {
  email: string;
  requestedAt: string;
  status: "requested" | "completed";
};

export type ArtistProfileDraft = {
  savedAt: string;
  values: Record<string, unknown>;
};

export type ArtworkDraft = {
  id: string;
  title: string;
  status: "draft" | "submitted";
  savedAt: string;
  values: Record<string, unknown>;
};

export type VirtualRoomProgress = {
  room: string;
  wing: number;
  selectedArtworkId?: number;
  updatedAt: string;
};

export const frontendStoreKeys = {
  orders: "renewcanvas.orders.v1",
  latestOrder: "renewcanvas.latestOrder",
  passwordReset: "renewcanvas.passwordReset.v1",
  artistProfile: "renewcanvas.artistProfile.v1",
  artworkDrafts: "renewcanvas.artworkDrafts.v1",
  wishlistRemoved: "renewcanvas.wishlistRemoved.v1",
  virtualRoomProgress: "renewcanvas.virtualRoom.progress.v1",
} as const;

export function readStoreList<T>(key: string): T[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    window.localStorage.removeItem(key);
    return [];
  }
}

export function writeStoreList<T>(key: string, values: T[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(values));
}

export function upsertStoreItem<T>(
  key: string,
  item: T,
  identity: (value: T) => string
): T[] {
  const current = readStoreList<T>(key).filter((value) => identity(value) !== identity(item));
  const next = [item, ...current];
  writeStoreList(key, next);
  return next;
}

export function saveOrder(order: StoredOrder): void {
  upsertStoreItem(frontendStoreKeys.orders, order, (value) => String(value.id));

  if (typeof window !== "undefined") {
    window.localStorage.setItem(frontendStoreKeys.latestOrder, JSON.stringify(order));
  }
}

export function savePasswordResetRequest(request: PasswordResetRequest): void {
  upsertStoreItem(frontendStoreKeys.passwordReset, request, (value) => value.email);
}

export function saveArtistProfileDraft(draft: ArtistProfileDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(frontendStoreKeys.artistProfile, JSON.stringify(draft));
}

export function saveArtworkDraft(draft: ArtworkDraft): void {
  upsertStoreItem(frontendStoreKeys.artworkDrafts, draft, (value) => value.id);
}

export function markWishlistItemRemoved(id: string): void {
  const removed = new Set(readStoreList<string>(frontendStoreKeys.wishlistRemoved));
  removed.add(id);
  writeStoreList(frontendStoreKeys.wishlistRemoved, Array.from(removed));
}

export function readRemovedWishlistIds(): Set<string> {
  return new Set(readStoreList<string>(frontendStoreKeys.wishlistRemoved));
}

export function saveVirtualRoomProgress(progress: Omit<VirtualRoomProgress, "updatedAt">): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    frontendStoreKeys.virtualRoomProgress,
    JSON.stringify({ ...progress, updatedAt: new Date().toISOString() })
  );
}

export function readVirtualRoomProgress(): VirtualRoomProgress | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(frontendStoreKeys.virtualRoomProgress);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as VirtualRoomProgress;
  } catch {
    window.localStorage.removeItem(frontendStoreKeys.virtualRoomProgress);
    return null;
  }
}
