/**
 * Lightweight cross-component signal for "the current user's profile changed".
 *
 * Profile pages (artist/buyer/admin) emit this after a successful save or avatar
 * upload; the Navbar and DashboardLayout listen for it and re-fetch the
 * current-user/session data they display (name + avatar) so the change shows up
 * everywhere immediately — no manual hard refresh required.
 *
 * Implemented as a window CustomEvent so it works across independently-mounted
 * client components without a shared store/provider.
 */
export const PROFILE_UPDATED_EVENT = "renewcanvas:profile-updated";

/** Notify the navbar/header that the logged-in user's profile changed. */
export function emitProfileUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

/**
 * Subscribe to profile-updated events. Returns an unsubscribe function suitable
 * for a useEffect cleanup.
 */
export function onProfileUpdated(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, handler);
}
