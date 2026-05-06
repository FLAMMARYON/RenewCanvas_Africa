import { dashboardPathForRole, type FrontendSession } from "./session";

export type { FrontendSession };

type AuthApiResponse =
  | { ok: true; user: FrontendSession; resetToken?: string }
  | { ok: false; message?: string; code?: string };

export async function loginWithPassword(input: {
  email: string;
  password: string;
}): Promise<FrontendSession> {
  const response = await postAuth("/api/auth/login", input);
  return response.user;
}

export async function registerAccount(input: {
  email: string;
  name: string;
  password: string;
  role: "buyer" | "artist";
}): Promise<FrontendSession> {
  const response = await postAuth("/api/auth/register", input);
  return response.user;
}

export async function readServerSession(): Promise<FrontendSession | null> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  const body = (await response.json()) as AuthApiResponse;
  if (!response.ok || !body.ok) {
    throw new Error(!body.ok ? body.message ?? "Unable to verify session." : "Unable to verify session.");
  }

  return body.user;
}

export async function logoutServerSession(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function requestResetLink(email: string): Promise<string | undefined> {
  const response = await postAuth("/api/auth/password-reset/request", { email });
  return response.resetToken;
}

export async function confirmPasswordReset(input: {
  token: string;
  password: string;
}): Promise<void> {
  await postAuth("/api/auth/password-reset/confirm", input);
}

export { dashboardPathForRole };

async function postAuth(path: string, payload: unknown): Promise<Extract<AuthApiResponse, { ok: true }>> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as AuthApiResponse;

  if (!response.ok || !body.ok) {
    throw new Error(!body.ok ? body.message ?? "Authentication request failed." : "Authentication request failed.");
  }

  return body;
}
