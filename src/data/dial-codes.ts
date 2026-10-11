export interface DialCode {
  iso: string;
  name: string;
  dial: string;
}

// Indonesia first (local SIMs), then the countries most nomads in Bali come from.
export const DIAL_CODES: readonly DialCode[] = [
  { iso: "ID", name: "Indonesia", dial: "62" },
  { iso: "AU", name: "Australia", dial: "61" },
  { iso: "SG", name: "Singapore", dial: "65" },
  { iso: "MY", name: "Malaysia", dial: "60" },
  { iso: "US", name: "United States", dial: "1" },
  { iso: "CA", name: "Canada", dial: "1" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "IE", name: "Ireland", dial: "353" },
  { iso: "DE", name: "Germany", dial: "49" },
  { iso: "NL", name: "Netherlands", dial: "31" },
  { iso: "BE", name: "Belgium", dial: "32" },
  { iso: "FR", name: "France", dial: "33" },
  { iso: "ES", name: "Spain", dial: "34" },
  { iso: "IT", name: "Italy", dial: "39" },
  { iso: "PT", name: "Portugal", dial: "351" },
  { iso: "CH", name: "Switzerland", dial: "41" },
  { iso: "AT", name: "Austria", dial: "43" },
  { iso: "SE", name: "Sweden", dial: "46" },
  { iso: "NO", name: "Norway", dial: "47" },
  { iso: "DK", name: "Denmark", dial: "45" },
  { iso: "FI", name: "Finland", dial: "358" },
  { iso: "PL", name: "Poland", dial: "48" },
  { iso: "CZ", name: "Czechia", dial: "420" },
  { iso: "UA", name: "Ukraine", dial: "380" },
  { iso: "RU", name: "Russia", dial: "7" },
  { iso: "IL", name: "Israel", dial: "972" },
  { iso: "AE", name: "United Arab Emirates", dial: "971" },
  { iso: "IN", name: "India", dial: "91" },
  { iso: "CN", name: "China", dial: "86" },
  { iso: "JP", name: "Japan", dial: "81" },
  { iso: "KR", name: "South Korea", dial: "82" },
  { iso: "TH", name: "Thailand", dial: "66" },
  { iso: "PH", name: "Philippines", dial: "63" },
  { iso: "VN", name: "Vietnam", dial: "84" },
  { iso: "NZ", name: "New Zealand", dial: "64" },
  { iso: "BR", name: "Brazil", dial: "55" },
  { iso: "AR", name: "Argentina", dial: "54" },
  { iso: "MX", name: "Mexico", dial: "52" },
  { iso: "ZA", name: "South Africa", dial: "27" },
];

export function findDialCode(iso: string): DialCode | undefined {
  return DIAL_CODES.find((entry) => entry.iso === iso);
}

// "ID" -> 🇮🇩, via regional indicator symbols (ISO codes are two ASCII letters).
export function flagOf(iso: string): string {
  const code = iso.toUpperCase();
  return String.fromCodePoint(
    0x1f1a5 + code.charCodeAt(0),
    0x1f1a5 + code.charCodeAt(1),
  );
}
