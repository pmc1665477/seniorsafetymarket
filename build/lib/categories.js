// Canonical category list, mirrored from index.html's sidebar/#listingCategory (the source of
// truth — see the cross-reference comments in index.html near .sidebar-left, #listingCategory,
// #editCategory, #catFilter, and getCategoryEmoji()). If a category is ever added there, add it
// here too — this list drives category hub-page generation (Phase 4) and listing breadcrumbs.

export const CATEGORY_GROUPS = [
  {
    group: "Mobility",
    categories: [
      { slug: "wheelchairs", label: "Wheelchairs" },
      { slug: "walkers", label: "Walkers & Rollators" },
      { slug: "canes", label: "Canes & Crutches" },
      { slug: "scooters", label: "Power Scooters" },
      { slug: "transport-chairs", label: "Transport Chairs" },
      { slug: "patient-lifts", label: "Patient Lifts" },
      { slug: "gait-belts", label: "Gait Belts" },
    ],
  },
  {
    group: "Sleep & Rest",
    categories: [
      { slug: "hospital-beds", label: "Electric Hospital Beds" },
      { slug: "lift-chairs", label: "Lift Chairs" },
      { slug: "mattresses", label: "Pressure Relief Mattresses" },
      { slug: "overbed-tables", label: "Overbed Tables" },
    ],
  },
  {
    group: "Bathroom Safety",
    categories: [
      { slug: "grab-bars", label: "Grab Bars" },
      { slug: "shower-chairs", label: "Shower Chairs & Benches" },
      { slug: "potty-seats", label: "Raised Potty Seats" },
      { slug: "bath-lifts", label: "Bath Lifts" },
      { slug: "non-slip", label: "Non-Slip Tape & Mats" },
    ],
  },
  {
    group: "Bedroom & Living",
    categories: [
      { slug: "bed-rails", label: "Bed Rails & Handles" },
      { slug: "nightstands", label: "End Tables & Nightstands" },
      { slug: "dressers", label: "Dressers" },
      { slug: "stair-lifts", label: "Stair Lifts" },
      { slug: "ramps", label: "Ramps & Threshold Ramps" },
    ],
  },
  {
    group: "Home & Safety Essentials",
    categories: [{ slug: "big-button-phones", label: "Big Button Phones" }],
  },
  {
    group: "Personal Care",
    categories: [{ slug: "incontinence-supplies", label: "Incontinence Supplies (Unopened)" }],
  },
  {
    group: "Medical Devices",
    categories: [
      { slug: "oxygen", label: "Oxygen Equipment" },
      { slug: "blood-pressure", label: "Blood Pressure Monitors" },
      { slug: "nebulizers", label: "Nebulizers" },
      { slug: "med-supplies", label: "Medical Supplies & Misc" },
    ],
  },
];

const BY_SLUG = new Map();
for (const { group, categories } of CATEGORY_GROUPS) {
  for (const cat of categories) {
    BY_SLUG.set(cat.slug, { ...cat, group });
  }
}

export function categoryLabel(slug) {
  return BY_SLUG.get(slug)?.label || slug;
}

export function categoryInfo(slug) {
  return BY_SLUG.get(slug) || null;
}

export function allCategorySlugs() {
  return [...BY_SLUG.keys()];
}
