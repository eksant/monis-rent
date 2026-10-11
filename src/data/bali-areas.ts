// Delivery areas grouped the way people think about Bali, not by regency borders.
export const BALI_AREAS = [
  {
    region: "Canggu & the west coast",
    areas: [
      "Canggu",
      "Berawa",
      "Batu Bolong",
      "Echo Beach",
      "Pererenan",
      "Seseh",
      "Kerobokan",
      "Umalas",
    ],
  },
  {
    region: "Seminyak & Kuta",
    areas: ["Seminyak", "Petitenget", "Legian", "Kuta", "Tuban"],
  },
  {
    region: "Bukit peninsula",
    areas: [
      "Jimbaran",
      "Uluwatu",
      "Bingin",
      "Pecatu",
      "Ungasan",
      "Nusa Dua",
      "Tanjung Benoa",
    ],
  },
  { region: "Denpasar & Sanur", areas: ["Sanur", "Renon", "Denpasar city"] },
  {
    region: "Ubud & Gianyar",
    areas: ["Ubud", "Penestanan", "Sayan", "Tegallalang", "Mas", "Keramas"],
  },
  {
    region: "Tabanan",
    areas: ["Kedungu", "Nyanyi", "Tanah Lot", "Tabanan town"],
  },
  { region: "East Bali", areas: ["Sidemen", "Candidasa", "Amed"] },
  { region: "North Bali", areas: ["Lovina", "Munduk", "Singaraja"] },
  { region: "Islands", areas: ["Nusa Lembongan", "Nusa Penida"] },
  { region: "Other", areas: ["Somewhere else in Bali"] },
] as const;

export const DELIVERY_AREAS: readonly string[] = BALI_AREAS.flatMap(
  (group) => group.areas,
);

export function isDeliveryArea(value: string): boolean {
  return DELIVERY_AREAS.includes(value);
}
