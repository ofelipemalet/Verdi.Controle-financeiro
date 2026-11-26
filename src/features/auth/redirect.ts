export const DEFAULT_AUTH_REDIRECT = "/inicio";

const PENDING_REDIRECT_KEY = "verdi:auth:redirect";

const FORBIDDEN_REDIRECT_PREFIXES = ["/auth", "/~oauth"] as const;

export function sanitizeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return DEFAULT_AUTH_REDIRECT;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  try {
    const parsed = new URL(trimmed, "https://verdi.local");
    if (parsed.origin !== "https://verdi.local") {
      return DEFAULT_AUTH_REDIRECT;
    }
    if (
      FORBIDDEN_REDIRECT_PREFIXES.some(
        (prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`),
      )
    ) {
      return DEFAULT_AUTH_REDIRECT;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}

export function savePendingRedirect(path: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_REDIRECT_KEY, sanitizeRedirectPath(path));
  } catch {
    // Ignore storage unavailability in private/restricted browsers.
  }
}

export function consumePendingRedirect(fallback?: unknown): string {
  let stored: string | null = null;
  if (typeof window !== "undefined") {
    try {
      stored = window.sessionStorage.getItem(PENDING_REDIRECT_KEY);
      window.sessionStorage.removeItem(PENDING_REDIRECT_KEY);
    } catch {
      stored = null;
    }
  }
  return sanitizeRedirectPath(stored ?? fallback);
}