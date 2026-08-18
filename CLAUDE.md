# SeniorSafetyMarket — status notes for Claude

Read this before doing anything else in this repo. It exists because Claude Code has no
memory between sessions, and re-discovering this the hard way each time wastes the user's
time and trust. Keep it updated as facts change — don't let it go stale.

## Who the user is (read this first)

The user is **not a programmer** and does not want to become one. They have health issues
that keep them from working outside the home and are trying to build real income from a
handful of small business sites. They also run `authorrally.com` (repo
`pmc1665477/authorrally`, hosted on Railway — a completely different architecture from this
site), `janitorialmarket.com`, and `helipadusa.com` (repo `pmc1665477/helipadusa`, which
shares its Supabase project with janitorialmarket.com — see that repo's CLAUDE.md). They do
not want jargon, do not want to be asked to make infrastructure decisions they don't have
context for, and do not want to repeat context they've already given. When something is
uncertain, investigate before asking.

**NEVER ask "do you want to stop here?" or anything like it.** The user told us explicitly
(2026-08-12, forcefully) that this is not welcome — they will tell you when they want to
stop. Just keep working, or state what you're doing next, without checking in about whether
to continue. Offering a natural pause point is fine ("that's done — next up is X") but do
not frame it as a question about whether to proceed.

## How this site actually works (confirmed 2026-08-12 by reading the code directly)

**A static site generator**, like HelipadUSA — `build/generate.js` (run via `npm run build`)
writes listing/category/city pages into `dist/`. Not a server-per-request app like
AuthorRally.

**Deliberately many pages, not one.** `build/templates/listingCard.js`, `listingDetail.js`,
`categoryHub.js`, `cityHub.js`, `stateHub.js` each generate a separate static HTML page —
e.g. every individual piece of used equipment (a floor scrubber, a wheelchair) gets its own
crawlable Google URL, instead of one page holding everything. This was a deliberate,
multi-day rebuild for SEO (per the user, 2026-08-12). Don't "simplify" this back into fewer
pages — that would undo the reason it was built this way.

**Data: its own separate Supabase project** (NOT shared with helipadusa/janitorialmarket):

```
https://wnyklntxwcxbwjzwjkrz.supabase.co
```

**Hosting: MIGRATED to Netlify on 2026-08-12 — fully automated now, no more manual steps.**

Previously this site was on Hostinger via manual FTP upload (drag `dist/` into Hostinger's
File Manager by hand — automated FTP from GitHub Actions was tried and abandoned because
Hostinger blocks GitHub's IPs). That manual-deploy problem is now fixed:

- The generator was changed to write pages directly into the repo root (same pattern as
  helipadusa) instead of a `dist/` subfolder, so Netlify's publish directory is just `.`.
- Netlify project `seniorsafetymarket` (netlify.app subdomain: `seniorsafetymarket.netlify.app`)
  deploys automatically from `github.com/pmc1665477/seniorsafetymarket` on every push to `main`.
- A GitHub Actions daily cron (`.github/workflows/daily-rebuild.yml`) pings a Netlify build
  hook once a day as a safety net.
- A **Supabase Database Webhook** (table `listings`, events Insert/Update/Delete, HTTP POST
  to the same Netlify build hook URL) triggers an *instant* rebuild whenever a listing
  changes — set up 2026-08-12 in Database → Webhooks (reached via the Integrations →
  Database Webhooks page, not the "Triggers" page, which only lets you pick an existing
  Postgres function and is a dead end for this).

**A real production bug happened here, now fixed — record it so it never gets repeated.**
The `supabase_functions.http_request()` function created by the schema-setup SQL described
below (in "Known open questions") was missing `SECURITY DEFINER`. Without it, the trigger runs with the permissions of whoever
triggered it — so when a real site visitor (using the public "anon" role) updated a listing
(e.g. renewing it from an email link), the trigger tried to run as that low-privilege role,
hit a permissions wall, and the *entire update failed* with `permission denied for schema
supabase_functions`. This broke real listing renewals in production on 2026-08-13 until
fixed with:

```sql
alter function supabase_functions.http_request() security definer;
grant usage on schema supabase_functions to anon, authenticated, service_role;
```

If this project's `supabase_functions` schema is ever recreated from scratch again, make
sure `security definer` is added to the `create or replace function
supabase_functions.http_request() ... language plpgsql as $function$ ... $function$;`
definition (right after `language plpgsql`) from the start — don't repeat this mistake.

**If webhook creation ever fails with `ERROR: 3F000: schema "supabase_functions" does not
exist`**: this project's database was missing Supabase's internal webhook-support schema.
Toggling the `pg_net` extension off/on does NOT fix this (tried, didn't work). The actual
fix: run the standard Supabase `supabase_functions` schema/table/function setup SQL directly
in the SQL Editor (additive-only — creates `supabase_functions.hooks` table and
`supabase_functions.http_request()` trigger function, doesn't touch any real data). That was
done here already, so this project is fixed — but if a future session sees this same error on
a *different* Supabase project (e.g. if janitorialmarket ever gets its own Supabase project
and hits the same gap), the same fix applies there too.

**DNS CUTOVER COMPLETE 2026-08-14.** seniorsafetymarket.com now points at Netlify for real —
confirmed both by direct DNS lookup (resolves to `75.2.60.5`, Netlify's address) and by
loading the live domain directly, which shows the real site with real listing counts. What
was done: edited the existing root `A` record in Hostinger's DNS panel (`hpanel.hostinger.com
/domain/seniorsafetymarket.com/dns`) from Hostinger's IP to `75.2.60.5`, and deleted the
stale `AAAA @` record (Netlify gave no IPv6 equivalent, so removing it avoids IPv6-capable
visitors hitting the old dead Hostinger address). All Hostinger *email* records
(`hostingermail-*`, `autodiscover`, `autoconfig`, `send` MX/TXT, `resend._domainkey`) were
left untouched and should still work exactly as before — only the website-serving records
changed. Hostinger is no longer involved in serving this site's pages at all.

One expected, harmless transition symptom: right after the DNS change, browsers showed a
`NET::ERR_CERT_COMMON_NAME_INVALID` security warning when visiting the site — this is normal
and temporary, because Netlify hadn't finished auto-issuing the Let's Encrypt SSL
certificate for the domain yet (that happens automatically once Netlify's own system
re-verifies the DNS, typically within minutes to a few hours). Not a real problem, don't
panic if a future session sees this reported — just confirm it has since cleared.

## DNS / domain facts (confirmed 2026-08-12 by reading Hostinger's DNS records directly)

- **seniorsafetymarket.com is registered directly through Hostinger** (not an external
  registrar) — visible in Hostinger's "Domains" list as a domain you own, expiring
  2027-06-19, alongside `woodworkerexchange.com` (also Hostinger-registered, unrelated
  business, not one of the 4 sites being advertised) and `elderlyequipmentmarket.com` (also
  Hostinger-registered, never discussed before today, not investigated — a possible 5th/6th
  business). `janitorialmarket.com` is different: listed under Hostinger's "External
  domains" section, meaning it's registered somewhere else entirely with Hostinger only
  connected to serve the site — its actual DNS location is still unknown as of 2026-08-12.
- **Hostinger genuinely hosts real email for this domain** — confirmed via
  `hostingermail-*._domainkey`, `autodiscover`, `autoconfig` DNS records. This was a guess
  before 2026-08-12; now confirmed. Don't break email when doing any future DNS/hosting
  changes — check for real inboxes before removing Hostinger mail records.
- **CORRECTION: Resend (the email-sending service) IS configured for this domain**, contrary
  to an earlier statement in this session that only authorrally.com uses Resend — that
  claim was based only on grepping this repo's code, which doesn't cover everything. DNS
  proof: a `resend._domainkey` TXT record, plus a `send` MX record pointing to
  `feedback-smtp.us-east-1.amazonses.com` and a matching SPF TXT — this is Resend's standard
  DNS setup pattern (Resend uses Amazon SES under the hood). Not found being called anywhere
  in this repo's own code, so it may be used elsewhere (a Supabase function?) or set up but
  unfinished — genuinely unknown, don't assume either way without checking further.
- Because DNS records are managed directly in Hostinger's own "DNS / Nameservers" panel
  (not delegated to Cloudflare or elsewhere for this domain), switching seniorsafetymarket.com
  to point at Netlify means editing records on that exact page — need to find/add the record
  for the root domain itself (only `www` had been located as of this note; the apex/root
  record wasn't yet located, need to scroll further or check for an A/ALIAS record).

## Known open questions

- Confirm the SSL certificate warning (see "DNS CUTOVER COMPLETE" above) has fully cleared
  on a future check-in — should be automatic, but verify rather than assume.
- Those old `FTP_PASSWORD` / `FTP_SERVER` / `FTP_USERNAME` GitHub Actions secrets are
  leftover from the abandoned Hostinger-FTP automation attempt — harmless, safe to ignore or
  delete, not used by anything anymore.
- Same shared risk as helipadusa.com: the user's Supabase org is on the free tier, and
  free-tier projects auto-pause after 7 days of inactivity. Now more important than before,
  since both the daily cron AND the instant webhook depend on this Supabase project being
  reachable.

## Session of 2026-08-18 — status as of last update (read this if picking up mid-session)

**Done and pushed tonight, in order:**
1. `6f6b6df` — Made the selected pricing card in the "Boost?" step visually obvious (thick
   border + "SELECTED" badge). Same fix also applied to janitorialmarket.com.
2. `94ccf34` — Fixed the posting wizard defaulting to the **$7 Featured** tier instead of
   Free (both the JS `selectedUpsell` variable and the static HTML `selected` class were
   wrong). Same fix also applied to janitorialmarket.com.
3. `5ff97b2` — Added a new admin-gated **"Business Dashboard"** tab (My Account →
   dashboardNavLink, same ADMIN_EMAIL gate as the existing Admin Panel) showing active
   listings, total listings ever, registered members, items sold, featured-upgrade count,
   buyer messages sent, a category breakdown, and a recently-sold list — all live from
   Supabase. Traffic/reach deliberately links out to Google Analytics instead of trying to
   embed it (can't safely pull GA data into public client-side code).

**UNRESOLVED as of last check — the $7-default bug (fix #2 above):** the user tested the
live site *after* commit `94ccf34` was confirmed "Published" on Netlify (checked the actual
deployed `index.html` file directly via Netlify's deploy file browser — it has the correct
fix in it), tested in a fresh Incognito window (rules out browser cache), and **still saw
$7 pre-selected on the live site.** Ruled out so far: browser cache, the deployed file
itself, DNS/Cloudflare (this domain has no Cloudflare involvement — see helipadusa's
CLAUDE.md, Cloudflare is that site only), duplicate markup elsewhere in the file, a stale
service worker (none exists in this repo). Suggested next step that wasn't confirmed done
yet: Netlify Deploys page → "Trigger deploy" dropdown → **"Clear cache and deploy site"**
(a harder cache-bust than a normal deploy). If a future session hits this same "code is
right but the live site is wrong" wall again, start there, and also consider asking the user
to check Netlify's own Post-processing/asset-optimization settings (Project configuration →
Build & deploy) for anything that could rewrite HTML after build.

**Requested but NOT YET STARTED:** a bulk email tool for marketing to all registered
members, using the user's existing Resend account. Useful context already on hand:
- Resend is already DNS-configured for this exact domain (see "DNS / domain facts" above —
  `resend._domainkey`, SPF, `send` MX to `feedback-smtp.us-east-1.amazonses.com`) but not
  yet confirmed to be *called* anywhere in this repo's code.
- This needs a server-side piece (a Netlify serverless function), since a Resend API key
  must never be embedded in this site's public client-side code the way SUPABASE_KEY is
  (that one's meant to be public — an anon key — Resend's is not).
- Will need the user to add a `RESEND_API_KEY` environment variable in Netlify (from their
  Resend account dashboard) before it can actually send anything.
- Recipient list should come from the `users` table (same one the Business Dashboard's
  member count reads from).
