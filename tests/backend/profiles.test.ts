import assert from "node:assert/strict";
import test from "node:test";
import {
  getProfile,
  updateProfile,
  type ProfileAddressRecord,
  type ProfileDatabase,
} from "@/lib/backend/profiles";
import type { AuthPublicUser } from "@/lib/backend/auth";

const buyer: AuthPublicUser = {
  id: "buyer_1",
  email: "buyer@example.com",
  name: "Amina Buyer",
  role: "buyer",
  status: "active",
};

const artist: AuthPublicUser = {
  id: "artist_1",
  email: "artist@example.com",
  name: "Marie Artist",
  role: "artist",
  status: "active",
};

const admin: AuthPublicUser = {
  id: "admin_1",
  email: "admin@example.com",
  name: "RenewCanvas Admin",
  role: "admin",
  status: "active",
};

test("buyer profile stores notification preferences and default delivery address", async () => {
  const db = createMemoryProfileDatabase();

  const updated = await updateProfile(db, buyer, {
    firstName: "Amina",
    lastName: "Buyer",
    phone: "+250 788 555 010",
    notifications: {
      orderUpdates: true,
      promotions: true,
      newArtworks: false,
      artistUpdates: true,
    },
    address: {
      line1: "KG 123 St",
      city: "Kigali",
      country: "Rwanda",
    },
  });

  assert.equal(updated.displayName, "Amina Buyer");
  assert.equal(updated.profile.notifyPromotions, true);
  assert.equal(updated.address?.line1, "KG 123 St");
});

test("buyer address validation requires street city and country", async () => {
  const db = createMemoryProfileDatabase();

  await assert.rejects(
    () =>
      updateProfile(db, buyer, {
        firstName: "Amina",
        address: { line1: "", city: "Kigali", country: "Rwanda" },
      }),
    /Default address requires/
  );
});

test("artist profile stores public materials and private payout fields", async () => {
  const db = createMemoryProfileDatabase();

  const updated = await updateProfile(db, artist, {
    firstName: "Marie",
    lastName: "Uwimana",
    bio: "Upcycled artist from Kigali.",
    specialties: ["Sculpture", "Sculpture", "Wall Art"],
    techniques: ["Assemblage"],
    preferredMaterials: ["PET Bottles"],
    yearsExperience: 5,
    payoutMethod: "MTN Mobile Money",
    payoutAccountName: "Marie Uwimana",
  });

  assert.deepEqual(updated.profile.specialties, ["Sculpture", "Wall Art"]);
  assert.equal(updated.profile.payoutMethod, "MTN Mobile Money");
});

test("admin profile stores operator details separately from buyer and artist profiles", async () => {
  const db = createMemoryProfileDatabase();

  await updateProfile(db, admin, {
    firstName: "Ops",
    lastName: "Lead",
    title: "Operations Admin",
  });

  const loaded = await getProfile(db, admin);
  assert.equal(loaded.displayName, "Ops Lead");
  assert.equal(loaded.profile.title, "Operations Admin");
  assert.equal((await getProfile(db, buyer)).displayName, "Amina Buyer");
});

function createMemoryProfileDatabase(): ProfileDatabase {
  const buyerProfiles = new Map<string, Record<string, unknown>>();
  const artistProfiles = new Map<string, Record<string, unknown>>();
  const adminProfiles = new Map<string, Record<string, unknown>>();
  const addresses = new Map<string, ProfileAddressRecord>();

  function profileStore(store: Map<string, Record<string, unknown>>) {
    return {
      async findUnique(args: { where: { userId: string } }) {
        return store.get(args.where.userId) ?? null;
      },
      async upsert(args: {
        where: { userId: string };
        update: Record<string, unknown>;
        create: Record<string, unknown>;
      }) {
        const existing = store.get(args.where.userId);
        const next = { ...(existing ?? args.create), ...args.update };
        store.set(args.where.userId, next);
        return next;
      },
    };
  }

  return {
    buyerProfile: profileStore(buyerProfiles),
    artistProfile: profileStore(artistProfiles),
    adminProfile: profileStore(adminProfiles),
    address: {
      async findFirst(args) {
        return (
          Array.from(addresses.values()).find(
            (address) =>
              address.userId === args.where.userId &&
              (typeof args.where.isDefault !== "boolean" || address.isDefault === args.where.isDefault)
          ) ?? null
        );
      },
      async upsert(args) {
        const key = `${args.where.userId_label.userId}:${args.where.userId_label.label}`;
        const now = new Date();
        const existing = addresses.get(key);
        const next = {
          id: existing?.id ?? `address_${addresses.size + 1}`,
          seedKey: null,
          line2: null,
          region: null,
          postalCode: null,
          createdAt: now,
          updatedAt: now,
          ...(existing ?? {}),
          ...args.create,
          ...args.update,
        } as ProfileAddressRecord;
        addresses.set(key, next);
        return next;
      },
    },
  };
}
