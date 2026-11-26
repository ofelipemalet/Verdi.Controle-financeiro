import { describe, expect, it } from "vitest";

import { DEFAULT_AUTH_REDIRECT, sanitizeRedirectPath } from "./redirect";

describe("sanitizeRedirectPath", () => {
  it("keeps safe internal app routes with query parameters", () => {
    expect(sanitizeRedirectPath("/inicio")).toBe("/inicio");
    expect(sanitizeRedirectPath("/analises")).toBe("/analises");
    expect(sanitizeRedirectPath("/movimentacoes?tipo=income")).toBe("/movimentacoes?tipo=income");
  });

  it("blocks external URLs, protocol-relative URLs, backslashes, and auth loop routes", () => {
    expect(sanitizeRedirectPath("https://evil.example/phish")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("//evil.example")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("/\\evil.example")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("/auth")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("/auth?redirect=/inicio")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("/~oauth/callback")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath("")).toBe(DEFAULT_AUTH_REDIRECT);
    expect(sanitizeRedirectPath(undefined)).toBe(DEFAULT_AUTH_REDIRECT);
  });
});