import assert from "node:assert/strict";
import test from "node:test";
import {
  hashPassword,
  loginUser,
  logoutSession,
  readSessionUser,
  registerUser,
  requestPasswordReset,
  requireRole,
  resetPassword,
  verifyPassword,
  type AuthAccountStatus,
  type AuthDatabase,
  type AuthUserRole,
} from "@/lib/backend/auth";

test("hashPassword stores verifiable non-plain-text password hashes", async () => {
  const hash = await hashPassword("Password1!");

  assert.notEqual(hash, "Password1!");
  assert.equal(await verifyPassword("Password1!", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("registerUser creates a real user, session, and email verification token", async () => {
  const db = createMemoryAuthDatabase();
  const result = await registerUser(db, {
    email: "AMINA@example.com",
    name: "Amina Buyer",
    password: "Password1!",
    role: "buyer",
  });

  assert.equal(result.user.email, "amina@example.com");
  assert.equal(result.user.role, "buyer");
  assert.ok(result.sessionToken);
  assert.ok(result.emailVerificationToken);
  assert.equal(db.emailVerificationTokens.length, 1);
  assert.deepEqual(await readSessionUser(db, result.sessionToken), result.user);
});

test("loginUser rejects invalid credentials and suspended accounts", async () => {
  const db = createMemoryAuthDatabase();
  await db.seedUser({
    email: "artist@example.com",
    name: "Artist",
    role: "artist",
    status: "suspended",
    password: "Password1!",
  });

  await assert.rejects(
    () => loginUser(db, { email: "artist@example.com", password: "wrong" }),
    /Invalid email or password/
  );
  await assert.rejects(
    () => loginUser(db, { email: "artist@example.com", password: "Password1!" }),
    /cannot sign in/
  );
});

test("requireRole enforces session-backed role access", async () => {
  const db = createMemoryAuthDatabase();
  await db.seedUser({
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
    status: "active",
    password: "Password1!",
  });

  const login = await loginUser(db, { email: "admin@example.com", password: "Password1!" });
  const admin = await requireRole(db, login.sessionToken, ["admin"]);

  assert.equal(admin.role, "admin");
  await assert.rejects(() => requireRole(db, login.sessionToken, ["buyer"]), /do not have access/);
});

test("logoutSession revokes a session token", async () => {
  const db = createMemoryAuthDatabase();
  await db.seedUser({
    email: "buyer@example.com",
    name: "Buyer",
    role: "buyer",
    status: "active",
    password: "Password1!",
  });

  const login = await loginUser(db, { email: "buyer@example.com", password: "Password1!" });
  assert.ok(await readSessionUser(db, login.sessionToken));

  await logoutSession(db, login.sessionToken);
  assert.equal(await readSessionUser(db, login.sessionToken), null);
});

test("password reset tokens are single-use and revoke existing sessions", async () => {
  const db = createMemoryAuthDatabase();
  await db.seedUser({
    email: "buyer@example.com",
    name: "Buyer",
    role: "buyer",
    status: "active",
    password: "Password1!",
  });
  const login = await loginUser(db, { email: "buyer@example.com", password: "Password1!" });
  const reset = await requestPasswordReset(db, "buyer@example.com");

  assert.ok(reset.resetToken);
  await resetPassword(db, { token: reset.resetToken, password: "Newpass1!" });

  assert.equal(await readSessionUser(db, login.sessionToken), null);
  await assert.rejects(
    () => resetPassword(db, { token: reset.resetToken ?? "", password: "Another1!" }),
    /invalid or expired/
  );

  const newLogin = await loginUser(db, { email: "buyer@example.com", password: "Newpass1!" });
  assert.equal(newLogin.user.email, "buyer@example.com");
});

function createMemoryAuthDatabase() {
  type UserRecord = {
    id: string;
    email: string;
    name: string;
    role: AuthUserRole;
    status: AuthAccountStatus;
    passwordHash: string | null;
  };
  type SessionRecord = {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
  };
  type ResetRecord = {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
  };

  const users: UserRecord[] = [];
  const sessions: SessionRecord[] = [];
  const passwordResetTokens: ResetRecord[] = [];
  const emailVerificationTokens: { id: string; userId: string; tokenHash: string; expiresAt: Date }[] = [];

  const db: AuthDatabase & {
    emailVerificationTokens: typeof emailVerificationTokens;
    seedUser(input: {
      email: string;
      name: string;
      role: AuthUserRole;
      status: AuthAccountStatus;
      password: string;
    }): Promise<UserRecord>;
  } = {
    emailVerificationTokens,
    async seedUser(input) {
      const user: UserRecord = {
        id: `user_${users.length + 1}`,
        email: input.email,
        name: input.name,
        role: input.role,
        status: input.status,
        passwordHash: await hashPassword(input.password),
      };
      users.push(user);
      return user;
    },
    user: {
      async findUnique(args) {
        return users.find((user) => user.email === args.where.email) ?? null;
      },
      async create(args) {
        const user = {
          id: `user_${users.length + 1}`,
          status: "active" as AuthAccountStatus,
          ...args.data,
        };
        users.push(user);
        return user;
      },
      async update(args) {
        const user = users.find((item) => item.id === args.where.id);
        assert.ok(user);
        Object.assign(user, args.data);
        return user;
      },
    },
    authSession: {
      async create(args) {
        const session = {
          id: `session_${sessions.length + 1}`,
          userId: args.data.userId,
          tokenHash: args.data.tokenHash,
          expiresAt: args.data.expiresAt,
          revokedAt: null,
        };
        sessions.push(session);
        return session;
      },
      async findUnique(args) {
        const session = sessions.find((item) => item.tokenHash === args.where.tokenHash);
        const user = session ? users.find((item) => item.id === session.userId) : null;
        return session && user ? { ...session, user } : null;
      },
      async updateMany(args) {
        let count = 0;
        for (const session of sessions) {
          const matchesToken = !args.where.tokenHash || session.tokenHash === args.where.tokenHash;
          const matchesUser = !args.where.userId || session.userId === args.where.userId;
          if (matchesToken && matchesUser && session.revokedAt === null) {
            session.revokedAt = args.data.revokedAt;
            count += 1;
          }
        }
        return { count };
      },
    },
    passwordResetToken: {
      async create(args) {
        const token = {
          id: `reset_${passwordResetTokens.length + 1}`,
          userId: args.data.userId,
          tokenHash: args.data.tokenHash,
          expiresAt: args.data.expiresAt,
          usedAt: null,
        };
        passwordResetTokens.push(token);
        return token;
      },
      async findUnique(args) {
        const token = passwordResetTokens.find((item) => item.tokenHash === args.where.tokenHash);
        const user = token ? users.find((item) => item.id === token.userId) : null;
        return token && user ? { ...token, user } : null;
      },
      async update(args) {
        const token = passwordResetTokens.find((item) => item.id === args.where.id);
        assert.ok(token);
        token.usedAt = args.data.usedAt;
        return token;
      },
    },
    emailVerificationToken: {
      async create(args) {
        const token = {
          id: `email_${emailVerificationTokens.length + 1}`,
          userId: args.data.userId,
          tokenHash: args.data.tokenHash,
          expiresAt: args.data.expiresAt,
        };
        emailVerificationTokens.push(token);
        return token;
      },
    },
  };

  return db;
}
