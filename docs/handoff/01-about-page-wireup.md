# 01 — About Page Wire-up

> Read [`HANDOFF.md`](../../HANDOFF.md) §1–§3 first.

## Goal

The dedicated About page (`client/src/pages/about.tsx`) is already written. Two small wire-up edits make it the destination of the `/about` route and add a "Learn more" link from the homepage.

## Tasks

### 1. Repoint the `/about` route

In `client/src/App.tsx`, replace the placeholder `/about` route (currently rendering `Home`) with the new About page:

```tsx
import AboutPage from "@/pages/about";
// …
<Route path="/about" component={AboutPage} />
```

Keep `/platforms` and `/contact` rendering `Home` (anchor scrolls).

### 2. Update the homepage scroll `useEffect`

In `client/src/pages/home.tsx`, the `useEffect` that reads `window.location.pathname` and auto-scrolls currently includes `/about`. Remove that entry — `/about` no longer renders Home. Leave `/platforms` and `/contact`.

### 3. Add a "Learn more" link to the homepage About section

Still in `client/src/pages/home.tsx`, at the bottom of the Purpose-Built Technology section (just inside the closing `</section>`, after the values pull-quote `<div>`), add:

```tsx
<div className="mt-12 text-center">
  <Link
    href="/about"
    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
    data-testid="link-about-more"
  >
    Learn more about Lamplight
    <ArrowRight className="h-4 w-4" />
  </Link>
</div>
```

Add `import { Link } from "wouter";` and `import { ArrowRight } from "lucide-react";` if not already imported.

## Acceptance

- [ ] `https://llt.llc/about` (after deploy) renders the dedicated About page, not a homepage scroll.
- [ ] All four sections render: hero, What We Do, How We Work, Our Why with the *"Our faith shapes our character, not our customer list"* line intact, and the CTA section.
- [ ] "Learn more about Lamplight" link on the homepage navigates to `/about` (not a scroll-to-anchor).
- [ ] `npm run check` passes.
- [ ] Mobile layout at ~375px is clean.

## Notes

- The About page already imports its own `Navigation` and `Footer`, so it stands alone — no wrapping needed.
- The CTA buttons at the bottom of the About page link to `/contact` and `/platforms` via wouter `<Link>`. Those routes still render Home with a scroll; that's fine.
