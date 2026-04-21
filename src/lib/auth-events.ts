const EVENT = "koch:auth-refresh";

/** Ask all `useAuth()` listeners to reload session + profile (e.g. after creating a profile row). */
export function emitAuthRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

export function onAuthRefresh(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
