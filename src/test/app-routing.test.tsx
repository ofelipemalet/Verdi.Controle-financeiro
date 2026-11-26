import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it("matches public presentation and login routes", () => {
    expect(router.matchRoutes("/").at(-1)?.routeId).toBe("/");
    expect(router.matchRoutes("/auth").at(-1)?.routeId).toBe("/auth");
  });

  it("places financial routes under the authenticated layout guard", () => {
    for (const path of ["/inicio", "/analises", "/movimentacoes"] as const) {
      const matches = router.matchRoutes(path);
      const routeIds = matches.map((m) => m.routeId);
      expect(routeIds).toContain("/_authenticated");
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});
