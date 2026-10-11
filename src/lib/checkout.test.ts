import { describe, expect, it } from "vitest";

import { presetSetup } from "@/data/presets";
import {
  addDays,
  baliDate,
  type CheckoutInput,
  checkoutSchema,
  createOrder,
  earliestDelivery,
  formatDeliveryDate,
  orderReference,
  parseOrder,
} from "@/lib/checkout";

const VALID = {
  fullName: "Kadek Ayu",
  email: "kadek@example.com",
  whatsapp: "+62 812 3456 7890",
  area: "Canggu",
  address: "Villa Melati, Jl. Pantai Berawa 12",
  deliveryDate: "2026-10-13",
} satisfies CheckoutInput;

// A deterministic "random" that walks through the given numbers.
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

describe("dates in Bali", () => {
  it("uses the calendar date in Bali (UTC+8), not the visitor's time zone", () => {
    expect(baliDate(new Date("2026-10-11T15:59:00Z"))).toBe("2026-10-11");
    expect(baliDate(new Date("2026-10-11T16:00:00Z"))).toBe("2026-10-12");
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("allows same-day delivery only when the whole setup can arrive today", () => {
    const now = new Date("2026-10-11T02:00:00Z");
    expect(earliestDelivery("today", now)).toBe("2026-10-11");
    expect(earliestDelivery("tomorrow", now)).toBe("2026-10-12");
  });

  it("formats a delivery date for people", () => {
    expect(formatDeliveryDate("2026-10-13")).toBe("Tue, 13 Oct 2026");
  });
});

describe("checkoutSchema", () => {
  const schema = checkoutSchema("2026-10-12");

  it("accepts a complete request and an empty WhatsApp number", () => {
    expect(schema.safeParse(VALID).success).toBe(true);
    expect(schema.safeParse({ ...VALID, whatsapp: "" }).success).toBe(true);
  });

  it("explains every missing or invalid field", () => {
    const result = schema.safeParse({
      fullName: " ",
      email: "nope",
      whatsapp: "call me",
      area: "",
      address: "x",
      deliveryDate: "",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toEqual([
      "Please enter your name.",
      "Please enter a valid email.",
      "Use digits, spaces and an optional +.",
      "Choose a delivery area.",
      "Add a street, villa or landmark.",
      "Pick a delivery date.",
    ]);
  });

  it("rejects a delivery date before the earliest one", () => {
    const result = schema.safeParse({ ...VALID, deliveryDate: "2026-10-11" });
    expect(result.error?.issues[0]?.message).toBe(
      "The earliest delivery is Mon, 12 Oct 2026.",
    );
  });
});

describe("orders", () => {
  it("makes short, unambiguous references", () => {
    expect(orderReference(sequence(0, 0.5, 0.99, 0.25))).toBe("MR-AS9J");
    expect(orderReference()).toMatch(/^MR-[A-HJ-NP-Z2-9]{4}$/);
  });

  it("records the setup, its total and the customer", () => {
    const setup = presetSetup("essentials");
    const order = createOrder(
      VALID,
      setup,
      new Date("2026-10-11T02:00:00Z"),
      sequence(0),
    );
    expect(order).toEqual({
      reference: "MR-AAAA",
      placedAt: "2026-10-11T02:00:00.000Z",
      setup,
      totalCents: 1270,
      customer: VALID,
    });
  });

  it("parses a stored order and rejects anything else", () => {
    const order = createOrder(
      { ...VALID, area: "Ubud" as const },
      presetSetup("founders"),
      new Date("2026-10-11T02:00:00Z"),
      sequence(0.1),
    );
    expect(parseOrder(JSON.parse(JSON.stringify(order)))).toEqual(order);
    expect(parseOrder(null)).toBeNull();
    expect(parseOrder({ ...order, reference: "hello" })).toBeNull();
    expect(parseOrder({ ...order, setup: { deskId: 3 } })).toBeNull();
  });
});
