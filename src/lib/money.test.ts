import { describe, expect, it } from "vitest";

import { formatCents, formatDelta } from "@/lib/money";

describe("formatCents", () => {
  it("formats integer cents as USD", () => {
    expect(formatCents(490)).toBe("$4.90");
    expect(formatCents(13940)).toBe("$139.40");
    expect(formatCents(0)).toBe("$0.00");
  });
});

describe("formatDelta", () => {
  it("prefixes a plus sign for increases", () => {
    expect(formatDelta(490)).toBe("+$4.90");
  });

  it("uses a real minus sign for decreases", () => {
    expect(formatDelta(-200)).toBe("−$2.00");
  });

  it("shows zero without a sign", () => {
    expect(formatDelta(0)).toBe("$0.00");
  });
});
