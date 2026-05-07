import assert from "node:assert/strict";
import test from "node:test";
import {
  assignCommissionRequest,
  createCommissionRequest,
  listCommissionRequests,
  respondToCommissionRequest,
  type CommissionDatabase,
  type CommissionRecord,
  type CommissionUser,
} from "@/lib/backend/commissions";
import type { AuthPublicUser } from "@/lib/backend/auth";

const buyer: AuthPublicUser = {
  id: "buyer_1",
  email: "buyer@example.com",
  name: "Buyer",
  role: "buyer",
  status: "active",
};

const admin: AuthPublicUser = {
  id: "admin_1",
  email: "admin@example.com",
  name: "Admin",
  role: "admin",
  status: "active",
};

const artist: AuthPublicUser = {
  id: "artist_1",
  email: "artist@example.com",
  name: "Artist",
  role: "artist",
  status: "active",
};

test("buyer submits commission request for admin review", async () => {
  const db = createMemoryCommissionDatabase();
  const request = await createCommissionRequest(db, buyer, {
    title: "Custom lobby wall art",
    description: "Create a medium lobby piece from recycled plastic and fabric with blue tones.",
    preferredMaterials: "PET bottles and fabric",
    budgetAmount: 150000,
    sizeCategory: "medium",
  });

  assert.equal(request.status, "submitted");
  assert.equal(request.buyerId, buyer.id);
  assert.equal(request.budgetCents, 15000000);
});

test("admin assigns submitted request to an active artist", async () => {
  const db = createMemoryCommissionDatabase();
  const request = await createCommissionRequest(db, buyer, {
    title: "Reception sculpture",
    description: "Create a sculpture from reclaimed metal for a reception area.",
    budgetAmount: 250000,
    sizeCategory: "custom",
    dimensions: "120cm x 60cm x 60cm",
  });

  const assigned = await assignCommissionRequest(db, admin, {
    requestId: request.id,
    artistId: artist.id,
    adminNotes: "Please confirm material availability.",
  });

  assert.equal(assigned.status, "assigned");
  assert.equal(assigned.assignedArtistId, artist.id);
  assert.equal(assigned.adminNotes, "Please confirm material availability.");
});

test("assigned artist can accept or reject their commission", async () => {
  const db = createMemoryCommissionDatabase();
  const request = await createCommissionRequest(db, buyer, {
    title: "Custom table piece",
    description: "Create a small table artwork from textile offcuts for a home office.",
    budgetAmount: 90000,
    sizeCategory: "small",
  });
  await assignCommissionRequest(db, admin, { requestId: request.id, artistId: artist.id });

  const accepted = await respondToCommissionRequest(db, artist, {
    requestId: request.id,
    decision: "accepted",
    note: "I can start next week.",
  });

  assert.equal(accepted.status, "accepted");
  assert.equal(accepted.artistResponseNote, "I can start next week.");
});

test("commission workflow enforces role and assignment boundaries", async () => {
  const db = createMemoryCommissionDatabase();
  await assert.rejects(
    () =>
      createCommissionRequest(db, artist, {
        title: "Invalid",
        description: "Artists cannot create buyer commission requests.",
        budgetAmount: 1000,
        sizeCategory: "small",
      }),
    /Only buyers/
  );

  const request = await createCommissionRequest(db, buyer, {
    title: "Custom art",
    description: "Create a custom wall piece with recycled cardboard and paint.",
    budgetAmount: 100000,
    sizeCategory: "medium",
  });

  await assert.rejects(
    () => assignCommissionRequest(db, buyer, { requestId: request.id, artistId: artist.id }),
    /Only admins/
  );

  await assignCommissionRequest(db, admin, { requestId: request.id, artistId: artist.id });
  await assert.rejects(
    () =>
      respondToCommissionRequest(
        db,
        { ...artist, id: "artist_2" },
        { requestId: request.id, decision: "accepted" }
      ),
    /another artist/
  );
});

test("listCommissionRequests scopes records by role", async () => {
  const db = createMemoryCommissionDatabase();
  const request = await createCommissionRequest(db, buyer, {
    title: "Custom signage",
    description: "Create office signage from reclaimed wood and bottle caps.",
    budgetAmount: 120000,
    sizeCategory: "large",
  });
  await assignCommissionRequest(db, admin, { requestId: request.id, artistId: artist.id });

  assert.equal((await listCommissionRequests(db, admin)).length, 1);
  assert.equal((await listCommissionRequests(db, buyer)).length, 1);
  assert.equal((await listCommissionRequests(db, artist)).length, 1);
  assert.equal(
    (await listCommissionRequests(db, { ...artist, id: "artist_2" })).length,
    0
  );
});

function createMemoryCommissionDatabase(): CommissionDatabase {
  const users: CommissionUser[] = [
    { id: buyer.id, email: buyer.email, name: buyer.name, role: "buyer" },
    { id: admin.id, email: admin.email, name: admin.name, role: "admin" },
    { id: artist.id, email: artist.email, name: artist.name, role: "artist" },
  ];
  const requests: CommissionRecord[] = [];

  return {
    user: {
      async findFirst(args) {
        return (
          users.find((user) => {
            const matchesId = !args.where.id || user.id === args.where.id;
            const matchesRole = !args.where.role || user.role === args.where.role;
            return matchesId && matchesRole;
          }) ?? null
        );
      },
      async findMany() {
        return users.filter((user) => user.role === "artist");
      },
    },
    commissionRequest: {
      async create(args) {
        const now = new Date();
        const request: CommissionRecord = {
          id: `commission_${requests.length + 1}`,
          assignedArtistId: null,
          preferredMaterials: null,
          dimensions: null,
          status: "submitted",
          adminNotes: null,
          artistResponseNote: null,
          assignedAt: null,
          respondedAt: null,
          createdAt: now,
          updatedAt: now,
          ...args.data,
          buyer: users.find((user) => user.id === args.data.buyerId),
          assignedArtist: null,
        };
        requests.push(request);
        return request;
      },
      async findMany(args) {
        return requests
          .filter((request) => {
            if (typeof args.where.buyerId === "string") return request.buyerId === args.where.buyerId;
            if (typeof args.where.assignedArtistId === "string") {
              return request.assignedArtistId === args.where.assignedArtistId;
            }
            return true;
          })
          .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
      },
      async findUnique(args) {
        return requests.find((request) => request.id === args.where.id) ?? null;
      },
      async update(args) {
        const request = requests.find((item) => item.id === args.where.id);
        assert.ok(request);
        Object.assign(request, args.data, {
          assignedArtist:
            typeof args.data.assignedArtistId === "string"
              ? users.find((user) => user.id === args.data.assignedArtistId) ?? null
              : request.assignedArtist,
          updatedAt: new Date(),
        });
        return request;
      },
    },
  };
}
