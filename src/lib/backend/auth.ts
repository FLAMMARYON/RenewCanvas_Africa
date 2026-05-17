import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const scryptWithOptions = (
  password: string,
  salt: string,
  keyLength: number,
  options: { N: number; r: number; p: number }
) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });

export const authSessionCookieName = "renewcanvas_session";
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;
export const passwordResetDurationMs = 1000 * 60 * 60;
export const emailVerificationDurationMs = 1000 * 60 * 60 * 24;

export type AuthUserRole = "buyer" | "artist" | "admin";
export type AuthAccountStatus = "active" | "pending_verification" | "suspended" | "deleted";

export type AuthPublicUser = {
  id: string;
  email: string;
  name: string;
  role: AuthUserRole;
  status: AuthAccountStatus;
};

type AuthUserRecord = AuthPublicUser & {
  passwordHash: string | null;
};

type AuthSessionRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

type PasswordResetTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type AuthDatabase = {
  user: {
    findUnique(args: { where: { email: string } }): Promise<AuthUserRecord | null>;
    create(args: {
      data: {
        email: string;
        name: string;
        role: AuthUserRole;
        status?: AuthAccountStatus;
        passwordHash: string;
      };
    }): Promise<AuthUserRecord>;
    update(args: {
      where: { id: string };
      data: { passwordHash?: string; status?: AuthAccountStatus };
    }): Promise<AuthUserRecord>;
  };
  authSession: {
    create(args: {
      data: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
        userAgent?: string;
        ipAddress?: string;
      };
    }): Promise<AuthSessionRecord>;
    findUnique(args: {
      where: { tokenHash: string };
      include: { user: true };
    }): Promise<(AuthSessionRecord & { user: AuthUserRecord }) | null>;
    updateMany(args: {
      where: { tokenHash?: string; userId?: string; revokedAt: null };
      data: { revokedAt: Date };
    }): Promise<{ count: number }>;
  };
  passwordResetToken: {
    create(args: {
      data: { userId: string; tokenHash: string; expiresAt: Date };
    }): Promise<PasswordResetTokenRecord>;
    findUnique(args: {
      where: { tokenHash: string };
      include: { user: true };
    }): Promise<(PasswordResetTokenRecord & { user: AuthUserRecord }) | null>;
    update(args: {
      where: { id: string };
      data: { usedAt: Date };
    }): Promise<PasswordResetTokenRecord>;
  };
  emailVerificationToken: {
    create(args: {
      data: { userId: string; tokenHash: string; expiresAt: Date };
    }): Promise<{ id: string }>;
  };
};

export type AuthRequestMetadata = {
  userAgent?: string;
  ipAddress?: string;
  now?: Date;
};

export async function registerUser(
  db: AuthDatabase,
  input: {
    email: string;
    name: string;
    password: string;
    role: AuthUserRole;
  },
  metadata: AuthRequestMetadata = {}
): Promise<{ user: AuthPublicUser; sessionToken: string; emailVerificationToken: string }> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const now = metadata.now ?? new Date();

  if (!email) {
    throw new AuthError("invalid_email", "Enter a valid email address.", 400);
  }

  if (name.length < 2) {
    throw new AuthError("invalid_name", "Enter your full name.", 400);
  }

  assertSupportedRole(input.role);
  assertStrongPassword(input.password);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new AuthError("email_taken", "An account already exists for this email.", 409);
  }

  const user = await db.user.create({
    data: {
      email,
      name,
      role: input.role,
      status: "active",
      passwordHash: await hashPassword(input.password),
    },
  });

  const sessionToken = await createSession(db, user.id, metadata, now);
  const emailVerificationToken = createOpaqueToken();
  await db.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(emailVerificationToken),
      expiresAt: new Date(now.getTime() + emailVerificationDurationMs),
    },
  });

  return { user: toPublicUser(user), sessionToken, emailVerificationToken };
}

export async function loginUser(
  db: AuthDatabase,
  input: { email: string; password: string },
  metadata: AuthRequestMetadata = {}
): Promise<{ user: AuthPublicUser; sessionToken: string }> {
  const email = normalizeEmail(input.email);
  const user = email ? await db.user.findUnique({ where: { email } }) : null;

  if (!user?.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError("invalid_credentials", "Invalid email or password.", 401);
  }

  if (user.status === "suspended" || user.status === "deleted") {
    throw new AuthError("account_unavailable", "This account cannot sign in.", 403);
  }

  const sessionToken = await createSession(db, user.id, metadata);
  return { user: toPublicUser(user), sessionToken };
}

export async function readSessionUser(
  db: AuthDatabase,
  sessionToken: string | undefined,
  now = new Date()
): Promise<AuthPublicUser | null> {
  if (!sessionToken) {
    return null;
  }

  const session = await db.authSession.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    include: { user: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= now) {
    return null;
  }

  if (session.user.status === "suspended" || session.user.status === "deleted") {
    return null;
  }

  return toPublicUser(session.user);
}

export async function requireRole(
  db: AuthDatabase,
  sessionToken: string | undefined,
  roles: AuthUserRole[],
  now = new Date()
): Promise<AuthPublicUser> {
  const user = await readSessionUser(db, sessionToken, now);

  if (!user) {
    throw new AuthError("unauthenticated", "Sign in to continue.", 401);
  }

  if (!roles.includes(user.role)) {
    throw new AuthError("forbidden", "You do not have access to this resource.", 403);
  }

  return user;
}

export async function logoutSession(db: AuthDatabase, sessionToken: string | undefined): Promise<void> {
  if (!sessionToken) {
    return;
  }

  await db.authSession.updateMany({
    where: { tokenHash: hashToken(sessionToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function requestPasswordReset(
  db: AuthDatabase,
  emailInput: string,
  now = new Date()
): Promise<{ resetToken?: string; user?: { id: string; name: string; email: string } }> {
  const email = normalizeEmail(emailInput);
  const user = email ? await db.user.findUnique({ where: { email } }) : null;

  if (!user || user.status === "deleted") {
    return {};
  }

  const resetToken = createOpaqueToken();
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt: new Date(now.getTime() + passwordResetDurationMs),
    },
  });

  return { resetToken, user: { id: user.id, name: user.name, email: user.email } };
}

export async function resetPassword(
  db: AuthDatabase,
  input: { token: string; password: string },
  now = new Date()
): Promise<{ user: AuthPublicUser }> {
  assertStrongPassword(input.password);

  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    include: { user: true },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
    throw new AuthError("invalid_reset_token", "Password reset link is invalid or expired.", 400);
  }

  if (resetToken.user.status === "suspended" || resetToken.user.status === "deleted") {
    throw new AuthError("account_unavailable", "This account cannot reset its password.", 403);
  }

  await db.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: now },
  });

  const user = await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: await hashPassword(input.password) },
  });

  await db.authSession.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: now },
  });

  return { user: toPublicUser(user) };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$16384$8$1$${salt}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelization, salt, stored] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !cost || !blockSize || !parallelization || !salt || !stored) {
    return false;
  }

  const key = await scryptWithOptions(password, salt, 64, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
  });
  const storedKey = Buffer.from(stored, "base64url");

  return storedKey.length === key.length && timingSafeEqual(storedKey, key);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("one lowercase letter");
  if (!/[0-9]/.test(password)) issues.push("one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) issues.push("one special character");
  return issues;
}

function assertStrongPassword(password: string): void {
  const issues = passwordIssues(password);
  if (issues.length > 0) {
    throw new AuthError("weak_password", `Password must include ${issues.join(", ")}.`, 400);
  }
}

function assertSupportedRole(role: AuthUserRole): void {
  if (!["buyer", "artist", "admin"].includes(role)) {
    throw new AuthError("invalid_role", "Unsupported account role.", 400);
  }
}

async function createSession(
  db: AuthDatabase,
  userId: string,
  metadata: AuthRequestMetadata,
  now = new Date()
): Promise<string> {
  const sessionToken = createOpaqueToken();
  await db.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(sessionToken),
      expiresAt: new Date(now.getTime() + sessionDurationMs),
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    },
  });
  return sessionToken;
}

function toPublicUser(user: AuthUserRecord): AuthPublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

export class AuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}
