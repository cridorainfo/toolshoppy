# ToolShoppy — Claude Code Instructions

## Project
Building toolshoppy.com — a global free utility tool platform.
Competitor: iLovePDF, Smallpdf, SmallPDF.
Goal: Beat them on UX, speed, privacy, and India/Gulf localisation.

## Folder
`C:\Users\Lagari A\Desktop\IDEAS\toolshoppy`

## Core Rules for Every File You Build

1. **Pure static HTML/CSS/JS** — no React, no Node, no build step
2. **Client-side only** — files must never leave the user's browser
3. **Mobile-first** — design for 375px width first, scale up
4. **SEO on every page** — full meta tags, OG tags, structured data (WebApplication schema)
5. **Ad slots on every tool page** — 4 placements: top leaderboard, right sidebar, in-content, sticky footer mobile
6. **Trust badge on every tool** — "🔒 Your files never leave your device"
7. **Performance** — target 95+ Lighthouse, no external fonts, lazy load images
8. **No signup, no login, no email required** — ever

## Design System

```css
:root {
  --primary: #6366F1;
  --primary-dark: #4F46E5;
  --accent: #F59E0B;
  --success: #10B981;
  --bg: #F8FAFC;
  --card: #FFFFFF;
  --text: #1E293B;
  --text-muted: #64748B;
  --border: #E2E8F0;
  --shadow: 0 1px 3px rgba(0,0,0,0.08);
  --radius: 12px;
}
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

## Ad Slot Template (paste in every tool page)

```html
<!-- Ad: Top Leaderboard -->
<div class="ad-slot ad-top">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXX" data-ad-format="auto" data-full-width-responsive="true"></ins>
</div>

<!-- Ad: Sidebar Rectangle -->
<div class="ad-slot ad-sidebar">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXX" data-ad-format="rectangle"></ins>
</div>

<!-- Ad: Sticky Footer Mobile -->
<div class="ad-slot ad-sticky-footer">
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="XXXXXXXX" data-ad-format="auto"></ins>
</div>

<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

## SEO Template (paste in every tool page)

```html
<title>[Tool Name] Free Online — No Signup | ToolShoppy</title>
<meta name="description" content="[Tool description]. 100% free, no signup, files never leave your device. Works on mobile.">
<link rel="canonical" href="https://toolshoppy.com/tools/[path]/">
<meta property="og:title" content="[Tool Name] — ToolShoppy">
<meta property="og:description" content="[Tool description]">
<meta property="og:image" content="https://toolshoppy.com/assets/img/og-[tool].jpg">
<meta property="og:url" content="https://toolshoppy.com/tools/[path]/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "[Tool Name]",
  "url": "https://toolshoppy.com/tools/[path]/",
  "description": "[Description]",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
</script>
```

## Build Order

### Session 1 — Build this first:
`index.html` — Homepage with tool grid

### Session 2:
`tools/image/compress/index.html` — Image compressor (exact KB targeting)

### Session 3:
`tools/image/govt-photo/index.html` — Govt form photo resizer (PSC/UPSC/PAN presets)

### Session 4:
`tools/image/convert/index.html` — Image format converter (HEIC→JPG etc.)

### Session 5:
`tools/rates/gold-rate/index.html` — Kerala + India + UAE gold rate

### Sessions 6–10:
PDF suite (merge, compress, split, image-to-pdf, pdf-to-image)

## File Naming Convention
- All lowercase, hyphens not underscores
- Each tool is `tools/[category]/[tool-name]/index.html`
- Assets in `/assets/css/`, `/assets/js/`, `/assets/img/`

## What NOT to do
- No jQuery (vanilla JS only)
- No Bootstrap (custom CSS only)
- No React/Vue/Angular
- No server-side code
- No file upload to any server
- No popups or interstitials (AdSense policy)
- No video downloader tools (copyright / AdSense ban risk)
