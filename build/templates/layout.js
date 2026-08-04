// Shared header/footer/CSS for generated pages, matching index.html's palette and the
// hand-written SEO guide pages' chrome (navy header, yellow circular logo icon).

export function renderPage({ metaHtml, jsonLdHtml, breadcrumbHtml, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${metaHtml}
${jsonLdHtml}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="shortcut icon" href="/favicon.svg">
<style>
:root{
  --navy:#1a3a2a; --blue:#2a7a4e; --blue-light:#e8f5ee;
  --yellow:#f5c518; --yellow-dark:#c49b00;
  --gray-bg:#f4f5f6; --gray-border:#dde0e4; --gray-mid:#8a909a;
  --green:#1a7a3e; --green-light:#e8f5ee; --text:#1a1a1a;
  --red:#b91c1c; --red-light:#fef2f2;
}
*{box-sizing:border-box;}
body{font-family:Arial,sans-serif;font-size:15px;color:var(--text);background:var(--gray-bg);margin:0;line-height:1.7;}
a{color:var(--blue);}
header{background:var(--navy);padding:14px 20px;}
.header-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;}
.header-logo{display:flex;align-items:center;gap:10px;text-decoration:none;}
.logo-icon{width:36px;height:36px;background:var(--yellow);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.logo-text a{color:white;text-decoration:none;font-weight:bold;font-size:16px;}
.logo-text span{display:block;color:#a0c4b4;font-size:11px;}
.header-cta{background:var(--yellow);color:var(--navy);font-weight:bold;padding:8px 16px;border-radius:5px;text-decoration:none;font-size:13px;}
main{max-width:900px;margin:0 auto;padding:20px 20px 10px;}
.breadcrumb{max-width:900px;margin:16px auto 0;padding:0 20px;font-size:12px;color:var(--gray-mid);}
.breadcrumb a{color:var(--gray-mid);}
footer{background:var(--navy);color:#a0c4b4;text-align:center;padding:22px 20px;font-size:12px;margin-top:20px;}
footer a{color:#7fb3a0;}
</style>
</head>
<body>
<header>
  <div class="header-inner">
    <a href="/" class="header-logo">
      <div class="logo-icon">♿</div>
      <div class="logo-text">
        <a href="/">Senior Safety Market</a>
        <span>SeniorSafetyMarket.com — Senior Care Equipment Marketplace</span>
      </div>
    </a>
    <a href="/" class="header-cta">Browse All Listings</a>
  </div>
</header>
${breadcrumbHtml}
<main>
${bodyHtml}
</main>
<footer>
  <p>© 2026 Senior Safety Market · <a href="/">Home</a> · <a href="/about.html">About</a> · <a href="/contact.html">Contact</a></p>
</footer>
</body>
</html>
`;
}

export function renderBreadcrumb(items) {
  // items: [{ name, path }] — last item renders as plain text (current page)
  const parts = items.map((item, i) =>
    i === items.length - 1 ? item.name : `<a href="${item.path}">${item.name}</a>`
  );
  return `<div class="breadcrumb">${parts.join(" &rsaquo; ")}</div>`;
}
