# Lamplight Portal — Handoff

This is the master handoff for the website-repositioning work in flight on `llt.llc`. Read this file end-to-end first, then execute the task files under [`docs/handoff/`](./docs/handoff/) in numbered order.

**Live site:** https://llt.llc/
**Neon project:** `lamplight-portal` (id `plain-glitter-74618815`, org `org-round-salad-45563483`)
**Stack:** Vite + React 18 + wouter + TanStack Query + react-hook-form + Zod, Express server, Drizzle ORM on Neon Postgres, Stytch auth, shadcn/ui (Radix + Tailwind).

---

## 1. State of the world (already done — do NOT redo)

### Database (Neon — already applied)

In `companies` (id=1):
- `hero_title` = `Empowering Businesses`
- `hero_title_highlight` = `Through Purposeful Technology`
- `hero_description` = SaaS-forward subhead leading with "Lamplight builds and operates SaaS platforms for growing businesses, camps, ministries, and nonprofits…"
- `about_title` = `Purpose-Built Technology`
- `about_description` = Holding-company portfolio paragraph
- `about_pull_quote` = `Grounded in integrity, humility, purpose, and values.` *(new column)*
- `show_platforms` = `true` (was false)
- `platforms_description` = `AnchorPoint is live today. More platforms across our portfolio are in active development.`

In `about_feature_cards`:
- "Innovation First" was renamed to "Principled Engineering" with new copy.

In `platforms`:
- New column `coming_soon BOOLEAN DEFAULT false`.
- AnchorPoint (id=9): `is_active=true, coming_soon=false`.
- Yardly, TableView, TenantWise, MechanicFlow, MultiBooks, OneShotCV: `is_active=true, coming_soon=true`.
- `sort_order` deduplicated; OneShotCV moved to 8.

### Code already edited in the repo

- `shared/schema.ts` — added `aboutPullQuote` on `companies`, `comingSoon` on `platforms`.
- `client/src/components/platform-card.tsx` — renders Coming Soon badge + "In Development" indicator when `comingSoon === true`.
- `client/src/App.tsx` — placeholder routes `/about`, `/platforms`, `/contact` rendering `Home` (the `/about` route gets repointed at the new About page in [01-about-page-wireup.md](./docs/handoff/01-about-page-wireup.md)).
- `client/src/pages/home.tsx` — pathname-based auto-scroll on mount; values pull-quote rendered beneath pillar cards.
- `client/src/pages/not-found.tsx` — polished public 404.
- `client/src/components/footer.tsx` — dynamic year + values tagline.
- `client/src/pages/about.tsx` — **dedicated About page draft already written** (What We Do / How We Work / Our Why / CTA). Not yet wired to a route.
- `package.json` — added `"resend": "^4.0.0"` to dependencies (run `npm install` after pull).

---

## 2. The repositioning principle (immutable)

Faith lives at the **operating-ethos layer**, not the **audience layer**. The homepage reads as a credible SaaS holding company in operator voice; the About page is where faith is stated explicitly. Don't reintroduce faith framing into the homepage hero or audience descriptors. The line *"Our faith shapes our character, not our customer list"* on the About page is the load-bearing sentence — don't paraphrase it.

---

## 3. What's blocking the live site

All section 1 code changes are sitting in the repo waiting for a frontend redeploy. The DB-driven changes (hero, about copy, Principled Engineering, platforms section enabled) are already live. The 6 Coming Soon platforms currently render as live "Launch" links going to half-built sites because the deployed code doesn't yet know about `comingSoon`. **Deploy is the most urgent action** — it converts those into proper Coming Soon tiles and lights up the polished 404, footer tagline, pull-quote, and the new About page.

---

## 4. Execution order

Do these in order. Each task lives in its own file with a complete spec, code snippets, and per-task acceptance criteria.

1. [`docs/handoff/01-about-page-wireup.md`](./docs/handoff/01-about-page-wireup.md) — Wire the existing About page draft to the `/about` route + add a "Learn more" link from the homepage.
2. [`docs/handoff/02-meta-seo-favicon.md`](./docs/handoff/02-meta-seo-favicon.md) — Add `<title>`, meta description, OpenGraph/Twitter tags, favicon, OG image, robots.txt, sitemap.xml.
3. [`docs/handoff/03-admin-coming-soon-toggle.md`](./docs/handoff/03-admin-coming-soon-toggle.md) — Add a `comingSoon` Switch to the admin platform form.
4. [`docs/handoff/04-contact-form-resend.md`](./docs/handoff/04-contact-form-resend.md) — Replace the `mailto:` button with a real form. Backend = Express route + Resend email service + new `contact_submissions` table.
5. [`docs/handoff/05-careers-and-insights.md`](./docs/handoff/05-careers-and-insights.md) — Lightweight Careers page (so the form's Careers dropdown option doesn't dead-end) and an Insights stub.

After all tasks pass [`docs/handoff/acceptance.md`](./docs/handoff/acceptance.md), deploy.

---

## 5. Common preflight (do once)

```bash
cd "F:\Development\Lamplight Software\Lamplight Portal\lamplight-portal"
npm install
npm run db:push   # applies aboutPullQuote + comingSoon columns from schema.ts (already in DB; harmless)
npm run check     # tsc — must pass at every step before moving on
```

`npm run check` should pass before AND after each task in order. If it fails after a change, fix before continuing.

---

## 6. Tone guardrails for any new copy

- Operator voice. SaaS-credible.
- Faith goes on the About page, not in marketing taglines.
- Don't say "faith-based and traditional businesses" anywhere.
- Don't paraphrase "Grounded in integrity, humility, purpose, and values." — it's already calibrated.
- Footer tagline is "Built with purpose. Operated with integrity." Leave it.
- The line "Our faith shapes our character, not our customer list." is load-bearing. Don't soften, don't qualify, don't move.

---

## 7. Out of scope for this session

- Replacing placeholder OG/favicon assets with final brand artwork (Todd will hand off real PNGs).
- Real AnchorPoint case study and Insights posts (need Todd's source content).
- Persistent rate-limiting (in-memory is fine for single-instance deployment).
- Admin UI for browsing contact submissions (admins can query Neon directly for now).
- Stytch SSO changes, billing, anything outside the marketing site.

---

## 8. Things Todd must do manually

These can't be done by Claude Code and should be flagged in the final report:

- **Verify `llt.llc` as a sending domain in Resend** — add the SPF/DKIM/DMARC DNS records Resend generates. Without this, contact-form emails will silently bounce.
- **Set `RESEND_API_KEY` in the deployment environment.** The codebase reads from env; the actual key has to be set wherever the app is hosted.
- **Replace placeholder OG/favicon assets** with final brand artwork once available.
- **Provide source content** for the AnchorPoint case study and 1–2 Insights posts.
