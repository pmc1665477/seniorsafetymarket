// Minimal server-side Supabase REST fetch helper — no @supabase/supabase-js dependency needed,
// PostgREST's HTTP API is simple enough to call directly with the built-in fetch.

const PAGE_SIZE = 1000; // PostgREST's default max rows per request

export async function fetchAllListings({ SUPABASE_URL, SUPABASE_KEY, LISTING_COLUMNS }, filters = "") {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const url =
      `${SUPABASE_URL}/rest/v1/listings?select=${encodeURIComponent(LISTING_COLUMNS)}${filters}` +
      `&order=created_at.desc`;

    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${from}-${to}`,
      },
    });

    if (!res.ok && res.status !== 206) {
      throw new Error(`Supabase fetch failed: ${res.status} ${res.statusText} — ${await res.text()}`);
    }

    const page = await res.json();
    rows.push(...page);

    if (page.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

export function fetchActiveListings(config) {
  // Mirrors what the live site shows by default: not sold, not deactivated/expired.
  return fetchAllListings(config, "&is_active=eq.true&is_sold=eq.false");
}
