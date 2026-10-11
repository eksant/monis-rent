import { describe, expect, it } from "vitest";

import { countLabel } from "@/lib/text";

describe("countLabel", () => {
  it("uses the singular only for exactly one", () => {
    expect(countLabel(0, "item")).toBe("0 items");
    expect(countLabel(1, "item")).toBe("1 item");
    expect(countLabel(7, "item")).toBe("7 items");
  });
});
