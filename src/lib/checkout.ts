import { z } from "zod";

import { isDeliveryArea } from "@/data/bali-areas";
import { findDialCode } from "@/data/dial-codes";
import { totalCents } from "@/lib/pricing";
import { normalizeSetup, parseSetup, setupLines } from "@/lib/setup";
import type { Arrival, Setup } from "@/lib/types";

const BALI_TIME_ZONE = "Asia/Makassar";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_CHARS = /^[0-9 ().-]+$/;

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "");
}

// A national number: digits with optional spacing, 6–14 digits without the local 0.
function isPhoneNumber(value: string): boolean {
  const digits = phoneDigits(value);
  return PHONE_CHARS.test(value) && digits.length >= 6 && digits.length <= 14;
}

function formatWhatsApp(iso: string, number: string): string {
  const entry = findDialCode(iso);
  return number === "" || entry === undefined
    ? ""
    : `+${entry.dial} ${phoneDigits(number)}`;
}

// Calendar date in Bali (UTC+8) as YYYY-MM-DD, whatever the visitor's time zone.
export function baliDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BALI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number): string {
  const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function earliestDelivery(arrival: Arrival, now: Date): string {
  const today = baliDate(now);
  return arrival === "today" ? today : addDays(today, 1);
}

// The date picker works with local Date objects; the form keeps ISO strings.
export function isoToLocalDate(isoDate: string): Date {
  const [year = 1970, month = 1, day = 1] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function localDateToIso(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDeliveryDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function checkoutSchema(earliest: string) {
  return z
    .object({
      fullName: z.string().trim().min(2, "Please enter your name.").max(80),
      email: z.string().trim().pipe(z.email("Please enter a valid email.")),
      whatsappCountry: z
        .string()
        .refine((iso) => findDialCode(iso) !== undefined, {
          message: "Choose a country code.",
        }),
      whatsappNumber: z
        .string()
        .trim()
        .refine((value) => value === "" || isPhoneNumber(value), {
          message: "Use 6–14 digits, without the country code.",
        }),
      area: z
        .string()
        .refine(isDeliveryArea, { message: "Choose a delivery area." }),
      address: z
        .string()
        .trim()
        .min(5, "Add a street, villa or landmark.")
        .max(300),
      deliveryDate: z
        .string()
        .regex(ISO_DATE, "Pick a delivery date.")
        .refine((value) => !ISO_DATE.test(value) || value >= earliest, {
          message: `The earliest delivery is ${formatDeliveryDate(earliest)}.`,
        }),
    })
    .transform(({ whatsappCountry, whatsappNumber, ...request }) => ({
      ...request,
      whatsapp: formatWhatsApp(whatsappCountry, whatsappNumber),
    }));
}

// Form values (input) and the validated request (output, with one `whatsapp` string).
export type CheckoutValues = z.input<ReturnType<typeof checkoutSchema>>;
export type CheckoutInput = z.output<ReturnType<typeof checkoutSchema>>;

export interface Order {
  reference: string;
  placedAt: string;
  setup: Setup;
  totalCents: number;
  customer: CheckoutInput;
}

// No I, O, 0 or 1, so a reference can be read out over the phone.
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function orderReference(random: () => number = Math.random): string {
  let code = "";
  for (let index = 0; index < 4; index += 1) {
    code +=
      REFERENCE_ALPHABET[Math.floor(random() * REFERENCE_ALPHABET.length)] ??
      "A";
  }
  return `MR-${code}`;
}

export function createOrder(
  customer: CheckoutInput,
  setup: Setup,
  now: Date,
  random: () => number = Math.random,
): Order {
  return {
    reference: orderReference(random),
    placedAt: now.toISOString(),
    setup,
    totalCents: totalCents(setupLines(setup), setup.plan),
    customer,
  };
}

const storedOrder = z.object({
  reference: z.string().regex(/^MR-[A-Z0-9]{4}$/),
  placedAt: z.string(),
  setup: z.unknown(),
  totalCents: z.number().int().nonnegative(),
  customer: z.object({
    fullName: z.string(),
    email: z.string(),
    whatsapp: z.string(),
    area: z.string().refine(isDeliveryArea),
    address: z.string(),
    deliveryDate: z.string().regex(ISO_DATE),
  }),
});

// Shape check for an order read back from localStorage.
export function parseOrder(value: unknown): Order | null {
  const result = storedOrder.safeParse(value);
  if (!result.success) return null;
  const setup = parseSetup(result.data.setup);
  if (setup === null) return null;
  return { ...result.data, setup: normalizeSetup(setup).setup };
}
