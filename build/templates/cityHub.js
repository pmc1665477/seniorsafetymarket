import { renderPage, renderBreadcrumb } from "./layout.js";
import { buildMetaTags, buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdScript, escapeHtml } from "../lib/seo.js";
import { stateName } from "../lib/states.js";
import { renderListingGrid, LISTING_CARD_STYLES } from "./listingCard.js";
import { urlPathForListing } from "./listingDetail.js";
import { urlPathForState } from "./stateHub.js";

export function urlPathForCity(stateCode, citySlug) {
  return `/browse/${stateCode.toLowerCase()}/${citySlug}/`;
}

// cityLiteral: the exact "City, ST" string as stored on listings (needed for the live-site deep link
// to match renderListings()'s exact-match query — see index.html's activeCity handling).
export function renderCityHub(stateCode, citySlug, cityLiteral, cityNameOnly, listings) {
  const urlPath = urlPathForCity(stateCode, citySlug);
  const stName = stateName(stateCode);
  const title = `Used Senior Care Equipment for Sale in ${cityNameOnly}, ${stateCode} | SeniorSafetyMarket.com`;
  const description = `Browse ${listings.length} used senior care equipment listing${listings.length === 1 ? "" : "s"} for sale in ${cityNameOnly}, ${stName} — wheelchairs, hospital beds, scooters, and more from local sellers.`;

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath });
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Browse by Location", path: "/browse/" },
    { name: stName, path: urlPathForState(stateCode) },
    { name: cityNameOnly, path: urlPath },
  ];
  const jsonLdHtml =
    jsonLdScript(buildBreadcrumbJsonLd(breadcrumbItems)) +
    "\n" +
    jsonLdScript(buildItemListJsonLd(listings, urlPathForListing));
  const breadcrumbHtml = renderBreadcrumb(breadcrumbItems);

  const bodyHtml = `
<style>${LISTING_CARD_STYLES}</style>
<h1 style="color:var(--navy);font-size:24px;">Used Senior Care Equipment in ${escapeHtml(cityNameOnly)}, ${escapeHtml(stateCode)}</h1>
<p style="color:var(--text-muted, #5a6170);margin-bottom:6px;">${listings.length} listing${listings.length === 1 ? "" : "s"} available now.</p>
<a href="/?city=${encodeURIComponent(cityLiteral)}" style="display:inline-block;background:var(--blue);color:white;font-weight:bold;padding:8px 16px;border-radius:5px;text-decoration:none;font-size:13px;margin-bottom:16px;">View &amp; Filter Live on the Marketplace →</a>
${renderListingGrid(listings)}`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}
