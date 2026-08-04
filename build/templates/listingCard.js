import { escapeHtml, fmtPrice, firstPhoto } from "../lib/seo.js";
import { urlPathForListing } from "./listingDetail.js";

export const LISTING_CARD_STYLES = `
.hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;margin:16px 0;}
.hub-card{background:white;border:1px solid var(--gray-border);border-radius:8px;overflow:hidden;text-decoration:none;color:inherit;display:block;position:relative;}
.hub-card:hover{border-color:var(--blue);}
.hub-card .thumb{width:100%;height:150px;object-fit:cover;background:var(--gray-bg);display:block;}
.hub-card .thumb-empty{width:100%;height:150px;display:flex;align-items:center;justify-content:center;background:var(--gray-bg);font-size:36px;}
.hub-card .body{padding:10px 12px;}
.hub-card .title{font-size:14px;font-weight:bold;color:var(--navy);margin-bottom:4px;line-height:1.3;}
.hub-card .price{font-size:15px;font-weight:900;color:var(--navy);}
.hub-card .meta{font-size:12px;color:var(--gray-mid);margin-top:2px;}
.hub-card .sold-tag{position:absolute;top:8px;left:8px;background:var(--red);color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:3px;text-transform:uppercase;}
`;

export function renderListingCardHtml(listing) {
  const photo = firstPhoto(listing);
  const isDonate = !listing.price || parseFloat(listing.price) <= 0;
  const thumb = photo
    ? `<img class="thumb" src="${escapeHtml(photo)}" alt="${escapeHtml(listing.title)}" loading="lazy">`
    : `<div class="thumb-empty">📦</div>`;

  return `<a class="hub-card" href="${urlPathForListing(listing)}">
    ${listing.is_sold ? `<span class="sold-tag">Sold</span>` : ""}
    ${thumb}
    <div class="body">
      <div class="title">${escapeHtml(listing.title)}</div>
      <div class="price">${isDonate ? "FREE" : fmtPrice(listing.price)}</div>
      <div class="meta">${escapeHtml(listing.condition || "")} · 📍 ${escapeHtml(listing.city || "")}</div>
    </div>
  </a>`;
}

export function renderListingGrid(listings) {
  return `<div class="hub-grid">${listings.map(renderListingCardHtml).join("\n")}</div>`;
}
