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

**Hosting: Hostinger, via manual FTP upload — this is the important one.** Unlike
HelipadUSA (auto-rebuilds on Netlify) or AuthorRally (auto-deploys on push to Railway),
**this site does NOT update itself.** From `build/generate.js`:

> Deployment is manual (drag `dist/` into Hostinger File Manager) — automated FTP deploy
> from GitHub Actions was tried and abandoned because Hostinger blocks connections from
> GitHub's IPs.

That means: **new listings added in Supabase will not appear on the live site until someone
manually runs the build and manually uploads the result to Hostinger.** This is a real,
recurring manual chore, and it directly conflicts with the user's stated goal of not having
to come back and personally keep sites working. If the user wants this fixed, the options
are things like: moving hosting off Hostinger to something that supports automated deploys
(same pattern as helipadusa's Netlify setup), or setting up a recurring reminder for the
manual step. Don't just assume it updates on its own — verify with the user when the last
manual deploy happened if freshness matters for whatever they're asking about.

## Known open questions

- Exactly how often the user manually redeploys this site is unknown — ask rather than
  assume the live site reflects the latest Supabase data.
- Same shared risk as helipadusa.com: the user's Supabase org is on the free tier, and
  free-tier projects auto-pause after 7 days of inactivity. If this project pauses, the
  *next manual rebuild* would fail (or serve stale/empty listings) until someone notices
  and resumes it in the Supabase dashboard.
