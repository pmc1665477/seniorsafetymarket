import { writeFileSync } from "node:fs";
import path from "node:path";
import { BASE_URL } from "./lib/config.js";

function xmlEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `<url><loc>${xmlEscape(BASE_URL + loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

// Hand-authored pages not produced by the generator — kept here so the sitemap stays complete
// without needing every static file re-declared elsewhere.
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about.html", priority: "0.5", changefreq: "monthly" },
  { path: "/contact.html", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy.html", priority: "0.2", changefreq: "yearly" },
  { path: "/terms.html", priority: "0.2", changefreq: "yearly" },
  { path: "/bringing-loved-one-home-checklist.html", priority: "0.6", changefreq: "monthly" },
  { path: "/free-wheelchair-near-me.html", priority: "0.6", changefreq: "monthly" },
  { path: "/used-hospital-bed-buying-guide.html", priority: "0.6", changefreq: "monthly" },
  { path: "/used-equipment-savings.html", priority: "0.6", changefreq: "monthly" },
];

function lastmodOf(row) {
  return row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : undefined;
}

// listingPages: [{ urlPath, listing }]. hubPages (Phase 4+): [{ urlPath, priority, changefreq }]
export function generateSitemap(distDir, { listingPages = [], hubPages = [] } = {}) {
  const entries = [
    ...STATIC_PAGES.map((p) => urlEntry(p.path, undefined, p.changefreq, p.priority)),
    ...listingPages.map(({ urlPath, listing }) => urlEntry(urlPath, lastmodOf(listing), "weekly", "0.6")),
    ...hubPages.map((h) => urlEntry(h.urlPath, undefined, h.changefreq || "weekly", h.priority || "0.5")),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf-8");
  return entries.length;
}
