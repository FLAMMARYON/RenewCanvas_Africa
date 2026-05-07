export type FrontendUserRole = "buyer" | "artist" | "admin";

export type FrontendSession = {
  email: string;
  name: string;
  role: FrontendUserRole;
  createdAt: string;
};

export type FrontendRegisteredUser = FrontendSession & {
  phone?: string;
};

export const frontendSessionKey = "renewcanvas.session";
export const frontendUsersKey = "renewcanvas.users";

export function inferRoleFromEmail(email: string): FrontendUserRole {
  const normalized = email.trim().toLowerCase();

  if (normalized === "hello.renewcanvas.africa@gmail.com" || normalized.includes("admin")) {
    return "admin";
  }

  if (normalized.includes("artist") || normalized.includes("creator")) {
    return "artist";
  }

  return "buyer";
}

export function dashboardPathForRole(role: FrontendUserRole): string {
  return `/dashboard/${role}`;
}

export function createFrontendSession(input: {
  email: string;
  name?: string;
  role?: FrontendUserRole;
}): FrontendSession {
  const email = input.email.trim().toLowerCase();
  const fallbackName = email.split("@")[0]?.replace(/[._-]+/g, " ") || "User";

  return {
    email,
    name: input.name?.trim() || titleCase(fallbackName),
    role: input.role ?? inferRoleFromEmail(email),
    createdAt: new Date().toISOString(),
  };
}

export function readFrontendSession(): FrontendSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(frontendSessionKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as FrontendSession;
  } catch {
    window.localStorage.removeItem(frontendSessionKey);
    return null;
  }
}

export function saveFrontendSession(session: FrontendSession): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(frontendSessionKey, JSON.stringify(session));
}

export function clearFrontendSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(frontendSessionKey);
}

export function saveRegisteredUser(user: FrontendRegisteredUser): void {
  if (typeof window === "undefined") {
    return;
  }

  const users = readRegisteredUsers().filter((item) => item.email !== user.email);
  users.push(user);
  window.localStorage.setItem(frontendUsersKey, JSON.stringify(users));
}

export function readRegisteredUsers(): FrontendRegisteredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(frontendUsersKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as FrontendRegisteredUser[];
  } catch {
    window.localStorage.removeItem(frontendUsersKey);
    return [];
  }
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
