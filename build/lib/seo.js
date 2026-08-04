import { BASE_URL } from "./config.js";

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function fmtPrice(price) {
  const n = parseFloat(price);
  if (!n || n <= 0) return "Free";
  return "$" + n.toLocaleString();
}

// First photo URL from the listing's photo_urls JSON string, or null if there isn't one —
// mirrors the exact parse-with-fallback pattern renderListingCard() uses in index.html.
export function firstPhoto(listing) {
  if (!listing.photo_urls) return null;
  try {
    const photos = JSON.parse(listing.photo_urls);
    return photos && photos.length > 0 ? photos[0] : null;
  } catch {
    return null;
  }
}

// schema.org itemCondition mapping — not a perfect fit for "Needs Repair" (schema.org has no
// "damaged" condition), so it falls back to UsedCondition same as every other non-New value.
function schemaCondition(condition) {
  return condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition";
}

export function buildMetaTags({ title, description, canonicalPath, image }) {
  const canonical = BASE_URL + canonicalPath;
  const ogImage = image || `${BASE_URL}/og-image.jpg`;
  return `<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="${escapeHtml(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">`;
}

export function buildListingJsonLd(listing, canonicalPath) {
  const url = BASE_URL + canonicalPath;
  const photo = firstPhoto(listing);
  const isDonate = !listing.price || parseFloat(listing.price) <= 0;

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || listing.title,
    category: listing.category,
    url,
    itemCondition: schemaCondition(listing.condition),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: isDonate ? "0" : String(parseFloat(listing.price)),
      availability: listing.is_sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };
  if (photo) product.image = photo;
  if (listing.brand) product.brand = { "@type": "Brand", name: listing.brand };
  if (listing.city) product.offers.areaServed = listing.city;

  return product;
}

export function buildBreadcrumbJsonLd(items) {
  // items: [{ name, path }] in order, path relative (e.g. "/", "/category/wheelchairs/")
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: BASE_URL + item.path,
    })),
  };
}

export function jsonLdScript(data) {
  return `<script type="application/ld+json">\n${JSON.stringify(data)}\n</script>`;
}
