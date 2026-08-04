import { renderPage, renderBreadcrumb } from "./layout.js";
import { escapeHtml, fmtPrice, firstPhoto, buildMetaTags, buildListingJsonLd, buildBreadcrumbJsonLd, jsonLdScript } from "../lib/seo.js";
import { categoryLabel } from "../lib/categories.js";

const DELIVERY_LABELS = [
  ["delivery_pickup", "🚗 Local Pickup"],
  ["delivery_ship", "📦 Will Ship"],
  ["delivery_meetup", "🤝 Meet-up"],
  ["delivery_freight", "🚛 Freight Pickup"],
];

function photoGalleryHtml(listing) {
  let photos = [];
  if (listing.photo_urls) {
    try { photos = JSON.parse(listing.photo_urls); } catch { photos = []; }
  }
  if (!photos || photos.length === 0) {
    return `<div class="listing-photo-empty">📦 No photo provided</div>`;
  }
  const main = photos[0];
  const thumbs = photos.slice(1, 6);
  let html = `<img class="listing-main-photo" src="${escapeHtml(main)}" alt="${escapeHtml(listing.title)}" loading="eager">`;
  if (thumbs.length > 0) {
    html += `<div class="listing-thumb-row">` +
      thumbs.map((p) => `<img src="${escapeHtml(p)}" alt="${escapeHtml(listing.title)}" loading="lazy">`).join("") +
      `</div>`;
  }
  return html;
}

export function urlPathForListing(listing) {
  return `/listing/${encodeURIComponent(listing.id)}/`;
}

export function renderListingDetail(listing) {
  const urlPath = urlPathForListing(listing);
  const catLabel = categoryLabel(listing.category);
  const isDonate = !listing.price || parseFloat(listing.price) <= 0;
  const priceText = isDonate ? "FREE" : fmtPrice(listing.price);
  const soldBanner = listing.is_sold ? `<div class="sold-ribbon">SOLD</div>` : "";

  const delivery = DELIVERY_LABELS.filter(([key]) => listing[key]).map(([, label]) => label);

  const title = `${listing.title} — ${priceText} in ${listing.city || "your area"} | SeniorSafetyMarket.com`;
  const rawDescription = listing.description || `${listing.title}, ${listing.condition || "used"} condition, ${priceText}. Buy directly from a local seller on SeniorSafetyMarket.com.`;
  // Meta/OG descriptions need a clean single line — collapse whitespace before truncating.
  const description = rawDescription.replace(/\s+/g, " ").trim().slice(0, 300);

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath, image: firstPhoto(listing) });
  const jsonLdHtml =
    jsonLdScript(buildListingJsonLd(listing, urlPath)) +
    "\n" +
    jsonLdScript(
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: catLabel, path: `/category/${listing.category}/` },
        { name: listing.title, path: urlPath },
      ])
    );
  const breadcrumbHtml = renderBreadcrumb([
    { name: "Home", path: "/" },
    { name: catLabel, path: `/category/${listing.category}/` },
    { name: listing.title, path: urlPath },
  ]);

  const bodyHtml = `
<style>
.listing-wrap{background:white;border:1px solid var(--gray-border);border-radius:8px;padding:24px;position:relative;}
.sold-ribbon{position:absolute;top:20px;right:-36px;width:160px;background:var(--red);color:white;font-weight:bold;font-size:13px;letter-spacing:2px;text-align:center;padding:4px 0;transform:rotate(35deg);text-transform:uppercase;}
.listing-main-photo{width:100%;max-height:420px;object-fit:cover;border-radius:6px;background:var(--gray-bg);}
.listing-photo-empty{width:100%;height:220px;display:flex;align-items:center;justify-content:center;background:var(--gray-bg);border-radius:6px;font-size:15px;color:var(--gray-mid);}
.listing-thumb-row{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;}
.listing-thumb-row img{width:80px;height:80px;object-fit:cover;border-radius:4px;}
h1{font-size:24px;color:var(--navy);margin:18px 0 4px;}
.listing-price{font-size:26px;font-weight:900;color:var(--navy);margin-bottom:10px;}
.listing-meta-row{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--text);margin-bottom:16px;}
.listing-meta-row span{background:var(--blue-light);border-radius:4px;padding:4px 10px;}
.listing-desc{font-size:15px;margin:16px 0;white-space:pre-wrap;}
.delivery-list{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0;}
.delivery-list span{background:var(--gray-bg);border:1px solid var(--gray-border);border-radius:5px;padding:6px 12px;font-size:13px;}
.cta-box{background:var(--blue-light);border:2px solid var(--blue);border-radius:10px;padding:20px;text-align:center;margin:26px 0 6px;}
.cta-box a.btn{display:inline-block;background:var(--blue);color:white;font-weight:bold;padding:12px 26px;border-radius:6px;text-decoration:none;margin-top:8px;}
</style>
<div class="listing-wrap">
  ${soldBanner}
  ${photoGalleryHtml(listing)}
  <h1>${escapeHtml(listing.title)}</h1>
  <div class="listing-price">${priceText}</div>
  <div class="listing-meta-row">
    <span>${escapeHtml(listing.condition || "")}</span>
    <span>📍 ${escapeHtml(listing.city || "")}</span>
    <span>${escapeHtml(catLabel)}</span>
    ${listing.brand ? `<span>${escapeHtml(listing.brand)}</span>` : ""}
  </div>
  <div class="listing-desc">${escapeHtml(listing.description || "")}</div>
  ${delivery.length ? `<div class="delivery-list">${delivery.map((d) => `<span>${d}</span>`).join("")}</div>` : ""}
  <div class="cta-box">
    <h3 style="color:var(--navy);margin:0 0 6px;">${listing.is_sold ? "This item has sold" : "Interested in this item?"}</h3>
    <p style="margin:0;">${listing.is_sold ? "Browse other listings currently available." : "Contact the seller directly through SeniorSafetyMarket."}</p>
    <a href="/?listing=${encodeURIComponent(listing.id)}" class="btn">${listing.is_sold ? "Browse Listings" : "Contact Seller"} →</a>
  </div>
</div>`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}
