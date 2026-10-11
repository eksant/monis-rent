const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCents(cents: number): string {
  return USD.format(cents / 100);
}

// Signed price change for item cards, e.g. "+$4.90" or "−$2.00".
export function formatDelta(cents: number): string {
  if (cents === 0) return formatCents(0);
  const sign = cents > 0 ? "+" : "−";
  return `${sign}${formatCents(Math.abs(cents))}`;
}
