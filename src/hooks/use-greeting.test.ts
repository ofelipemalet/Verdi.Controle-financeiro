import { describe, expect, it } from "vitest";

import { greetingForHour } from "./use-greeting";

describe("greetingForHour", () => {
  it("says bom dia in the morning", () => {
    expect(greetingForHour(5)).toBe("Bom dia");
    expect(greetingForHour(11)).toBe("Bom dia");
  });

  it("says boa tarde from noon until 18h", () => {
    expect(greetingForHour(12)).toBe("Boa tarde");
    expect(greetingForHour(17)).toBe("Boa tarde");
  });

  it("says boa noite in the evening and early hours", () => {
    expect(greetingForHour(18)).toBe("Boa noite");
    expect(greetingForHour(0)).toBe("Boa noite");
    expect(greetingForHour(4)).toBe("Boa noite");
  });
});
