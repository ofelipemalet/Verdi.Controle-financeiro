import { describe, expect, it, vi } from "vitest";

import { shouldRegisterServiceWorker, unregisterAppServiceWorkers } from "./pwa-offline";

const BASE_ALLOWED = {
  isProd: true,
  isInIframe: false,
  hostname: "verde-money-compass.lovable.app",
  search: "",
};

describe("shouldRegisterServiceWorker", () => {
  it("allows published lovable.app domain and custom domains", () => {
    expect(shouldRegisterServiceWorker(BASE_ALLOWED)).toBe(true);
    expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, hostname: "finance.example.com" })).toBe(
      true,
    );
    expect(
      shouldRegisterServiceWorker({ ...BASE_ALLOWED, hostname: "preview-v2--shop.example.com" }),
    ).toBe(true);
  });

  it("refuses development builds, iframes, and ?sw=off kill switch", () => {
    expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, isProd: false })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, isInIframe: true })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, search: "?sw=off" })).toBe(false);
    expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, search: "?tab=1&sw=off" })).toBe(false);
  });

  it("refuses all Lovable preview and dev hostnames", () => {
    const blocked = [
      "id-preview--bb89651d-eb1d-4beb-a2ae-d171f75be330.lovable.app",
      "preview--my-app.lovable.app",
      "preview-2--my-app.lovable.app",
      "preview-abc123--my-app.gpt-eng.com",
      "id-preview-v2--my-app.gptengineer.run",
      "project--bb89651d-eb1d-4beb-a2ae-d171f75be330-dev.lovable.app",
      "project--abc123-dev.gpt-eng.com",
      "project--abc123-dev.gptengineer.run",
      "lovableproject.com",
      "app.lovableproject.com",
      "lovableproject-dev.com",
      "app.lovableproject-dev.com",
      "beta.lovable.dev",
      "preview.beta.lovable.dev",
      "ID-PREVIEW--UPPERCASE.LOVABLE.APP",
    ];

    for (const hostname of blocked) {
      expect(shouldRegisterServiceWorker({ ...BASE_ALLOWED, hostname }), hostname).toBe(false);
    }
  });

  it("refuses an exact delegated preview hostname when configured", () => {
    expect(
      shouldRegisterServiceWorker({
        ...BASE_ALLOWED,
        hostname: "delegated.example.com",
        delegatedPreviewHostnames: ["delegated.example.com"],
      }),
    ).toBe(false);
  });
});

describe("unregisterAppServiceWorkers", () => {
  it("unregisters only /sw.js on the same origin and leaves messaging workers untouched", async () => {
    const appUnregister = vi.fn().mockResolvedValue(true);
    const fcmUnregister = vi.fn().mockResolvedValue(true);

    const registrations = [
      {
        active: { scriptURL: "https://verde-money-compass.lovable.app/sw.js" },
        unregister: appUnregister,
      },
      {
        active: { scriptURL: "https://verde-money-compass.lovable.app/firebase-messaging-sw.js" },
        unregister: fcmUnregister,
      },
    ] as unknown as ServiceWorkerRegistration[];

    const count = await unregisterAppServiceWorkers(
      { getRegistrations: vi.fn().mockResolvedValue(registrations) },
      "https://verde-money-compass.lovable.app",
    );

    expect(count).toBe(1);
    expect(appUnregister).toHaveBeenCalledTimes(1);
    expect(fcmUnregister).not.toHaveBeenCalled();
  });
});
