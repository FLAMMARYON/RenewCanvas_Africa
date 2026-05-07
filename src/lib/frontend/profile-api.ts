import type { FrontendSession } from "./auth-api";

export type ProfileApiResponse = {
  ok: boolean;
  user: FrontendSession;
  profile: Record<string, unknown>;
  address: Record<string, unknown> | null;
  displayName: string;
  code?: string;
  message?: string;
};

export async function readProfile(): Promise<ProfileApiResponse> {
  const response = await fetch("/api/profile", { credentials: "include" });
  const payload = (await response.json()) as ProfileApiResponse;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Could not load profile.");
  }

  return payload;
}

export async function saveProfile(input: Record<string, unknown>): Promise<ProfileApiResponse> {
  const response = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as ProfileApiResponse;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Could not save profile.");
  }

  return payload;
}
