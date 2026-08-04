// Pulls Supabase config straight out of index.html at build time instead of hardcoding a
// second copy here — if the anon key is ever rotated or a column is added to
// PUBLIC_LISTING_COLUMNS in index.html, the generator picks it up automatically.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_HTML_PATH = path.join(__dirname, "..", "..", "index.html");

function extract(html, pattern, label) {
  const match = html.match(pattern);
  if (!match) {
    throw new Error(`Could not find ${label} in index.html — has its declaration changed?`);
  }
  return match[1];
}

export function loadConfig() {
  const html = readFileSync(INDEX_HTML_PATH, "utf-8");

  const SUPABASE_URL = extract(html, /var SUPABASE_URL\s*=\s*'([^']+)'/, "SUPABASE_URL");
  const SUPABASE_KEY = extract(html, /var SUPABASE_KEY\s*=\s*'([^']+)'/, "SUPABASE_KEY");
  const PUBLIC_LISTING_COLUMNS = extract(
    html,
    /var PUBLIC_LISTING_COLUMNS\s*=\s*'([^']+)'/,
    "PUBLIC_LISTING_COLUMNS"
  );

  return {
    SUPABASE_URL,
    SUPABASE_KEY,
    // sold_at isn't in the public column list (it's appended separately at the two call
    // sites that need it, same pattern index.html itself uses for the sold carousel) —
    // the generator needs it too, to compute Offer.availability and sitemap lastmod.
    LISTING_COLUMNS: PUBLIC_LISTING_COLUMNS + ",is_sold,sold_at",
  };
}

export const BASE_URL = "https://seniorsafetymarket.com";
