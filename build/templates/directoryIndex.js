import { renderPage, renderBreadcrumb } from "./layout.js";
import { buildMetaTags, buildBreadcrumbJsonLd, jsonLdScript, escapeHtml } from "../lib/seo.js";
import { CATEGORY_GROUPS } from "../lib/categories.js";
import { urlPathForCategory } from "./categoryHub.js";
import { stateName } from "../lib/states.js";
import { urlPathForState } from "./stateHub.js";

const DIRECTORY_STYLES = `
.dir-group{margin-bottom:22px;}
.dir-group h2{font-size:16px;color:var(--navy);border-left:4px solid var(--yellow);padding-left:10px;margin-bottom:8px;}
.dir-list{display:flex;flex-wrap:wrap;gap:8px;}
.dir-list a{background:white;border:1px solid var(--gray-border);border-radius:5px;padding:6px 12px;font-size:13px;text-decoration:none;color:var(--navy);}
.dir-list a:hover{border-color:var(--blue);}
.state-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;}
.state-grid a{background:white;border:1px solid var(--gray-border);border-radius:5px;padding:8px 12px;font-size:13px;text-decoration:none;color:var(--navy);}
.state-grid a:hover{border-color:var(--blue);}
`;

// populatedSlugs: Set of category slugs that actually have at least one active listing
export function renderCategoryDirectory(populatedSlugs) {
  const urlPath = "/category/";
  const title = "Browse Senior Care Equipment by Category | SeniorSafetyMarket.com";
  const description = "Browse used senior care and home safety equipment by category — wheelchairs, hospital beds, lift chairs, scooters, and more.";

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath });
  const breadcrumbItems = [{ name: "Home", path: "/" }, { name: "Browse by Category", path: urlPath }];
  const jsonLdHtml = jsonLdScript(buildBreadcrumbJsonLd(breadcrumbItems));
  const breadcrumbHtml = renderBreadcrumb(breadcrumbItems);

  const groupsHtml = CATEGORY_GROUPS.map(({ group, categories }) => {
    const populated = categories.filter((c) => populatedSlugs.has(c.slug));
    if (populated.length === 0) return "";
    return `<div class="dir-group">
      <h2>${escapeHtml(group)}</h2>
      <div class="dir-list">${populated.map((c) => `<a href="${urlPathForCategory(c.slug)}">${escapeHtml(c.label)}</a>`).join("")}</div>
    </div>`;
  }).join("");

  const bodyHtml = `
<style>${DIRECTORY_STYLES}</style>
<h1 style="color:var(--navy);font-size:24px;">Browse by Category</h1>
${groupsHtml}`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}

// populatedStateCodes: Set of state codes ("OH", "AZ", ...) that have at least one active listing
export function renderBrowseDirectory(populatedStateCodes) {
  const urlPath = "/browse/";
  const title = "Browse Senior Care Equipment by State & City | SeniorSafetyMarket.com";
  const description = "Find used senior care equipment for sale near you — browse listings by state and city on SeniorSafetyMarket.com.";

  const metaHtml = buildMetaTags({ title, description, canonicalPath: urlPath });
  const breadcrumbItems = [{ name: "Home", path: "/" }, { name: "Browse by Location", path: urlPath }];
  const jsonLdHtml = jsonLdScript(buildBreadcrumbJsonLd(breadcrumbItems));
  const breadcrumbHtml = renderBreadcrumb(breadcrumbItems);

  const states = [...populatedStateCodes].sort((a, b) => stateName(a).localeCompare(stateName(b)));
  const stateGridHtml = states.map((code) => `<a href="${urlPathForState(code)}">${escapeHtml(stateName(code))}</a>`).join("");

  const bodyHtml = `
<style>${DIRECTORY_STYLES}</style>
<h1 style="color:var(--navy);font-size:24px;">Browse by State</h1>
<div class="state-grid">${stateGridHtml}</div>`;

  return { urlPath, html: renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) };
}
