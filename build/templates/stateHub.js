import { renderPage, renderBreadcrumb } from "./layout.js";
import { buildMetaTags, buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdScript, escapeHtml } from "../lib/seo.js";
import { stateName } from "../lib/states.js";
import { renderListingGrid, LISTING_CARD_STYLES } from "./listingCard.js";
import { urlPathForListing } from "./listingDetail.js";
import { urlPathForCity } from "./cityHub.js";

export function urlPathForState(stateCode) {
  return `/browse/${stateCode.toLowerCase()}/`;
}

// cityGroups: [{ cityLiteral, citySlug, listings }] — every city in this state with >=1 active listing
export function renderStateHub(stateCode, cityGroups) {
  const urlPath = urlPathForState(stateCode);
  const name = stateName(stateCode);
  const allListings = cityGroups.flatMap((g) => g.listings);
  const title = `Used Senior Care Equipment for Sale in ${name} | SeniorSafetyMarket.com`;
  const description = `Browse ${allListings.length} used senior care equipment listing${allListings.length === 1 ? "" : "s"} for sale in ${name} — wheelchairs, hospital beds, scooters, and more from local sellers.`;

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath });
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Browse by Location", path: "/browse/" },
    { name, path: urlPath },
  ];
  const jsonLdHtml =
    jsonLdScript(buildBreadcrumbJsonLd(breadcrumbItems)) +
    "\n" +
    jsonLdScript(buildItemListJsonLd(allListings, urlPathForListing));
  const breadcrumbHtml = renderBreadcrumb(breadcrumbItems);

  const cityLinksHtml = cityGroups
    .sort((a, b) => b.listings.length - a.listings.length)
    .map((g) => `<a href="${urlPathForCity(stateCode, g.citySlug)}">${escapeHtml(g.cityLiteral)} (${g.listings.length})</a>`)
    .join("");

  const bodyHtml = `
<style>
${LISTING_CARD_STYLES}
.city-list{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 20px;}
.city-list a{background:white;border:1px solid var(--gray-border);border-radius:5px;padding:6px 12px;font-size:13px;text-decoration:none;color:var(--navy);}
.city-list a:hover{border-color:var(--blue);}
</style>
<h1 style="color:var(--navy);font-size:24px;">Used Senior Care Equipment in ${escapeHtml(name)}</h1>
<p style="color:var(--text-muted, #5a6170);margin-bottom:6px;">${allListings.length} listing${allListings.length === 1 ? "" : "s"} across ${cityGroups.length} cit${cityGroups.length === 1 ? "y" : "ies"}.</p>
<a href="/?state=${encodeURIComponent(stateCode)}" style="display:inline-block;background:var(--blue);color:white;font-weight:bold;padding:8px 16px;border-radius:5px;text-decoration:none;font-size:13px;margin-bottom:12px;">View &amp; Filter Live on the Marketplace →</a>
<div class="city-list">${cityLinksHtml}</div>
${renderListingGrid(allListings)}`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}
