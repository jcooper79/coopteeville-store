// Server-side price authority. The storefront shows prices, but every order is
// re-priced from this file so a tampered cart can't change what we charge.
//
// printful: fill in after creating the products in Printful.
//   variantIds maps "<color>:<size>" -> Printful catalog variant_id
//   (Bella+Canvas 3001 is the suggested blank). frontFile is the print-ready PNG in R2.

export type Size = "S" | "M" | "L" | "XL" | "2XL" | "3XL";
export const SIZES: Size[] = ["S", "M", "L", "XL", "2XL", "3XL"];
export const COLORS = ["white", "black", "heather", "cherry", "sky"] as const;
export type Color = (typeof COLORS)[number];

export interface Product {
  id: string;
  name: string;
  resident: string;
  priceCents: number;
  colors: Color[];
  printful: { variantIds: Record<string, number>; frontFile: string };
}

const p = (id: string, name: string, resident: string, colors: Color[]): Product => ({
  id, name, resident, priceCents: 2800, colors,
  printful: { variantIds: {}, frontFile: `https://files.coopteeville.com/print/${id}.png` },
});

export const PRODUCTS: Product[] = [
  p("cv-001", "I'm not speeding, I'm qualifying", "coop", ["white"]),
  p("cv-002", "Powered by coffee and bad decisions", "dee", ["black"]),
  p("cv-003", "Low battery. High expectations.", "sparky", ["white"]),
  p("cv-004", "Grandma drives stick. Deal with it.", "gran", ["heather"]),
  p("cv-005", "Torque is cheap. Hugs are free.", "torque", ["black"]),
  p("cv-006", "My check engine light is just decorative", "rusty", ["sky"]),
  p("cv-007", "Dad joke loading... please merge", "coop", ["heather"]),
  p("cv-008", "Range anxiety is my cardio", "sparky", ["black"]),
  p("cv-009", "Parallel parking champion (self-proclaimed)", "gran", ["white"]),
  p("cv-010", "Running on fumes and spite", "dee", ["cherry"]),
  p("cv-011", "Built different. Rebuilt twice.", "rusty", ["black"]),
  p("cv-012", "I brake for snacks", "coop", ["sky"]),
  // The Tired Collection: tire tracks across the shirt
  p("cv-013", "Monday ran me over", "coop", ["white"]),
  p("cv-014", "Tired. Retired. Re-tired.", "rusty", ["heather"]),
  p("cv-015", "Exhausted. Also tired.", "torque", ["white"]),
  p("cv-016", "Running on bald tires and hope", "dee", ["black"]),
  p("cv-017", "Too tired to merge", "gran", ["sky"]),
  p("cv-018", "Tired of waiting for a charger", "sparky", ["black"]),
  p("cv-019", "Tread lightly, I'm tired", "dee", ["heather"]),
];

export const PLATE: Product = {
  id: "cv-plate", name: "Vanity Plate Tee", resident: "you", priceCents: 3200,
  colors: [...COLORS],
  printful: { variantIds: {}, frontFile: "" }, // file rendered per order
};

export const PLATE_STYLES = ["classic", "sunset", "midnight", "racing"] as const;
// "plate" = plate on its own; "runover" = Tired Collection: tire tracks + "I've been run over by" above the plate.
export const PLATE_DESIGNS = ["plate", "runover"] as const;
export const PLATE_TAGS = [
  "THE NAP STATE",
  "LAND OF 1000 POTHOLES",
  "DRIVE IT LIKE YOU STOLE IT (YOU DIDN'T)",
  "COOPTEEVILLE · EST. 2026",
];

// Starter blocklist; plates also go through human review (orders start as Printful drafts).
const BLOCK = ["FUK", "FCK", "SHT", "SH1T", "BTCH", "DCK", "D1CK", "CUNT", "FAG", "NGR", "N1G", "KKK", "H8", "SEX", "69", "420", "ASS", "A55", "WTF", "STFU"];

export function validPlate(text: string): boolean {
  if (!/^[A-Z0-9 ]{1,7}$/.test(text) || !text.trim()) return false;
  const squashed = text.replace(/ /g, "");
  return !BLOCK.some((w) => squashed.includes(w));
}

export const findProduct = (id: string) => (id === PLATE.id ? PLATE : PRODUCTS.find((x) => x.id === id));

export const SHIPPING = { flatCents: 599, freeOverCents: 6000 };
export const PIT_LANE_IDS = ["pl-01", "pl-02", "pl-03", "pl-04", "pl-05", "pl-06"];
