// SeniorSafetyMarket static-page generator — entry point.
//
// Phase 3: generates real, pre-rendered /listing/{id}/ pages for every active listing, plus
// a real sitemap.xml. Deployment is manual (drag dist/ into Hostinger File Manager) — automated
// FTP deploy from GitHub Actions was tried and abandoned because Hostinger blocks connections
// from GitHub's IP ranges.

import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadConfig } from "./lib/config.js";
import { fetchActiveListings } from "./lib/supabase.js";
import { renderListingDetail, urlPathForListing } from "./templates/listingDetail.js";
import { generateSitemap } from "./sitemap.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");

function writePage(urlPath, html) {
  // urlPath like "/listing/abc-123/" -> dist/listing/abc-123/index.html
  const dir = path.join(DIST, urlPath.replace(/^\/|\/$/g, ""));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "index.html"), html, "utf-8");
}

async function main() {
  mkdirSync(DIST, { recursive: true });

  const config = loadConfig();
  console.log("SeniorSafetyMarket build: fetching active listings from Supabase...");
  const listings = await fetchActiveListings(config);
  console.log(`SeniorSafetyMarket build: ${listings.length} active listings.`);

  const listingPages = [];
  for (const listing of listings) {
    const { urlPath, html } = renderListingDetail(listing);
    writePage(urlPath, html);
    listingPages.push({ urlPath, listing });
  }

  const sitemapCount = generateSitemap(DIST, { listingPages });

  writeFileSync(
    path.join(DIST, "generator-status.txt"),
    `SeniorSafetyMarket generator ran at ${new Date().toISOString()}\n` +
      `${listingPages.length} listing pages, ${sitemapCount} sitemap entries.\n`,
    "utf-8"
  );

  console.log(`SeniorSafetyMarket build: wrote ${listingPages.length} listing pages + sitemap.xml (${sitemapCount} entries).`);
}

main().catch((err) => {
  console.error("SeniorSafetyMarket build failed:", err);
  process.exit(1);
});
