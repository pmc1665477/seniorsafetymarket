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

**seniorsafetymarket.com's DNS still points at Hostinger** — the domain has not been
switched over to Netlify yet. Until that happens, the live domain is still served by the old
Hostinger setup; the Netlify version above is fully working and proven (real listing pages
confirmed rendering correctly with live data) but only reachable at the netlify.app address
until DNS is switched. That's the one remaining step to actually retire Hostinger for this
site.

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

- **DNS cutover not done yet** (see above) — seniorsafetymarket.com itself still resolves to
  Hostinger, not the new Netlify setup, as of 2026-08-12.
- Those old `FTP_PASSWORD` / `FTP_SERVER` / `FTP_USERNAME` GitHub Actions secrets are
  leftover from the abandoned Hostinger-FTP automation attempt — harmless, safe to ignore or
  delete, not used by anything anymore.
- Same shared risk as helipadusa.com: the user's Supabase org is on the free tier, and
  free-tier projects auto-pause after 7 days of inactivity. Now more important than before,
  since both the daily cron AND the instant webhook depend on this Supabase project being
  reachable.
