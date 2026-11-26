const APP_SW_PATH = "/sw.js";
const PAGES_CACHE_NAME = "pages-network-first";
const APP_ROUTES = ["/", "/auth", "/inicio", "/analises", "/movimentacoes"] as const;

const PREVIEW_PARENT_DOMAINS = [".lovable.app", ".gpt-eng.com", ".gptengineer.run"] as const;
const BLOCKED_DOMAINS = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "beta.lovable.dev",
] as const;
const PREVIEW_LABEL_RE = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/;
const DEV_PROJECT_LABEL_RE = /^project--[a-z0-9-]+-dev$/;

const DELEGATED_PREVIEW_HOSTNAMES: readonly string[] = [];
let controllerChangeBound = false;

export interface ServiceWorkerGuardContext {
  isProd: boolean;
  isInIframe: boolean;
  hostname: string;
  search: string;
  delegatedPreviewHostnames?: readonly string[];
}

function matchesDomainOrSubdomain(hostname: string, domain: string): boolean {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

export function shouldRegisterServiceWorker({
  isProd,
  isInIframe,
  hostname,
  search,
  delegatedPreviewHostnames = DELEGATED_PREVIEW_HOSTNAMES,
}: ServiceWorkerGuardContext): boolean {
  if (!isProd || isInIframe) return false;

  const params = new URLSearchParams(search);
  if (params.get("sw")?.toLowerCase() === "off") return false;

  const normalizedHost = hostname.trim().toLowerCase();
  if (!normalizedHost) return false;

  if (delegatedPreviewHostnames.some((h) => h.trim().toLowerCase() === normalizedHost)) {
    return false;
  }

  if (BLOCKED_DOMAINS.some((domain) => matchesDomainOrSubdomain(normalizedHost, domain))) {
    return false;
  }

  const isHostedPreviewDomain = PREVIEW_PARENT_DOMAINS.some((suffix) =>
    normalizedHost.endsWith(suffix),
  );
  if (isHostedPreviewDomain) {
    const firstLabel = normalizedHost.split(".")[0] ?? "";
    if (PREVIEW_LABEL_RE.test(firstLabel) || DEV_PROJECT_LABEL_RE.test(firstLabel)) {
      return false;
    }
  }

  return true;
}

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isAppServiceWorker(registration: ServiceWorkerRegistration, origin: string): boolean {
  const scriptUrl =
    registration.active?.scriptURL ??
    registration.waiting?.scriptURL ??
    registration.installing?.scriptURL;
  if (!scriptUrl) return false;
  try {
    const parsed = new URL(scriptUrl);
    return parsed.origin === origin && parsed.pathname === APP_SW_PATH;
  } catch {
    return false;
  }
}

export async function unregisterAppServiceWorkers(
  container: Pick<ServiceWorkerContainer, "getRegistrations">,
  origin: string,
): Promise<number> {
  const registrations = await container.getRegistrations();
  const matching = registrations.filter((reg) => isAppServiceWorker(reg, origin));
  const results = await Promise.allSettled(matching.map((reg) => reg.unregister()));
  return results.filter((r) => r.status === "fulfilled" && r.value).length;
}

async function warmNavigationCache(origin: string): Promise<void> {
  if (typeof caches === "undefined" || typeof fetch === "undefined") return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  try {
    const cache = await caches.open(PAGES_CACHE_NAME);
    await Promise.allSettled(
      APP_ROUTES.map(async (route) => {
        const url = new URL(route, origin).href;
        const response = await fetch(url, { credentials: "same-origin" });
        const contentType = response.headers.get("content-type") ?? "";
        if (response.ok && contentType.includes("text/html")) {
          await cache.put(url, response);
        }
      }),
    );
  } catch {
    // Non-fatal: cache will still populate naturally on online navigations.
  }
}

export async function initPwaOfflineSupport(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  const allowed = shouldRegisterServiceWorker({
    isProd: import.meta.env.PROD,
    isInIframe: isInIframe(),
    hostname: window.location.hostname,
    search: window.location.search,
  });

  if (!allowed) {
    try {
      await unregisterAppServiceWorkers(navigator.serviceWorker, window.location.origin);
    } catch {
      // Ignore cleanup failures in restricted contexts.
    }
    return false;
  }

  try {
    const origin = window.location.origin;
    await navigator.serviceWorker.register(APP_SW_PATH, { scope: "/" });
    if (!controllerChangeBound) {
      controllerChangeBound = true;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        void warmNavigationCache(origin);
      });
    }
    await navigator.serviceWorker.ready;
    void warmNavigationCache(origin);
    return true;
  } catch {
    return false;
  }
}
