// Static US state code -> full name lookup, used only for hub-page display text (titles/h1s).
// Mirrors index.html's STATE_NAMES (line ~2163) — safe to hand-maintain separately since this
// list is universally fixed and never changes, unlike the category list.
export const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado",
  CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

export function stateName(code) {
  return STATE_NAMES[code] || code;
}

// "Cleveland, OH" -> "OH". Returns null if the city string doesn't match the expected pattern.
export function deriveStateCode(city) {
  const match = String(city || "").match(/,\s*([A-Za-z]{2})\s*$/);
  return match ? match[1].toUpperCase() : null;
}

// "Cleveland, OH" -> "Cleveland"
export function cityNamePart(city) {
  return String(city || "").replace(/,\s*[A-Za-z]{2}\s*$/, "").trim();
}
