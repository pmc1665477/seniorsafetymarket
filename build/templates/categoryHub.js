import { renderPage, renderBreadcrumb } from "./layout.js";
import { buildMetaTags, buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdScript, escapeHtml } from "../lib/seo.js";
import { categoryLabel } from "../lib/categories.js";
import { renderListingGrid, LISTING_CARD_STYLES } from "./listingCard.js";
import { urlPathForListing } from "./listingDetail.js";

export function urlPathForCategory(slug) {
  return `/category/${slug}/`;
}

// listings: only the active listings in this category (caller has already filtered + thin-content-guarded)
export function renderCategoryHub(slug, listings) {
  const urlPath = urlPathForCategory(slug);
  const label = categoryLabel(slug);
  const title = `Used ${label} for Sale | SeniorSafetyMarket.com`;
  const description = `Browse ${listings.length} used ${label.toLowerCase()} listing${listings.length === 1 ? "" : "s"} for sale from real sellers. Buy directly, no middleman, on SeniorSafetyMarket.com.`;

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath });
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: label, path: urlPath },
  ];
  const jsonLdHtml =
    jsonLdScript(buildBreadcrumbJsonLd(breadcrumbItems)) +
    "\n" +
    jsonLdScript(buildItemListJsonLd(listings, urlPathForListing));
  const breadcrumbHtml = renderBreadcrumb(breadcrumbItems);

  const bodyHtml = `
<style>${LISTING_CARD_STYLES}</style>
<h1 style="color:var(--navy);font-size:24px;">Used ${escapeHtml(label)} for Sale</h1>
<p style="color:var(--text-muted, #5a6170);margin-bottom:6px;">${listings.length} listing${listings.length === 1 ? "" : "s"} available now.</p>
<a href="/?cat=${encodeURIComponent(slug)}" style="display:inline-block;background:var(--blue);color:white;font-weight:bold;padding:8px 16px;border-radius:5px;text-decoration:none;font-size:13px;margin-bottom:16px;">View &amp; Filter Live on the Marketplace →</a>
${renderListingGrid(listings)}`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}
