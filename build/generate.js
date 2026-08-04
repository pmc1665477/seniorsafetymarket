// SeniorSafetyMarket static-page generator — entry point.
//
// Phase 3: real /listing/{id}/ pages for every active listing.
// Phase 4: category and state/city hub pages, thin-content-guarded (only generated where at
// least one active listing actually exists — an empty hub page is worse for SEO than no page).
//
// Deployment is manual (drag dist/ into Hostinger File Manager) — automated FTP deploy from
// GitHub Actions was tried and abandoned because Hostinger blocks connections from GitHub's IPs.

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadConfig } from "./lib/config.js";
import { fetchActiveListings } from "./lib/supabase.js";
import { slugify } from "./lib/slugify.js";
import { deriveStateCode, cityNamePart } from "./lib/states.js";
import { allCategorySlugs } from "./lib/categories.js";
import { renderListingDetail, urlPathForListing } from "./templates/listingDetail.js";
import { renderCategoryHub, urlPathForCategory } from "./templates/categoryHub.js";
import { renderStateHub, urlPathForState } from "./templates/stateHub.js";
import { renderCityHub, urlPathForCity } from "./templates/cityHub.js";
import { renderCategoryDirectory, renderBrowseDirectory } from "./templates/directoryIndex.js";
import { generateSitemap } from "./sitemap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function writePage(urlPath, html) {
  const dir = path.join(DIST, urlPath.replace(/^\/|\/$/g, ""));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html, "utf-8");
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (key == null) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

async function main() {
  mkdirSync(DIST, { recursive: true });

  const config = loadConfig();
  console.log("SeniorSafetyMarket build: fetching active listings from Supabase...");
  const listings = await fetchActiveListings(config);
  console.log(`SeniorSafetyMarket build: ${listings.length} active listings.`);

  // ---- Listing detail pages ----
  const listingPages = [];
  for (const listing of listings) {
    const { urlPath, html } = renderListingDetail(listing);
    writePage(urlPath, html);
    listingPages.push({ urlPath, listing });
  }

  const hubPages = [];

  // ---- Category hubs ----
  const byCategorySlug = groupBy(listings, (l) => l.category);
  const populatedCategorySlugs = new Set();
  for (const slug of allCategorySlugs()) {
    const catListings = byCategorySlug.get(slug);
    if (!catListings || catListings.length === 0) continue; // thin-content guard
    populatedCategorySlugs.add(slug);
    const { urlPath, html } = renderCategoryHub(slug, catListings);
    writePage(urlPath, html);
    hubPages.push({ urlPath, priority: "0.6", changefreq: "daily" });
  }
  {
    const { urlPath, html } = renderCategoryDirectory(populatedCategorySlugs);
    writePage(urlPath, html);
    hubPages.push({ urlPath, priority: "0.5", changefreq: "weekly" });
  }

  // ---- State / city hubs ----
  // Group by derived state code, then by the exact literal city string within each state
  // (must stay literal — it has to match renderListings()'s exact-match query on the live site).
  const byState = new Map();
  for (const listing of listings) {
    const stateCode = deriveStateCode(listing.city);
    if (!stateCode) continue; // skip anything that doesn't parse cleanly, rather than guess
    if (!byState.has(stateCode)) byState.set(stateCode, new Map());
    const byCity = byState.get(stateCode);
    const cityLiteral = listing.city;
    if (!byCity.has(cityLiteral)) byCity.set(cityLiteral, []);
    byCity.get(cityLiteral).push(listing);
  }

  const populatedStateCodes = new Set();
  for (const [stateCode, byCity] of byState.entries()) {
    if (byCity.size === 0) continue; // thin-content guard
    populatedStateCodes.add(stateCode);

    const cityGroups = [...byCity.entries()].map(([cityLiteral, cityListings]) => ({
      cityLiteral,
      citySlug: slugify(cityNamePart(cityLiteral)),
      listings: cityListings,
    }));

    for (const group of cityGroups) {
      const { urlPath, html } = renderCityHub(
        stateCode,
        group.citySlug,
        group.cityLiteral,
        cityNamePart(group.cityLiteral),
        group.listings
      );
      writePage(urlPath, html);
      hubPages.push({ urlPath, priority: "0.5", changefreq: "daily" });
    }

    const { urlPath, html } = renderStateHub(stateCode, cityGroups);
    writePage(urlPath, html);
    hubPages.push({ urlPath, priority: "0.5", changefreq: "daily" });
  }
  {
    const { urlPath, html } = renderBrowseDirectory(populatedStateCodes);
    writePage(urlPath, html);
    hubPages.push({ urlPath, priority: "0.5", changefreq: "weekly" });
  }

  const sitemapCount = generateSitemap(DIST, { listingPages, hubPages });

  writeFileSync(
    path.join(DIST, "generator-status.txt"),
    `SeniorSafetyMarket generator ran at ${new Date().toISOString()}\n` +
      `${listingPages.length} listing pages, ${populatedCategorySlugs.size} category hubs, ` +
      `${populatedStateCodes.size} state hubs, ${sitemapCount} sitemap entries.\n`,
    "utf-8"
  );

  console.log(
    `SeniorSafetyMarket build: ${listingPages.length} listing pages, ${populatedCategorySlugs.size} category hubs, ` +
      `${populatedStateCodes.size} state hubs, ${sitemapCount} total sitemap entries.`
  );
}

main().catch((err) => {
  console.error("SeniorSafetyMarket build failed:", err);
  process.exit(1);
});
