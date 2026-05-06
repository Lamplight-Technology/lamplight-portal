# 02 — Meta, SEO, Favicon

> Read [`HANDOFF.md`](../../HANDOFF.md) §1–§3 first.

## Goal

`client/index.html` is currently bare-bones (no `<title>`, no description, no favicon, no OG tags). When `https://llt.llc/` is shared in Slack/LinkedIn/email, the unfurl shows nothing. Fix that.

## Tasks

### 1. Update `client/index.html`

Replace `<head>` with:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />

  <title>Lamplight Technology — SaaS Platforms, AI Automation, Built with Purpose</title>
  <meta name="description" content="Lamplight builds and operates SaaS platforms for growing businesses, camps, ministries, and nonprofits — and helps teams adopt AI where it actually moves the needle." />
  <meta name="theme-color" content="#0f172a" />

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

  <!-- OpenGraph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://llt.llc/" />
  <meta property="og:title" content="Lamplight Technology — SaaS Platforms, AI Automation, Built with Purpose" />
  <meta property="og:description" content="Lamplight builds and operates SaaS platforms and helps teams adopt AI where it actually moves the needle. Grounded in integrity, humility, purpose, and values." />
  <meta property="og:image" content="https://llt.llc/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Lamplight Technology" />
  <meta name="twitter:description" content="SaaS platforms, AI automation, built with purpose." />
  <meta name="twitter:image" content="https://llt.llc/og-image.png" />
</head>
```

### 2. Drop static assets in `client/public/`

Vite serves files from `client/public/` at the site root. Place:

- **`client/public/favicon.svg`** — the lamp-flame logo as an SVG. If the original isn't present in the repo, generate a minimal placeholder using the brand flame color `#fbbf24` on transparent. Flag in your final report that the real asset needs to be dropped in.
- **`client/public/apple-touch-icon.png`** — 180×180 PNG of the same.
- **`client/public/og-image.png`** — 1200×630 social card. Generate one programmatically (e.g. via a small Node script using `@vercel/og` or `satori`, or a static SVG-to-PNG conversion) showing "Lamplight Technology" + tagline "From Idea to Impact" on the brand gradient (`#0f172a → #1e3a8a → #312e81`). If you can't generate it cleanly in this session, drop a placeholder and clearly flag that Todd needs to replace it before sharing the URL.

### 3. Add `client/public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://llt.llc/sitemap.xml
```

### 4. Add `client/public/sitemap.xml`

Static XML listing the public routes:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://llt.llc/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
  <url><loc>https://llt.llc/about</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://llt.llc/platforms</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://llt.llc/contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://llt.llc/careers</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://llt.llc/legal/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://llt.llc/legal/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://llt.llc/legal/cookies</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://llt.llc/legal/support</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
```

## Acceptance

- [ ] Browser tab on `https://llt.llc/` shows the new title.
- [ ] `view-source` includes description, OG, and Twitter meta tags.
- [ ] `/favicon.svg`, `/apple-touch-icon.png`, `/og-image.png`, `/robots.txt`, `/sitemap.xml` all return 200 after deploy.
- [ ] Pasting `https://llt.llc/` into a Slack message renders an unfurled card with image and description.
- [ ] Pasting into LinkedIn or X shows the same.
- [ ] `npm run check` passes.

## Notes / flag in final report

- Whether `og-image.png`, `favicon.svg`, and `apple-touch-icon.png` are real brand artwork or placeholders.
- If placeholders, list exactly what Todd needs to replace.
