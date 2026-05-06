# 05 — Careers & Insights (lightweight)

> Read [`HANDOFF.md`](../../HANDOFF.md) §1–§3 first.

## Goal

Two small placeholder pages so the site doesn't have dead-ends. The contact form's interest dropdown includes "Careers," so the Careers page must exist by the time the form ships. Insights is a longer-term content effort — for now, just a stub.

## Tasks

### 1. Careers page

Create `client/src/pages/careers.tsx`. Match the visual language of `pages/about.tsx` (same hero treatment, same CTA component, same `Navigation` and `Footer` import pattern).

Copy:

> # Careers at Lamplight
>
> *Always open to a conversation.*
>
> We're not running active recruiting right now, but we're always open to conversations with thoughtful people. If you're a builder who wants to work on software that serves the people using it — and who cares as much about how something is built as about whether it ships — reach out, even if it's just to introduce yourself.
>
> What we look for: people who do what they say they'll do, communicate clearly, take ownership of outcomes, and treat customers and teammates with respect. Roles are typically across software engineering, AI/ML, product, and operations.
>
> [Get in touch →]  (links to `/contact`)

Single primary CTA at the bottom that goes to `/contact`. No form on the Careers page itself — funnel everything through Contact so all submissions land in one queue.

In `client/src/App.tsx`:

```tsx
import CareersPage from "@/pages/careers";
// …
<Route path="/careers" component={CareersPage} />
```

In `client/src/components/footer.tsx`, add a "Careers" link to the Quick Links list (between "Our Platforms" and "Contact" feels right).

### 2. Insights stub

Create `client/src/pages/insights.tsx`. Same visual language as Careers/About.

Copy:

> # Insights
>
> *Coming soon.*
>
> We're putting together a small library of writing about how we think about AI adoption, building SaaS with integrity, and what we've learned operating multi-tenant platforms. If there's a topic you'd want us to cover, let us know.
>
> [Suggest a topic →]  (links to `/contact?interest=other` or just `/contact`)

In `client/src/App.tsx`:

```tsx
import InsightsPage from "@/pages/insights";
// …
<Route path="/insights" component={InsightsPage} />
```

**Do NOT add Insights to the main nav** — the nav should only show pages with real content. Add it only to the footer Quick Links.

### 3. Update sitemap

Add `/careers` and `/insights` to `client/public/sitemap.xml` if not already there from task 02.

## Acceptance

- [ ] `/careers` renders with the Careers copy and a CTA to `/contact`.
- [ ] `/insights` renders with the placeholder copy and a CTA to `/contact`.
- [ ] Careers link appears in the footer Quick Links.
- [ ] Insights link appears in the footer Quick Links but NOT in the main nav.
- [ ] Both pages match the visual language of the About page (same gradient hero, same Footer).
- [ ] Mobile layouts are clean.
- [ ] `npm run check` passes.

## Final report must flag

- AnchorPoint case study and 1–2 short Insights posts need source content from Todd. The page scaffolding is ready to receive content; a follow-up session can wire in the actual posts (DB-backed or MD-driven, his call).
- The Careers page assumes "no active recruiting" — if Todd wants to add active roles later, that's a separate scaffold.
