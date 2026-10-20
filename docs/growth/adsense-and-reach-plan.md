# AdSense approval + reach plan (20 Oct 2026)

Approval is Google's decision; nobody can guarantee it. This plan removes every blocker that
can be found from the site itself, and lists the steps only you can do in Google's dashboards.

## 1. Where things stand (evidence)

| Signal | Value | Source |
|---|---|---|
| Users (90 days) | 347 (+555%), all current visitors in the UAE | GA4 home screenshot, 20 Oct |
| Key events | 0 (nothing is marked as a conversion) | GA4 |
| Indexed pages | 72 indexed, 55 not indexed (17 Aug) | Search Console export in repo |
| Search impressions | ~40/day in July → ~300/day mid-August | same |
| Not-indexed reasons | 27 alternate-with-canonical, 15 discovered-not-indexed, 10 redirects, 2×404, 1 redirect error | same |
| AdSense | Not approved as of the last note (19 Jul). Current status unknown to this analysis. | memory notes |
| ads.txt | present and correct (`pub-1180208702657280`) | live + repo |

## 2. Blockers found, and what was done

`npm run audit:adsense` reproduces these numbers.

| # | Finding | Why it matters to a reviewer | Status |
|---|---|---|---|
| 1 | 143 of 144 pages had **no link to About / Contact / Privacy / Terms** in the footer | Reviewers expect clear navigation and reachable policy pages on every page | **Fixed**: footer on every page |
| 2 | 28 Kerala **district rate pages** (gold + silver): ~230 words each, ~90% identical across districts, rate loaded by JavaScript ("Loading live rates…"), and their own FAQ says the rate equals the Kerala rate | Template-spun thin pages = "low value content" risk for the whole site, and Google declines to index them anyway | **Fixed**: `noindex, follow`, no ads, out of the sitemap (144 → 116 URLs). Reversible: `scripts/lib/page-policy.mjs` |
| 3 | Rate pages showed no numbers in the HTML | Crawlers don't run the page's JavaScript, so the page looked empty | **Fixed**: server renders today's live figures into the HTML (only live, <36h old data; otherwise nothing) |
| 4 | Ads on link-hub pages and legal pages (136–260 words) | "Screens without publisher content" | **Fixed**: no ads on category hubs, About, Contact, Privacy, Terms, blog index, 404 |
| 5 | Privacy policy lacked the third-party-vendor / Google partner-sites wording and EEA/UK consent wording | AdSense requires the vendor-cookie disclosure | **Fixed** (privacy page, section 6) |
| 6 | AdSense script was moved out of the HTML `<head>` for speed | Safest for review is the standard snippet in raw HTML on every ad page | **Reverted for the review period** (`static` mode). After approval: `node scripts/apply-page-policy.mjs deferred` |
| 7 | Ad `<ins>` elements were 0px wide (flex bug) | Responsive ads never rendered or filled | **Fixed** |
| 8 | Top/bottom/sticky ads were fully responsive "auto" (250–400px tall on phones) | Pushes content down (an above-the-fold policy risk) and causes layout shift | **Fixed**: horizontal banner format; slots AdSense can't fill collapse |

Still open (needs you or a decision):

* **Who runs the site.** About has no named owner. Reviewers and users trust a real person or company.
  A "Built by Lagari A., mechatronics engineer, Dubai" line with a link to the portfolio would help
  and is a backlink. Only add it if you want your name on the site.
* **Source attribution for rates.** Rates come from Goodreturns, DahabPulse, gold-api and Frankfurter.
  Facts aren't copyrightable, but "scraped content" is a policy topic. Keep visible source credit, and
  add original value around the numbers (history, explanations, how to read a jeweller's bill).
* **Risky tool types.** The YouTube thumbnail downloader is the one most likely to be questioned
  (copyrighted images). CLAUDE.md already bans video downloaders. Decide whether to keep it.
* **More original content.** Median blog post is ~550 words and there are 11 posts. Aim for 20+ posts of
  800–1,200 words with something only you have (tested results, screenshots, real form requirements).

## 3. Your steps, in order

1. **Deploy** (commit, push, wait for Railway). Then check `https://toolshoppy.com/ads.txt`, view-source on
   a tool page (the `adsbygoogle.js` tag should be in `<head>`) and `/privacy/`.
2. **AdSense → Sites.** Read the status of toolshoppy.com.
   * *Getting ready / Ready*: wait. Reviews usually take days to ~2 weeks.
   * *Requires attention / Needs attention*: open it, read the reason (e.g. "Low value content",
     "Navigation", "Policy violation"). Fix, then press **Request review**.
   * Check **Policy center** for any page-level violations.
3. **AdSense → Privacy & messaging.** Create and publish the "European regulations" message (Google's free,
   certified consent tool). Without it, ads to EEA/UK visitors are limited. Do this before you push for
   European traffic.
4. **Search Console.** Resubmit `sitemap.xml` (116 URLs). Inspect and "Request indexing" for the 8 new tool
   pages. Watch Pages → "Crawled/Discovered – currently not indexed"; thin pages should fall to
   "Excluded by noindex", which is intended.
5. **GA4 → Admin → Events:** mark `tool_use` as a key event, so you can see which tools people actually use.
6. **Never click your own ads** and never ask visitors to. It is the fastest way to a ban.

## 4. Reach: priorities

1. **Get the Gulf right first (it's where your users are).** Your audience is UAE-only today. Double down:
   AED/INR, Dubai gold, UAE VAT, passport/Emirates photo sizes, Arabic-speaking and Malayali/Indian
   expat communities. Arabic and Hindi pages are the biggest unbuilt lever (RTL + `hreflang`).
2. **Long-tail tool pages.** The new compress-to-20/50/100/200 KB pages and 8 tools target queries with
   weaker competitors. Add: PDF to JPG sizes, passport photo sizes by country, "photo size for X exam".
3. **Backlinks.** Work through `docs/growth/backlink-outreach-pack.md` (Product Hunt, directories,
   Reddit/Quora answers, exam forums). 10 genuine links beat 100 directory listings.
4. **Fresh, crawlable rate pages.** Now that the figures are in the HTML, Search Console will show whether
   "gold rate today" pages gain impressions. Keep them updated and credit the sources.
5. **Measure weekly** (10 minutes): GA4 users by country, Search Console queries/pages, indexed count.

## 5. After approval

* `node scripts/apply-page-policy.mjs deferred` (faster pages, AdSense loads on first interaction).
* Keep ad-free pages ad-free. Add ads to new tool pages only with real content on them.
* Recheck the layout (CLS) and ad fill on mobile in the AdSense and Search Console reports.
