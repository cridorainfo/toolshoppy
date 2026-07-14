# ToolShoppy — Development Master Plan
> Your one-stop shop for every free tool on the internet.
> **Domain:** toolshoppy.com | **Stack:** Static HTML/CSS/JS + Cloudflare Pages

---

## 🎯 Vision

ToolShoppy is a globally accessible, ad-funded free utility platform targeting:
- General internet users worldwide
- Indian diaspora (UAE, Saudi, Kuwait, Qatar, UK, US)
- Kerala / South India audience (regional SEO wedge)
- Government job applicants (PSC, UPSC, SSC)
- WhatsApp-first mobile users across Asia and Africa

**Positioning:** iLovePDF + Smallpdf + Google Tools — but fully free, faster, private (client-side), and built with India & the Gulf in its DNA.

---

## 📈 Trend-Driven Priorities (Google Trends analysis, Jul 2026)

Analysis of a Google Trends export (8 keyword clusters, UAE-weighted search profile) surfaced tool gaps with real, current search demand. This drove the roadmap changes below — see full reasoning inline in Build Priority and Keyword Clusters sections.

**New tools added to the roadmap (previously zero coverage):**
1. **PDF ⇄ Word Converter** (`word-to-pdf`, `pdf-to-word`) — the single largest untapped cluster in the data (`word to pdf free` interest 48, `pdf to word free` 47, plus dozens of "ilovepdf ___ to word" variants growing 20–30%). Build: Word→PDF via `mammoth.js` (docx→HTML) + `pdf-lib`/print-to-PDF; PDF→Word via `pdf.js` text extraction + `docx` library to rebuild a `.docx`.
2. **Free PDF Editor (annotate)** — sustained 90–100 interest scores on "free online pdf editor" / "editor pdf online free" / "pdf editor free online" — some of the highest raw scores in the entire dataset. Scope as a canvas-overlay annotator on `pdf.js` render + `pdf-lib` save (add text, shapes, signature, redact, reorder/delete pages) — not a full WYSIWYG text editor, which isn't feasible client-side-only.
3. **Unlock PDF / Remove Password** — pairs with the already-live PDF Password Protect tool; reuses `pdf-crypt.js` in reverse (decrypt with known password). Small lift, ships fast.
4. **Image Upscaler / HD Enhancer** (lower priority) — smaller cluster (`image upscaler`, `hd image converter`, `4k image converter`, `enhance image`) — canvas resize + sharpen, marketed honestly as "HD Enhancer," not true AI upscaling.

**Reprioritization signals (tools already on roadmap):**
- **PDF Compress** trends harder than its Phase 2 slot suggested (`pdf file compression` 78, `compression pdf` 77) — now sequenced before Split / Image-to-PDF / PDF-to-Image.
- **Video Compressor** (Phase 5) shows some of the largest %-increases in the whole dataset (`best video compressor` +350%, `free video compressor` interest 95) — flagged for possible pull-forward if FFmpeg.wasm bandwidth cost is acceptable.
- **Silver Rate** trends almost as hard as Gold Rate in the UAE cluster (+250–300%) — should ship together, not as an afterthought.
- **Currency Converter** — confirmed Gulf↔India pairs as required presets: AED→INR, SAR→INR, KWD→INR, OMR→INR, USD→INR (each appears individually in the trends data).

**Enhancement, not a new tool:**
- **QR Generator** (already live) under-serves demand — trends show dynamic QR, vCard QR, WiFi/location QR, bulk QR, and "PDF to QR" as distinct high-growth searches. Add as modes on the existing tool.

**Ignored as noise:** brand/competitor terms (`microsoft word`, `google doc`, `adobe acrobat`, `canva`, `wise`, `xe`) and unrelated news/finance terms (`uae news`, `iran news`, `sensex`, `nifty 50`, `amazon uae`, `lidl near me`) — not actionable as tools.

---

## 🏗️ Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Hosting | Cloudflare Pages (free) | Global CDN, zero cost, unlimited bandwidth |
| Frontend | Vanilla HTML5 + CSS3 + JS (ES6+) | No build step, instant load, SEO-friendly |
| PDF Processing | pdf-lib.js + PDF.js (client-side) | Files never leave user device |
| Image Processing | browser-image-compression + Canvas API | 100% client-side, no server needed |
| Video/Audio | FFmpeg.wasm (client-side) | Local processing, no upload |
| Rates Data | Cloudflare Worker (cron) → JSON | Fetches gold/fuel/currency rates daily |
| SEO | Static HTML pages + structured data | No JS rendering needed for Google |
| Analytics | Cloudflare Web Analytics (free) + GA4 | Privacy-friendly + full funnel |
| Ads | Google AdSense + Ezoic + Media.net | Layered for max RPM |

---

## 💰 Revenue Architecture

### Layer 1 — Display Ads (Primary)
- **Google AdSense** — applied after 5 tools live + 10 content pages
- **Ezoic** — added at 10K+ visits/month (AI-optimized placement, 1.5–2x AdSense RPM)
- **Media.net** — Yahoo/Bing contextual, added as secondary network
- **Ad placement strategy:**
  - 1 leaderboard (728×90) above tool area
  - 1 rectangle (300×250) inside right sidebar
  - 1 in-content unit between tool steps
  - 1 sticky footer (mobile) — highest mobile CTR
  - Never interrupt tool workflow — ads around, not inside

### Layer 2 — Affiliate (High CPM pages)
- **Finance pages (Gold rate, EMI, Currency):**
  - BankBazaar affiliate — ₹500–2,000 per loan/card lead
  - Paisabazaar affiliate — same
  - Wise / Remitly affiliate — $5–15 per remittance signup (Gulf audience)
  - Digital gold platforms (Jar, SafeGold) — gold rate page
- **Amazon Associates** — photo paper on passport photo tool, accessories on sticker maker

### Layer 3 — Direct Sponsorships (Month 6+)
- Gold jewellers / NBFC gold loan companies on gold rate page
- Exchange houses on currency converter page (UAE market)
- Flat monthly fee ₹10,000–50,000 per sponsor

### Layer 4 — Pro Tier (Month 9+)
- ₹99/month or $2.99/month
- Unlimited batch processing (50 files at once)
- No ads
- Priority processing
- Larger file size limits
- Implemented via Stripe / Razorpay

### Layer 5 — B2B API (Year 2)
- Akshaya centres, CSC franchises, job-application cafés
- ₹299–499/month per outlet for unlimited use
- White-label embed widget for third-party websites

---

## 🗂️ Project Structure

```
toolshoppy/
├── index.html                  # Homepage — tool grid + hero
├── sitemap.xml                 # Auto-generated, submitted to GSC
├── robots.txt
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker (offline support)
├── ads.txt                     # AdSense / Ezoic verification
├── assets/
│   ├── css/
│   │   ├── main.css            # Global styles + CSS variables
│   │   ├── tools.css           # Tool UI components
│   │   └── responsive.css      # Mobile-first breakpoints
│   ├── js/
│   │   ├── core.js             # Shared utilities
│   │   ├── ads.js              # Ad loading + lazy init
│   │   └── analytics.js        # GA4 + event tracking
│   ├── img/
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── og-image.jpg        # 1200×630 for social sharing
│   └── libs/                   # Vendor JS (local copies)
│       ├── pdf-lib.min.js
│       ├── pdf.min.js
│       ├── browser-image-compression.min.js
│       └── ffmpeg.min.js
├── tools/
│   ├── image/
│   │   ├── compress/index.html
│   │   ├── resize/index.html
│   │   ├── convert/index.html
│   │   ├── govt-photo/index.html
│   │   ├── background-remove/index.html
│   │   ├── passport-photo/index.html
│   │   ├── sticker-maker/index.html
│   │   └── upscale/index.html      # NEW — trends: image upscaler, hd converter
│   ├── pdf/
│   │   ├── merge/index.html
│   │   ├── word-to-pdf/index.html  # NEW — trends: word to pdf free (48)
│   │   ├── pdf-to-word/index.html  # NEW — trends: pdf to word free (47)
│   │   ├── compress/index.html
│   │   ├── editor/index.html       # NEW — trends: free online pdf editor (90-100)
│   │   ├── unlock/index.html       # NEW — pairs with live PDF Password Protect
│   │   ├── split/index.html
│   │   ├── image-to-pdf/index.html
│   │   └── pdf-to-image/index.html
│   ├── rates/
│   │   ├── gold-rate/index.html
│   │   ├── silver-rate/index.html
│   │   ├── petrol-price/index.html
│   │   └── currency-converter/index.html
│   ├── finance/
│   │   ├── emi-calculator/index.html
│   │   ├── income-tax/index.html
│   │   ├── salary-calculator/index.html
│   │   ├── gst-calculator/index.html
│   │   ├── sip-calculator/index.html
│   │   └── fd-calculator/index.html
│   ├── video/
│   │   ├── compress/index.html
│   │   ├── trim/index.html
│   │   ├── to-audio/index.html
│   │   └── status-splitter/index.html
│   └── misc/
│       ├── qr-generator/index.html
│       ├── word-counter/index.html
│       ├── age-calculator/index.html
│       ├── font-styler/index.html
│       └── whatsapp-link/index.html
├── blog/
│   ├── how-to-compress-image-for-psc/index.html
│   ├── how-to-merge-pdf-free/index.html
│   ├── kerala-gold-rate-today-explained/index.html
│   └── [30+ SEO articles]
└── _workers/
    └── rates-fetcher.js        # Cloudflare Worker — daily rate updates
```

---

## 🔨 Build Priority — Phase by Phase

### ✅ Phase 1 — Foundation (Week 1–2)
*Goal: AdSense approval + first 1,000 visitors*

| # | Tool | URL | Why First |
|---|---|---|---|
| 1 | Image Compressor (exact KB) | /tools/image/compress/ | Highest India search volume |
| 2 | Govt Form Photo Resizer | /tools/image/govt-photo/ | PSC/UPSC/PAN presets, zero competition |
| 3 | Image Converter | /tools/image/convert/ | Universal, HEIC→JPG massive iOS demand |
| 4 | Image Resizer | /tools/image/resize/ | Catches separate keyword cluster |
| 5 | Gold Rate Today | /tools/rates/gold-rate/ | Daily repeat visitors from day 1 |

**+ 10 SEO blog articles targeting Indian govt form keywords**
**→ Apply for AdSense**

### 📋 Phase 2 — PDF Suite (Week 3–4)
*Reordered per Google Trends analysis — word/PDF conversion and PDF editing outrank split/image-to-pdf*

| # | Tool | URL | Why |
|---|---|---|---|
| 6 | PDF Merge | /tools/pdf/merge/ | |
| 7 | 🔥 Word to PDF | /tools/pdf/word-to-pdf/ | NEW — highest untapped search volume in trends data |
| 8 | 🔥 PDF to Word | /tools/pdf/pdf-to-word/ | NEW — same cluster, heavy "ilovepdf" brand-search overlap |
| 9 | PDF Compress | /tools/pdf/compress/ | Moved up — trends harder than Split (interest 74-78) |
| 10 | 🔥 Free PDF Editor (annotate) | /tools/pdf/editor/ | NEW — highest single interest scores in dataset (90-100) |
| 11 | Unlock PDF | /tools/pdf/unlock/ | NEW — pairs with live PDF Password Protect, small lift |
| 12 | PDF Split | /tools/pdf/split/ | |
| 13 | Image to PDF | /tools/pdf/image-to-pdf/ | |
| 14 | PDF to Image | /tools/pdf/pdf-to-image/ | |

### 📊 Phase 3 — Rates & Finance (Week 5–6)
| # | Tool | URL | Why |
|---|---|---|---|
| 15 | Petrol/Diesel Price | /tools/rates/petrol-price/ | |
| 16 | Currency Converter | /tools/rates/currency-converter/ | Presets: AED/SAR/KWD/OMR→INR confirmed by trends |
| 17 | EMI Calculator | /tools/finance/emi-calculator/ | |
| 18 | Income Tax Calculator | /tools/finance/income-tax/ | |
| 19 | Salary Calculator | /tools/finance/salary-calculator/ | |
| 20 | Silver Rate | /tools/rates/silver-rate/ | Ship with Gold Rate — trends almost as strong (+250-300%) |

### 📱 Phase 4 — Viral/Social (Week 7–9)
| # | Tool | URL |
|---|---|---|
| 21 | WhatsApp Sticker Maker | /tools/image/sticker-maker/ |
| 22 | Passport Photo Maker | /tools/image/passport-photo/ |
| 23 | Fancy Font Generator | /tools/misc/font-styler/ |
| 24 | YouTube Thumbnail Grabber | /tools/misc/yt-thumbnail/ |
| 25 | WhatsApp Status Splitter | /tools/video/status-splitter/ |
| 26 | Background Remover | /tools/image/background-remove/ |

### 🎬 Phase 5 — Video/Audio (Week 10–12)
*Candidate to pull forward — trends show some of the largest %-increases in the dataset*

| # | Tool | URL |
|---|---|---|
| 27 | Video Compressor | /tools/video/compress/ |
| 28 | Video Trimmer | /tools/video/trim/ |
| 29 | Video to MP3 | /tools/video/to-audio/ |
| 30 | Audio Cutter / Ringtone | /tools/misc/audio-cutter/ |

### 🔧 Phase 6 — Long Tail (Ongoing)
| # | Tool |
|---|---|
| 31 | Age Calculator |
| 32 | QR Code Generator |
| 33 | Word/Character Counter |
| 34 | GST Calculator |
| 35 | UAE VAT Calculator |
| 36 | SIP/FD/RD Calculator |
| 37 | Text to Handwriting |
| 38 | BMI Calculator |
| 39 | Time Zone Converter |
| 40 | Image Upscaler / HD Enhancer (NEW — trends: image upscaler, hd image converter) |

---

## 🎨 UI/UX Design System

### Design Philosophy
- **Speed first** — every tool loads under 2 seconds on 3G
- **Mobile first** — 70%+ of Indian traffic is mobile
- **Zero friction** — drag & drop, paste, one click. No signup, no login, no email
- **Trust signals** — "Files never leave your device" badge on every tool
- **Clean, not cluttered** — white space, clear CTAs, no dark patterns

### Color System
```css
:root {
  --primary: #6366F1;        /* Indigo — modern, global, trustworthy */
  --primary-dark: #4F46E5;
  --accent: #F59E0B;         /* Amber — energy, action buttons */
  --success: #10B981;        /* Green — completion states */
  --bg: #F8FAFC;             /* Off-white background */
  --card: #FFFFFF;
  --text: #1E293B;
  --text-muted: #64748B;
  --border: #E2E8F0;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --radius: 12px;
}
```

### Typography
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
/* Fallback stack covers all devices globally, no font load needed */
```

### Component Patterns
- **Tool Card:** Icon + Tool Name + 1-line description + "Use Free →" CTA
- **Drop Zone:** Large dashed border, animated on hover, paste-from-clipboard support
- **Progress Bar:** Inline, animated, shows compression/conversion progress
- **Result Panel:** Before/After comparison, file size saved badge, Download button
- **Trust Badge:** Lock icon + "Your files never leave your device" — sticky below tool
- **Ad Slots:** Clearly separated from tool UI, never inside workflow

### Mobile UX Rules
- Touch targets minimum 44×44px
- Bottom sheet for settings/options (not modal)
- Sticky "Download" button at bottom after processing
- No horizontal scrolling ever
- File picker opens native camera roll on mobile

---

## 🔍 SEO Strategy

### On-Page SEO (Every Tool Page)
```html
<!-- Required meta tags for every tool page -->
<title>[Tool Name] — Free Online Tool | ToolShoppy</title>
<meta name="description" content="[Action verb] [what it does] free online. No signup, no upload to server. Works on mobile. [Specific use case].">
<meta name="keywords" content="...">
<link rel="canonical" href="https://toolshoppy.com/tools/[category]/[tool]/">

<!-- Open Graph -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://toolshoppy.com/assets/img/og-[tool].jpg">
<meta property="og:url" content="...">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">

<!-- Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "[Tool Name]",
  "description": "...",
  "url": "https://toolshoppy.com/tools/.../",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

### Programmatic SEO Pages
Create location/variant pages automatically:
- `/tools/rates/gold-rate/kerala/` — Kerala gold rate today
- `/tools/rates/gold-rate/dubai/` — Dubai gold rate today
- `/tools/rates/petrol-price/[state]/` — all 28 Indian states
- `/tools/image/govt-photo/psc/` — Kerala PSC photo size
- `/tools/image/govt-photo/upsc/` — UPSC photo requirements
- `/tools/image/govt-photo/pan-card/` — PAN card photo size
- `/tools/image/passport-photo/india/` — India passport photo
- `/tools/image/passport-photo/uae/` — UAE passport photo
- `/tools/image/passport-photo/us/` — US passport photo

### Target Keyword Clusters

**Cluster 1 — Image (High volume India)**
- "compress image to 20kb online free"
- "compress image to 50kb for psc"
- "how to reduce image size in kb"
- "heic to jpg converter free"
- "resize image online free"

**Cluster 2 — PDF (Global)**
- "merge pdf free online"
- "compress pdf to 1mb free"
- "split pdf online free"
- "pdf to jpg converter free"

**Cluster 3 — Rates (Daily traffic)**
- "kerala gold rate today"
- "gold rate today india 22 carat"
- "dubai gold rate today"
- "petrol price today [state]"
- "aed to inr today"

**Cluster 4 — Finance (High CPM)**
- "emi calculator home loan"
- "income tax calculator 2025-26 new regime"
- "in hand salary calculator"
- "gst calculator online"

**Cluster 5 — Viral**
- "whatsapp sticker maker online free"
- "passport size photo maker online"
- "fancy text generator for instagram"
- "youtube thumbnail downloader"

**Cluster 6 — Word ⇄ PDF (from trends, largest untapped cluster)**
- "word to pdf free"
- "pdf to word free"
- "pdf to word online"
- "convert word to pdf online free"
- "pdf to word converter free online"

**Cluster 7 — PDF Editor (from trends, highest raw interest scores in dataset)**
- "free online pdf editor"
- "editor pdf online free"
- "online pdf editor free without login"
- "unlock pdf"

**Cluster 8 — Image Upscale/HD (from trends, smaller but zero-competition)**
- "image upscaler"
- "hd image converter"
- "4k image converter"
- "low to high resolution image converter"

---

## 🌍 Internationalization (i18n)

### Languages (Phase 2 onwards)
| Language | Market | Priority |
|---|---|---|
| English | Global, UAE, US, UK | Launch |
| Malayalam | Kerala, Gulf Malayalis | Month 2 |
| Hindi | Pan-India | Month 3 |
| Arabic | UAE, Saudi, Egypt | Month 6 |
| Tamil | Tamil Nadu, Sri Lanka, Singapore | Month 6 |

### Implementation
- URL structure: `/ml/tools/image/compress/` for Malayalam
- `hreflang` tags on all pages
- Translated meta titles and descriptions
- Tool UI labels translated (not tool logic)
- RTL support for Arabic (CSS `direction: rtl`)

---

## ⚡ Performance Targets

| Metric | Target | Tool |
|---|---|---|
| Lighthouse Performance | 95+ | Chrome DevTools |
| First Contentful Paint | < 1.2s | PageSpeed Insights |
| Time to Interactive | < 2.5s | WebPageTest |
| Core Web Vitals | All green | GSC |
| Mobile PageSpeed | 90+ | PSI |

### Performance Rules
- No external fonts (use system font stack)
- All images WebP format with lazy loading
- JS libraries loaded only on tool pages that need them
- CSS critical path inlined in `<head>`
- Service Worker caches tool pages for offline use
- Cloudflare caches everything at edge

---

## 📱 PWA (Progressive Web App)

Users can install ToolShoppy on their phone home screen:
```json
{
  "name": "ToolShoppy",
  "short_name": "ToolShoppy",
  "description": "Your one-stop shop for every free tool",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#6366F1",
  "icons": [
    { "src": "/assets/img/icon-192.png", "sizes": "192x192" },
    { "src": "/assets/img/icon-512.png", "sizes": "512x512" }
  ]
}
```

---

## 🔒 Privacy & Trust

### Key Trust Differentiators vs Competitors
| Feature | iLovePDF | Smallpdf | **ToolShoppy** |
|---|---|---|---|
| Files uploaded to server | ✅ Yes | ✅ Yes | ❌ Never |
| Free tier file size limit | 15MB | 5MB | **Unlimited** |
| Daily action limit | 2/day | Restricted | **Unlimited** |
| Ads on free tier | ✅ | ❌ (paywall) | ✅ (clean) |
| Regional language UI | ❌ | ❌ | ✅ Malayalam, Hindi |
| India-specific presets | ❌ | ❌ | ✅ PSC, UPSC, PAN |

### Privacy Page Claims (Legally accurate)
- "Your files are processed entirely in your browser"
- "No file ever touches our servers"
- "We don't store, read, or share your documents"
- "We use Google Analytics for anonymous traffic insights"

---

## 📣 Marketing & Growth

### Month 1–2 (Zero budget)
- Submit to Google Search Console on day 1
- Submit sitemap.xml immediately
- Share in Kerala Facebook groups (PSC preparation groups have 500K+ members)
- Share in NRI WhatsApp groups (Gold rate page is perfect for this)
- Post on Reddit: r/india, r/Kerala, r/IndiaInvestments (gold rate)
- Quora answers for "how to compress image for PSC"

### Month 3–6
- YouTube Shorts: "Compress image to 20KB in 10 seconds" — no voiceover, just screen recording
- Instagram Reels same content
- WhatsApp forward-worthy content tied to tool (daily gold rate card image)

### Month 6+
- Google Ads on high-CPM finance keywords (self-funded from AdSense revenue)
- Influencer tie-ups with Kerala YouTube channels

---

## 🚀 Deployment

### Cloudflare Pages Setup
```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial ToolShoppy build"
git remote add origin https://github.com/yourusername/toolshoppy
git push -u origin main

# 2. Connect to Cloudflare Pages
# Dashboard → Pages → Create Project → Connect GitHub → Deploy

# 3. Custom domain
# Add toolshoppy.com → DNS → CNAME → pages.dev
# SSL is automatic
```

### Cloudflare Worker (Rates Fetcher)
```javascript
// _workers/rates-fetcher.js
// Runs daily at 6:00 AM IST
// Fetches gold, silver, petrol, currency rates
// Writes to KV store → served as /api/rates.json
// Tool pages read this JSON — no API call from browser
```

---

## 📊 Analytics & KPIs

### Track from Day 1
- Page views per tool (GA4)
- Tool completion rate (did they download?)
- Ad click-through rate (AdSense dashboard)
- Top landing pages (GSC)
- Keyword positions (GSC)
- Core Web Vitals (GSC)

### Monthly Targets
| Month | Visitors | Revenue |
|---|---|---|
| 1 | 2,000–5,000 | ₹500–2,000 |
| 2 | 10,000–20,000 | ₹2,000–8,000 |
| 3 | 30,000–50,000 | ₹8,000–20,000 |
| 6 | 150,000–300,000 | ₹50,000–1,50,000 |
| 12 | 500,000–1,000,000 | ₹2,00,000–5,00,000 |

---

## 🛠️ Claude Code Instructions

> Use these prompts with Claude Code to build each component

### Start Command
```
Open folder: C:\Users\Lagari A\Desktop\IDEAS\toolshoppy
```

### Build Order for Claude Code

**Session 1 — Homepage + Design System**
```
Build the ToolShoppy homepage (index.html) with:
- Global CSS variables in main.css (indigo/amber palette)
- Responsive header with logo and search
- Hero section: "Your one-stop shop for every free tool"
- Tool grid showing all 35 tools as cards with icons
- Footer with categories
- Mobile-first, 95+ Lighthouse score target
- No external dependencies except one Google Font fallback
```

**Session 2 — Tool #1: Image Compressor**
```
Build /tools/image/compress/index.html:
- Drag & drop + paste from clipboard + file picker
- Target KB input (20, 50, 100, 200, 500 presets + custom)
- Client-side compression using Canvas API
- Before/after file size display
- Download button
- "Files never leave your device" trust badge
- AdSense placeholder slots (top, sidebar, in-content)
- Full SEO meta tags targeting "compress image to 20kb free"
- Structured data WebApplication schema
```

**Session 3 — Tool #2: Govt Form Photo Resizer**
```
Build /tools/image/govt-photo/index.html:
- Preset buttons: Kerala PSC, UPSC, SSC, PAN Card, Aadhaar, Passport India, UAE Emirates ID, Passport UK, Passport US
- Each preset has: exact pixel dimensions, file size limit, background color requirement
- Upload → auto-crop to exact dimensions → download
- White/blue/red background option
- Client-side only using Canvas API
```

**Session 4 — Gold Rate Page**
```
Build /tools/rates/gold-rate/index.html:
- Reads from /api/rates.json (Cloudflare Worker output)
- Shows: 24K/22K/18K per gram in INR and AED
- Shows: per sovereign (8g) in INR
- Historical 7-day chart using Chart.js
- "Last updated" timestamp
- Affiliate banner: digital gold platforms
- Programmatic subpages for Kerala, Mumbai, Dubai
```

---

## 📁 Local Development

```bash
# No build step needed — pure static files
# Just open index.html in browser OR use live server

# VS Code Live Server extension recommended
# Or Python simple server:
cd "C:\Users\Lagari A\Desktop\IDEAS\toolshoppy"
python -m http.server 3000
# → http://localhost:3000
```

---

## ✅ Launch Checklist

- [ ] Homepage live on Cloudflare Pages
- [ ] 5 core tools working (Phase 1)
- [ ] 10 SEO blog articles published
- [ ] Google Search Console verified
- [ ] Sitemap submitted
- [ ] Google Analytics 4 connected
- [ ] Privacy Policy page live
- [ ] Terms of Service page live
- [ ] AdSense application submitted
- [ ] ads.txt file live at toolshoppy.com/ads.txt
- [ ] Core Web Vitals all green
- [ ] Mobile responsive tested on real device
- [ ] All tools tested: upload → process → download flow
- [ ] "Files never leave your device" badge on every tool
- [ ] Affiliate links added to gold rate + currency pages
- [ ] Shared in 3+ Kerala Facebook groups

---

## 📞 Key Resources

| Resource | URL |
|---|---|
| Cloudflare Pages | pages.cloudflare.com |
| Google Search Console | search.google.com/search-console |
| Google AdSense | adsense.google.com |
| Ezoic | ezoic.com |
| Media.net | media.net |
| BankBazaar Affiliate | bankbazaar.com/affiliate |
| Paisabazaar Affiliate | paisabazaar.com/affiliate |
| Wise Affiliate | wise.com/partners |
| pdf-lib.js | pdf-lib.js.org |
| browser-image-compression | www.npmjs.com/package/browser-image-compression |
| Chart.js | chartjs.org |
| Namecheap (domain renewal) | namecheap.com |

---

*Built by Lagari — UAE-based technologist, event production lead, and Kerala-at-heart entrepreneur.*
*ToolShoppy: Global reach. Indian soul.*
