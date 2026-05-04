export function createRequestId(prefix = "req"): string {
  const randomValues = new Uint32Array(2);
  crypto.getRandomValues(randomValues);
  return `${prefix}_${Date.now().toString(36)}_${Array.from(randomValues)
    .map((value) => value.toString(36))
    .join("")}`;
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}
