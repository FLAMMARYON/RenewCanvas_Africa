import assert from "node:assert/strict";
import test from "node:test";
import { changePassword, hashPassword, verifyPassword, type PasswordChangeDatabase } from "@/lib/backend/auth";

async function makeDb(currentPassword: string, status = "active") {
  const user = {
    id: "u1",
    email: "u@example.com",
    name: "User",
    role: "buyer" as const,
    status: status as "active" | "suspended" | "deleted" | "pending_verification",
    passwordHash: await hashPassword(currentPassword),
  };
  let revokedCount = 0;
  const db: PasswordChangeDatabase = {
    user: {
      findUnique: async () => user,
      update: async ({ data }) => {
        user.passwordHash = data.passwordHash;
        return user;
      },
    },
    authSession: {
      updateMany: async () => {
        revokedCount += 1;
        return { count: 1 };
      },
    },
  };
  return { db, user, revoked: () => revokedCount };
}

test("changePassword updates hash and revokes sessions on valid current password", async () => {
  const { db, user, revoked } = await makeDb("Old1!pass");
  await changePassword(db, "u1", { currentPassword: "Old1!pass", newPassword: "New1!pass" });

  assert.equal(await verifyPassword("New1!pass", user.passwordHash!), true);
  assert.equal(await verifyPassword("Old1!pass", user.passwordHash!), false);
  assert.equal(revoked(), 1, "all sessions should be revoked");
});

test("changePassword rejects an incorrect current password", async () => {
  const { db } = await makeDb("Old1!pass");
  await assert.rejects(
    () => changePassword(db, "u1", { currentPassword: "WrongPass1!", newPassword: "New1!pass" }),
    /Current password is incorrect/
  );
});

test("changePassword rejects a weak new password", async () => {
  const { db } = await makeDb("Old1!pass");
  await assert.rejects(
    () => changePassword(db, "u1", { currentPassword: "Old1!pass", newPassword: "weak" }),
    /Password must include/
  );
});

test("changePassword refuses suspended accounts", async () => {
  const { db } = await makeDb("Old1!pass", "suspended");
  await assert.rejects(
    () => changePassword(db, "u1", { currentPassword: "Old1!pass", newPassword: "New1!pass" }),
    /cannot change its password/
  );
});
